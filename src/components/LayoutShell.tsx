import React, { useState } from 'react';
import {
  Bell,
  BookOpen,
  Bot,
  Brain,
  Calculator,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Crown,
  HeartHandshake,
  Home,
  Languages,
  Menu,
  Moon,
  Sun,
  TrendingUp,
  User,
  WifiOff,
  Wrench,
  X,
} from 'lucide-react';
import { LearnSubView, NavTab, ThemeMode } from '../types/app';
import { useOnlineStatus } from '../hooks/usePWAInstall';

interface LayoutShellProps {
  activeTab: NavTab;
  learnView: LearnSubView;
  theme: ThemeMode;
  userName: string;
  streak?: number;
  onNavigate: (tab: NavTab, subView?: LearnSubView) => void;
  onToggleTheme: () => void;
  children: React.ReactNode;
}

export const LayoutShell: React.FC<LayoutShellProps> = ({
  activeTab,
  learnView,
  theme,
  userName,
  streak = 0,
  onNavigate,
  onToggleTheme,
  children,
}) => {
  const isOnline = useOnlineStatus();
  const [tabletExpanded, setTabletExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const bottomTabs: {
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    activeText: string;
    activeIconBg: string;
  }[] = [
    {
      id: 'home',
      label: 'მთავარი',
      icon: <Home className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />,
      activeText: 'text-cyan-400',
      activeIconBg: 'bg-cyan-500/20 text-cyan-400 shadow-sm shadow-cyan-500/30',
    },
    {
      id: 'learn',
      label: 'სწავლა',
      icon: <BookOpen className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />,
      activeText: 'text-purple-400',
      activeIconBg: 'bg-purple-500/20 text-purple-400 shadow-sm shadow-purple-500/30',
    },
    {
      id: 'teacher',
      label: 'AI მასწავლებელი',
      icon: <Bot className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />,
      activeText: 'text-emerald-400',
      activeIconBg: 'bg-gradient-to-br from-cyan-500/25 to-purple-500/25 text-cyan-300 shadow-sm shadow-cyan-500/30',
    },
    {
      id: 'progress',
      label: 'პროგრესი',
      icon: <TrendingUp className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />,
      activeText: 'text-amber-400',
      activeIconBg: 'bg-amber-500/20 text-amber-400 shadow-sm shadow-amber-500/30',
    },
    {
      id: 'profile',
      label: 'პროფილი',
      icon: <User className="w-4 h-4 min-[360px]:w-5 min-[360px]:h-5 shrink-0" />,
      activeText: 'text-pink-400',
      activeIconBg: 'bg-pink-500/20 text-pink-400 shadow-sm shadow-pink-500/30',
    },
  ];

  const sidebarLinks: {
    label: string;
    tab: NavTab;
    subView?: LearnSubView;
    icon: React.ReactNode;
    badgeBg: string;
  }[] = [
    {
      label: 'მთავარი',
      tab: 'home',
      icon: <Home className="w-4 h-4" />,
      badgeBg: 'from-cyan-500 to-blue-600',
    },
    {
      label: 'მათემატიკა (0-დან)',
      tab: 'learn',
      subView: 'math',
      icon: <Calculator className="w-4 h-4" />,
      badgeBg: 'from-[#1AB8FF] to-[#0055FF]',
    },
    {
      label: 'ინგლისური (ანბანიდან)',
      tab: 'learn',
      subView: 'english',
      icon: <Languages className="w-4 h-4" />,
      badgeBg: 'from-[#B04EFF] to-[#5224DC]',
    },
    {
      label: 'დღის დავალება',
      tab: 'learn',
      subView: 'assignments',
      icon: <CalendarCheck className="w-4 h-4" />,
      badgeBg: 'from-[#FF5C8D] to-[#C81D4E]',
    },
    {
      label: 'ტვინის ვარჯიში',
      tab: 'learn',
      subView: 'brain',
      icon: <Brain className="w-4 h-4" />,
      badgeBg: 'from-[#49E65C] to-[#069E3B]',
    },
    {
      label: 'AI მასწავლებელი',
      tab: 'teacher',
      icon: <Bot className="w-4 h-4" />,
      badgeBg: 'from-cyan-500 to-indigo-600',
    },
    {
      label: 'ფსიქოლოგიური დამხმარე',
      tab: 'learn',
      subView: 'wellness',
      icon: <HeartHandshake className="w-4 h-4" />,
      badgeBg: 'from-[#FFB72B] to-[#FF6A00]',
    },
    {
      label: 'შეხსენებები',
      tab: 'learn',
      subView: 'reminders',
      icon: <Bell className="w-4 h-4" />,
      badgeBg: 'from-sky-500 to-blue-600',
    },
    {
      label: 'პროგრესი და მიღწევები',
      tab: 'progress',
      icon: <TrendingUp className="w-4 h-4" />,
      badgeBg: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'პირადი ხელსაწყოები',
      tab: 'learn',
      subView: 'tools',
      icon: <Wrench className="w-4 h-4" />,
      badgeBg: 'from-violet-500 to-purple-600',
    },
    {
      label: 'პროფილი და პარამეტრები',
      tab: 'profile',
      icon: <User className="w-4 h-4" />,
      badgeBg: 'from-indigo-500 to-blue-600',
    },
  ];

  const isLinkActive = (tab: NavTab, subView?: LearnSubView) => {
    if (tab !== activeTab) return false;
    if (tab === 'learn' && subView) {
      return learnView === subView;
    }
    if (tab === 'learn' && !subView) {
      return learnView === 'hub';
    }
    return true;
  };

  return (
    <div className="min-h-dvh sl-cosmic-bg text-slate-900 dark:text-slate-100 flex flex-col md:flex-row overflow-x-clip">
      {/* Tablet & Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 bg-white/95 dark:bg-[#08102C]/95 backdrop-blur-xl border-r border-purple-200 dark:border-purple-500/30 z-30 transition-[width] duration-200 shadow-xl shadow-purple-950/20 ${
          tabletExpanded ? 'md:w-64' : 'md:w-20'
        } lg:w-64 xl:w-72`}
      >
        <div className="px-3.5 lg:px-5 py-4 border-b border-purple-200/70 dark:border-purple-500/25 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none min-w-0 min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md shadow-purple-600/30">
              SL
            </div>
            <span
              className={`text-base lg:text-lg font-extrabold tracking-tight whitespace-nowrap truncate ${
                tabletExpanded ? 'inline' : 'hidden lg:inline'
              }`}
            >
              <span className="text-slate-900 dark:text-white">Smart</span>
              <span className="text-cyan-500 dark:text-cyan-400">Learn</span>
            </span>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'ღია თემაზე გადართვა' : 'მუქ თემაზე გადართვა'}
              className={`w-10 h-10 rounded-xl border border-purple-200 dark:border-purple-500/30 items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-purple-500/10 transition-colors ${
                tabletExpanded ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
            <button
              type="button"
              onClick={() => setTabletExpanded((e) => !e)}
              aria-label={tabletExpanded ? 'მენიუს ჩაკეცვა' : 'მენიუს გაშლა'}
              className="lg:hidden w-9 h-10 rounded-xl border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-slate-600 dark:text-slate-300"
            >
              {tabletExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 lg:px-3 py-3 space-y-1.5">
          {sidebarLinks.map((item) => {
            const active = isLinkActive(item.tab, item.subView);
            return (
              <button
                key={`${item.tab}_${item.subView || 'root'}`}
                type="button"
                title={item.label}
                onClick={() => onNavigate(item.tab, item.subView || 'hub')}
                className={`w-full min-h-[44px] px-2.5 py-2 rounded-xl flex items-center gap-3 text-sm font-medium transition-all text-left ${
                  tabletExpanded ? 'justify-start' : 'justify-center lg:justify-start'
                } ${
                  active
                    ? 'sl-btn-purple text-white shadow-md shadow-purple-700/35'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-purple-500/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    active ? 'bg-white/20 text-white' : `bg-gradient-to-br ${item.badgeBg} text-white`
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`truncate ${tabletExpanded ? 'inline' : 'hidden lg:inline'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 lg:p-4 border-t border-purple-200/70 dark:border-purple-500/25 text-xs text-slate-500 dark:text-slate-400">
          {!tabletExpanded && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="თემის შეცვლა"
              className="lg:hidden w-full min-h-[44px] rounded-xl flex items-center justify-center hover:bg-purple-500/10 mb-1"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <div className={tabletExpanded ? 'block' : 'hidden lg:block'}>
            <div className="flex items-center justify-between gap-2 font-semibold text-slate-800 dark:text-slate-100 truncate">
              <span className="truncate">{userName || 'მოსწავლე'}</span>
              <span className="inline-flex items-center gap-1 text-amber-400 font-mono-num shrink-0">
                <Crown className="w-3.5 h-3.5" />
                {streak}
              </span>
            </div>
            <div className="mt-0.5 truncate text-[11px]">ლოკალური სტუმრის რეჟიმი</div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (< 768px) matching Reference App Bar */}
      <header className="md:hidden sticky top-0 z-30 h-14 px-2.5 min-[360px]:px-3.5 bg-white/90 dark:bg-[#08102C]/92 backdrop-blur-xl border-b border-purple-200 dark:border-purple-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="მენიუს გახსნა"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-purple-500/15 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 min-h-[44px] min-w-0"
          >
            <span className="font-extrabold text-base min-[360px]:text-lg tracking-tight truncate">
              <span className="text-slate-900 dark:text-white">Smart</span>
              <span className="text-cyan-500 dark:text-cyan-400">Learn</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('progress')}
            aria-label="მიღწევები და სერია"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-amber-500 dark:text-amber-400 hover:bg-amber-500/15"
          >
            <Crown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('learn', 'reminders')}
            aria-label="შეხსენებები"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-cyan-300 hover:bg-purple-500/15"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'ღია თემა' : 'მუქი თემა'}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 hover:bg-purple-500/15"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Quick Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#08102C] border-r border-purple-500/40 h-full flex flex-col p-4 z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-200 dark:border-purple-500/30">
              <span className="font-extrabold text-lg">
                <span className="text-slate-900 dark:text-white">Smart</span>
                <span className="text-cyan-400">Learn</span>
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="დახურვა"
                className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {sidebarLinks.map((item) => {
                const active = isLinkActive(item.tab, item.subView);
                return (
                  <button
                    key={`mob_${item.tab}_${item.subView || 'root'}`}
                    type="button"
                    onClick={() => {
                      onNavigate(item.tab, item.subView || 'hub');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3 py-2 rounded-xl flex items-center gap-3 text-sm font-medium text-left ${
                      active
                        ? 'sl-btn-purple text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-purple-500/15'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.badgeBg} text-white flex items-center justify-center shrink-0`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 pb-24 md:pb-8 transition-[padding] duration-200 ${
          tabletExpanded ? 'md:pl-64' : 'md:pl-20'
        } lg:pl-64 xl:pl-72`}
      >
        {!isOnline && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-center gap-2 text-center">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>ოფლაინ რეჟიმი — შენახული გაკვეთილები, თამაშები, გეგმა და პროგრესი მუშაობს ინტერნეტის გარეშე.</span>
          </div>
        )}
        <div className="w-full max-w-6xl mx-auto px-3 min-[360px]:px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="მთავარი ნავიგაცია"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe bg-white/95 dark:bg-[#08102C]/95 backdrop-blur-xl border-t border-purple-200 dark:border-purple-500/35 grid grid-cols-[1fr_1fr_1.45fr_1fr_1fr] items-center px-1 shadow-lg shadow-purple-950/30"
      >
        {bottomTabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.id, tab.id === 'learn' ? 'hub' : undefined)}
              className={`min-h-[48px] min-w-0 px-0.5 flex flex-col items-center justify-center gap-0.5 transition-all ${
                active
                  ? `${tab.activeText} font-bold`
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span
                className={`w-8 h-7 rounded-xl flex items-center justify-center transition-all ${
                  active ? tab.activeIconBg : ''
                }`}
              >
                {tab.icon}
              </span>
              <span className="text-[8.5px] min-[360px]:text-[9.5px] leading-tight whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
