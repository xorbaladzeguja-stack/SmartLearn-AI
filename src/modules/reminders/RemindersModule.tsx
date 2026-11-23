import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  Edit2,
  Pause,
  Play,
  Plus,
  Send,
  Trash2,
} from 'lucide-react';
import { ReminderCategory, ReminderItem } from '../../types/app';
import {
  createTestReminderItem,
  getNotificationPermission,
  NotificationDispatchResult,
  requestNotificationPermission,
} from '../../services/notifications';

interface RemindersModuleProps {
  reminders: ReminderItem[];
  onSaveReminders: (next: ReminderItem[]) => void;
  onTriggerTestReminder: (testItem: ReminderItem) => Promise<NotificationDispatchResult>;
}

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  math: 'მათემატიკა',
  english: 'ინგლისური',
  assignments: 'დღის დავალებები',
  brain: 'ტვინის ვარჯიში',
  goals: 'პირადი მიზნები',
  relaxation: 'რელაქსაცია',
  routine: 'დღის სასწავლო რუტინა',
};

const DAY_NAMES = ['კვ', 'ორ', 'სა', 'ოთ', 'ხუ', 'პა', 'შა'];

export const RemindersModule: React.FC<RemindersModuleProps> = ({
  reminders,
  onSaveReminders,
  onTriggerTestReminder,
}) => {
  const [permState, setPermState] = useState(getNotificationPermission());
  const [showPermExplain, setShowPermExplain] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const defaultTz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tbilisi'
      : 'Asia/Tbilisi';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('math');
  const [time, setTime] = useState('18:00');
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);
  const [repeat, setRepeat] = useState<ReminderItem['repeat']>('daily');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [snoozeMinutes, setSnoozeMinutes] = useState(10);
  const [quietStart, setQuietStart] = useState('23:00');
  const [quietEnd, setQuietEnd] = useState('07:30');
  const [timezone, setTimezone] = useState(defaultTz);
  const [formError, setFormError] = useState('');

  const openCreateForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setCategory('math');
    setTime('18:00');
    setDaysOfWeek([1, 2, 3, 4, 5, 6, 0]);
    setRepeat('daily');
    setSoundEnabled(true);
    setSnoozeMinutes(10);
    setQuietStart('23:00');
    setQuietEnd('07:30');
    setTimezone(defaultTz);
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (rem: ReminderItem) => {
    setEditingId(rem.id);
    setTitle(rem.title);
    setDescription(rem.description);
    setCategory(rem.category);
    setTime(rem.time);
    setDaysOfWeek(rem.daysOfWeek);
    setRepeat(rem.repeat);
    setSoundEnabled(rem.soundEnabled);
    setSnoozeMinutes(rem.snoozeMinutes);
    setQuietStart(rem.quietHoursStart);
    setQuietEnd(rem.quietHoursEnd);
    setTimezone(rem.timezone);
    setFormError('');
    setShowForm(true);
  };

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (title.trim().length < 2) {
      setFormError('შეიყვანე შეხსენების სათაური.');
      return;
    }
    if (daysOfWeek.length === 0) {
      setFormError('აირჩიე კვირის მინიმუმ ერთი დღე.');
      return;
    }

    const item: ReminderItem = {
      id: editingId || `rem_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      category,
      time,
      daysOfWeek,
      repeat,
      soundEnabled,
      enabled: true,
      snoozeMinutes,
      quietHoursStart: quietStart,
      quietHoursEnd: quietEnd,
      timezone,
    };

    if (editingId) {
      onSaveReminders(reminders.map((r) => (r.id === editingId ? item : r)));
    } else {
      onSaveReminders([...reminders, item]);
    }
    setShowForm(false);
  };

  const toggleDay = (dayIdx: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayIdx) ? prev.filter((d) => d !== dayIdx) : [...prev, dayIdx]
    );
  };

  const handleRequestPermission = async () => {
    const nextPerm = await requestNotificationPermission();
    setPermState(nextPerm);
    setShowPermExplain(false);
    if (nextPerm === 'granted') {
      setStatusMessage('ბრაუზერის შეტყობინებები ჩართულია. ასევე აქტიურია აპის შიდა შეხსენებები.');
    } else if (nextPerm === 'denied') {
      setStatusMessage('ბრაუზერის შეტყობინებები უარყოფილია — შეხსენებები მაინც იმუშავებს აპის შიგნით.');
    }
  };

  const handleTestReminder = async () => {
    setTesting(true);
    try {
      const testItem = createTestReminderItem();
      const res = await onTriggerTestReminder(testItem);
      if (res.browserDelivered) {
        setStatusMessage('ტესტ შეხსენება გაეშვა აპის შიგნით და ბრაუზერის შეტყობინებით.');
      } else {
        setStatusMessage('ტესტ შეხსენება გაეშვა აპის შიდა შეხსენების ცენტრში.');
      }
    } finally {
      setTesting(false);
    }
  };

  const nextScheduled = reminders
    .filter((r) => r.enabled)
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-fluid-title font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-blue-500 shrink-0" />
            <span>ჭკვიანი შეხსენებები</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            დაგეგმე სწავლის განრიგი, ჩუმი საათები და შეტყობინებები.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="min-h-[44px] w-full sm:w-auto px-5 py-2 rounded-full sl-btn-purple text-white text-xs font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>ახალი შეხსენება</span>
        </button>
      </div>

      {/* Notification Permission & Local Architecture Banner */}
      <section className="sl-card sl-frame-glow p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-white">
              შეხსენებების სისტემა:{' '}
              <span className="text-cyan-600 dark:text-cyan-400">
                {permState === 'granted'
                  ? 'აპის შიდა და ბრაუზერის შეტყობინებები ჩართულია'
                  : permState === 'denied'
                  ? 'მოქმედებს აპის შიდა შეხსენებები (ბრაუზერის ნებართვა უარყოფილია)'
                  : permState === 'unsupported'
                  ? 'მოქმედებს აპის შიდა შეხსენებები'
                  : 'აპის შიდა შეხსენებები აქტიურია'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed break-words">
              შეხსენებები სრულად მუშაობს ლოკალურად — დროის მოსვლისას აპში ჩნდება ბანერი და ირთვება ხმოვანი სიგნალი,
              ხოლო ნებართვის ჩართვის შემთხვევაში ბრაუზერის შეტყობინებაც მოდის.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {permState === 'default' && (
              <button
                type="button"
                onClick={() => setShowPermExplain(true)}
                className="min-h-[44px] px-4 py-2 rounded-full sl-btn-blue text-white text-xs font-bold whitespace-nowrap"
              >
                ბრაუზერის შეტყობინებების ჩართვა
              </button>
            )}
            <button
              type="button"
              disabled={testing}
              onClick={handleTestReminder}
              className="min-h-[44px] px-4 py-2 rounded-full border border-cyan-400/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50 hover:bg-cyan-500/20"
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              <span>შეხსენების ტესტი</span>
            </button>
          </div>
        </div>

        {showPermExplain && (
          <div className="rounded-2xl bg-blue-600/10 border border-blue-500/30 p-4 space-y-3">
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              <strong>რატომ გვჭირდება ნებართვა:</strong> ნებართვა საშუალებას გვაძლევს დროულად შეგახსენოთ
              ინგლისურის, მათემატიკის ან დღის დავალების დრო ბრაუზერის შეტყობინებითაც. ჩუმ საათებში შეტყობინებები არ მოგივა.
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRequestPermission}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                ნებართვის მიცემა
              </button>
              <button
                type="button"
                onClick={() => setShowPermExplain(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              >
                მოგვიანებით
              </button>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className="text-xs font-medium text-cyan-600 dark:text-cyan-300 break-words">{statusMessage}</div>
        )}
      </section>

      {/* Next Scheduled Summary */}
      <section className="sl-card p-5">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
          შემდეგი დაგეგმილი შეხსენებები ({nextScheduled.length})
        </h2>
        {nextScheduled.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            აქტიური შეხსენებები არ არის. ჩართე ან დაამატე ახალი შეხსენება ქვემოთ.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {nextScheduled.map((r) => (
              <div
                key={r.id}
                className="rounded-xl bg-slate-50 dark:bg-[#070D24] border border-purple-200 dark:border-purple-500/25 px-3 py-2 text-xs"
              >
                <strong className="font-mono-num text-cyan-400">{r.time}</strong> · {r.title}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create / Edit Form */}
      {showForm && (
        <form
          onSubmit={handleSaveReminder}
          className="sl-card sl-frame-glow p-5 sm:p-6 space-y-4"
        >
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            {editingId ? 'შეხსენების რედაქტირება' : 'ახალი შეხსენების შექმნა'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">სათაური</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="მაგ: ინგლისურის გაკვეთილი"
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">კატეგორია</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ReminderCategory)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">დრო</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">გამეორება</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as ReminderItem['repeat'])}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm"
              >
                <option value="daily">ყოველდღე</option>
                <option value="weekdays">სამუშაო დღეებში</option>
                <option value="weekends">შაბათ-კვირას</option>
                <option value="custom">არჩეულ დღეებში</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium mb-1">აღწერა</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="მოკლე შეხსენების ტექსტი..."
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="text-xs font-medium mb-2">კვირის დღეები</div>
              <div className="grid grid-cols-7 gap-1 sm:flex sm:flex-wrap sm:gap-2">
                {DAY_NAMES.map((dn, idx) => (
                  <button
                    key={dn}
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`min-h-[44px] sm:min-w-[44px] rounded-xl border text-xs font-semibold flex items-center justify-center ${
                      daysOfWeek.includes(idx)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-50 dark:bg-[#070D1F] border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {dn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">გადადება (Snooze, წუთი)</label>
              <input
                type="number"
                min={5}
                max={60}
                value={snoozeMinutes}
                onChange={(e) => setSnoozeMinutes(Number(e.target.value) || 10)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">დროის სარტყელი</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">ჩუმი საათების დასაწყისი</label>
              <input
                type="time"
                value={quietStart}
                onChange={(e) => setQuietStart(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">ჩუმი საათების დასასრული</label>
              <input
                type="time"
                value={quietEnd}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D1F] border border-slate-200 dark:border-slate-700 px-3 text-sm font-mono-num"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span>ხმოვანი სიგნალი შეხსენებისას</span>
          </label>

          {formError && <div className="text-xs text-red-500">{formError}</div>}

          <div className="flex gap-3">
            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 rounded-full sl-btn-purple text-white text-xs font-bold"
            >
              შენახვა
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-[44px] px-5 py-2 rounded-full border border-purple-200 dark:border-purple-500/35 text-xs font-semibold"
            >
              გაუქმება
            </button>
          </div>
        </form>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.map((rem) => (
          <div
            key={rem.id}
            className="sl-card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-extrabold font-mono-num text-cyan-500 dark:text-cyan-400">
                  {rem.time}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white break-words">
                  {rem.title}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 break-words">
                {CATEGORY_LABELS[rem.category]} · {rem.description || 'აღწერა არ არის'} · ჩუმი საათები:{' '}
                {rem.quietHoursStart}–{rem.quietHoursEnd}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() =>
                  onSaveReminders(
                    reminders.map((r) => (r.id === rem.id ? { ...r, enabled: !r.enabled } : r))
                  )
                }
                className={`min-h-[44px] px-4 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 ${
                  rem.enabled
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-600 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-[#070D24] border-purple-200 dark:border-purple-500/30 text-slate-500'
                }`}
              >
                {rem.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{rem.enabled ? 'ჩართულია' : 'დაპაუზებულია'}</span>
              </button>
              <button
                type="button"
                onClick={() => openEditForm(rem)}
                aria-label="რედაქტირება"
                className="min-w-[44px] min-h-[44px] rounded-xl border border-purple-200 dark:border-purple-500/30 flex items-center justify-center hover:border-cyan-400"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSaveReminders(reminders.filter((r) => r.id !== rem.id))}
                aria-label="წაშლა"
                className="min-w-[44px] min-h-[44px] rounded-xl border border-red-500/30 text-red-500 flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {reminders.length === 0 && (
          <div className="sl-card p-8 text-center text-xs text-slate-500">
            <BellOff className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            შეხსენებები არ გაქვს დამატებული.
          </div>
        )}
      </div>
    </div>
  );
};
