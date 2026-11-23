import { ReminderItem } from '../types/app';
import { getTodayDateStr } from './storage';
import { playReminderChime } from './speechAndSound';

export type PermissionStateLabel = NotificationPermission | 'unsupported';
export type NotificationChannel = 'in_app' | 'browser_local' | 'web_push';

export interface NotificationDispatchResult {
  inAppDelivered: boolean;
  browserDelivered: boolean;
  browserMethod: 'service_worker' | 'window_notification' | 'none';
}

export interface WebPushTransport {
  isSupported: () => boolean;
  isConfigured: () => Promise<boolean>;
  subscribe: (userId: string) => Promise<{ ok: boolean; message: string }>;
  unsubscribe: (userId: string) => Promise<{ ok: boolean }>;
}

/**
 * Modular Web Push adapter stub — keeps the push contract decoupled so
 * VAPID + backend push delivery can be plugged in later without touching
 * local reminders or UI components.
 */
export const modularWebPushTransport: WebPushTransport = {
  isSupported: () =>
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window,
  isConfigured: async () => false,
  subscribe: async () => ({
    ok: false,
    message: 'ლოკალური და ბრაუზერის შეხსენებები აქტიურია (Web Push არ არის საჭირო).',
  }),
  unsubscribe: async () => ({ ok: true }),
};

export function isBrowserNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): PermissionStateLabel {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionStateLabel> {
  if (!isBrowserNotificationSupported()) {
    return 'unsupported';
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

function isWithinQuietHours(nowMinutes: number, startStr: string, endStr: string): boolean {
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return false;
  const start = sh * 60 + (sm || 0);
  const end = eh * 60 + (em || 0);
  if (start <= end) {
    return nowMinutes >= start && nowMinutes < end;
  }
  return nowMinutes >= start || nowMinutes < end;
}

function parseHHMMToMinutes(hhmm: string): number | null {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m) || h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return h * 60 + m;
}

export function checkDueReminders(reminders: ReminderItem[], now = new Date()): ReminderItem[] {
  const todayStr = getTodayDateStr(now);
  const currentDay = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return reminders.filter((rem) => {
    if (!rem.enabled) return false;
    if (isWithinQuietHours(nowMinutes, rem.quietHoursStart, rem.quietHoursEnd)) return false;

    // Evaluate snoozed reminders before checking lastTriggeredDate so same-day snoozes always fire
    if (rem.snoozedUntil) {
      const snoozeTime = new Date(rem.snoozedUntil);
      return !Number.isNaN(snoozeTime.getTime()) && now >= snoozeTime;
    }

    if (rem.lastTriggeredDate === todayStr) return false;

    const dayAllowed =
      rem.repeat === 'daily' ||
      (rem.repeat === 'weekdays' && currentDay >= 1 && currentDay <= 5) ||
      (rem.repeat === 'weekends' && (currentDay === 0 || currentDay === 6)) ||
      rem.daysOfWeek.includes(currentDay);

    if (!dayAllowed) return false;

    const schedMinutes = parseHHMMToMinutes(rem.time);
    if (schedMinutes === null) return false;

    // 2-minute delivery window protects against interval drift or brief tab throttling
    return nowMinutes >= schedMinutes && nowMinutes <= schedMinutes + 1;
  });
}

export async function triggerBrowserNotification(
  rem: ReminderItem
): Promise<{ delivered: boolean; method: 'service_worker' | 'window_notification' | 'none' }> {
  if (getNotificationPermission() !== 'granted') {
    return { delivered: false, method: 'none' };
  }

  const title = `SmartLearn AI — ${rem.title}`;
  const options: NotificationOptions = {
    body: rem.description || 'სწავლისა და განვითარების დროა!',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `smartlearn-rem-${rem.id}`,
    data: { url: '/' },
  };

  // Prefer Service Worker showNotification (works on both desktop and mobile browsers without VAPID)
  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && typeof registration.showNotification === 'function') {
        await registration.showNotification(title, options);
        return { delivered: true, method: 'service_worker' };
      }
    } catch {
      // Fall through to window Notification constructor
    }
  }

  try {
    const notif = new Notification(title, options);
    notif.onclick = () => {
      try {
        window.focus();
        notif.close();
      } catch {
        // Ignore window focus restrictions
      }
    };
    return { delivered: true, method: 'window_notification' };
  } catch {
    return { delivered: false, method: 'none' };
  }
}

export async function dispatchReminderNotification(
  rem: ReminderItem,
  options: {
    globalSoundEnabled: boolean;
    onInAppToast?: (reminder: ReminderItem) => void;
  }
): Promise<NotificationDispatchResult> {
  if (options.onInAppToast) {
    options.onInAppToast(rem);
  }
  playReminderChime(rem.soundEnabled && options.globalSoundEnabled);
  const browserRes = await triggerBrowserNotification(rem);
  return {
    inAppDelivered: Boolean(options.onInAppToast),
    browserDelivered: browserRes.delivered,
    browserMethod: browserRes.method,
  };
}

export function createTestReminderItem(): ReminderItem {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return {
    id: `test_${Date.now()}`,
    title: 'სწავლის ტესტ-შეხსენება',
    description: 'შეხსენებების სისტემა გამართულად მუშაობს!',
    category: 'routine',
    time: hhmm,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    repeat: 'daily',
    soundEnabled: true,
    enabled: true,
    snoozeMinutes: 10,
    quietHoursStart: '23:00',
    quietHoursEnd: '07:30',
    timezone:
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tbilisi'
        : 'Asia/Tbilisi',
  };
}
