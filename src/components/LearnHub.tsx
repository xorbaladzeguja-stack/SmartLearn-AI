import React from 'react';
import {
  BarChart3,
  Bell,
  Brain,
  Calculator,
  CalendarCheck,
  Clock,
  Gift,
  HeartHandshake,
  Languages,
  Puzzle,
  Settings,
  Star,
  Zap,
} from 'lucide-react';
import { BrainCategory, LearnSubView, NavTab } from '../types/app';
import { ToolTab } from '../modules/tools/ToolsModule';

interface LearnHubProps {
  onSelect: (
    subView: LearnSubView,
    options?: { brainCat?: BrainCategory; toolTab?: ToolTab; navTab?: NavTab }
  ) => void;
}

export const LearnHub: React.FC<LearnHubProps> = ({ onSelect }) => {
  // Matches Reference Screen 8 ("სხვა სასარგებლო ფუნქციები") + full curriculum access
  const primaryCards: {
    id: string;
    title: string;
    subtitle: string;
    gradient: string;
    icon: React.ReactNode;
    onClick: () => void;
  }[] = [
    {
      id: 'math',
      title: 'მათემატიკა',
      subtitle: '0 დონიდან ფუნქციებამდე',
      gradient: 'bg-gradient-to-br from-[#1EC8FF] to-[#0044E5]',
      icon: <Calculator className="w-7 h-7 text-white" />,
      onClick: () => onSelect('math'),
    },
    {
      id: 'english',
      title: 'ინგლისური',
      subtitle: 'ანბანიდან საუბრამდე',
      gradient: 'bg-gradient-to-br from-[#C04EFF] to-[#4A1EC9]',
      icon: <Languages className="w-7 h-7 text-white" />,
      onClick: () => onSelect('english'),
    },
    {
      id: 'memory',
      title: 'მეხსიერების ტესტები',
      subtitle: 'დამახსოვრების თამაშები',
      gradient: 'bg-gradient-to-br from-[#5CEB64] to-[#048C33]',
      icon: <Brain className="w-7 h-7 text-white" />,
      onClick: () => onSelect('brain', { brainCat: 'memory' }),
    },
    {
      id: 'logic',
      title: 'ლოგიკური თამაშები',
      subtitle: 'ამოცანები და მსჯელობა',
      gradient: 'bg-gradient-to-br from-[#5865F2] to-[#3730A3]',
      icon: <Puzzle className="w-7 h-7 text-white" />,
      onClick: () => onSelect('brain', { brainCat: 'logic' }),
    },
    {
      id: 'speed',
      title: 'სისწრაფის ტესტი',
      subtitle: 'ყურადღება და რეაქცია',
      gradient: 'bg-gradient-to-br from-[#FFB830] to-[#EA580C]',
      icon: <Zap className="w-7 h-7 text-white" />,
      onClick: () => onSelect('brain', { brainCat: 'attention' }),
    },
    {
      id: 'calculator',
      title: 'კალკულატორი',
      subtitle: 'სწრაფი გამოთვლები',
      gradient: 'bg-gradient-to-br from-[#2CE6FF] to-[#0284C7]',
      icon: <Calculator className="w-7 h-7 text-white" />,
      onClick: () => onSelect('tools', { toolTab: 'calculator' }),
    },
    {
      id: 'time',
      title: 'დროის მართვა',
      subtitle: 'პომოდორო და გეგმა',
      gradient: 'bg-gradient-to-br from-[#FF8C42] to-[#C2410C]',
      icon: <Clock className="w-7 h-7 text-white" />,
      onClick: () => onSelect('tools', { toolTab: 'timers' }),
    },
    {
      id: 'progress',
      title: 'პროგრესი და ანალიზი',
      subtitle: 'სტატისტიკა და გრაფიკები',
      gradient: 'bg-gradient-to-br from-[#34D399] to-[#059669]',
      icon: <BarChart3 className="w-7 h-7 text-white" />,
      onClick: () => onSelect('hub', { navTab: 'progress' }),
    },
    {
      id: 'rewards',
      title: 'ჯილდოები',
      subtitle: 'მიღწევები და მედლები',
      gradient: 'bg-gradient-to-br from-[#FB923C] to-[#EA580C]',
      icon: <Gift className="w-7 h-7 text-white" />,
      onClick: () => onSelect('hub', { navTab: 'progress' }),
    },
    {
      id: 'settings',
      title: 'პარამეტრები',
      subtitle: 'პროფილი და სარეზერვო ასლი',
      gradient: 'bg-gradient-to-br from-[#60A5FA] to-[#3B5BDB]',
      icon: <Settings className="w-7 h-7 text-white" />,
      onClick: () => onSelect('hub', { navTab: 'profile' }),
    },
    {
      id: 'assignments',
      title: 'დღის დავალებები',
      subtitle: 'პერსონალური ტესტები',
      gradient: 'bg-gradient-to-br from-[#FF6394] to-[#B01242]',
      icon: <CalendarCheck className="w-7 h-7 text-white" />,
      onClick: () => onSelect('assignments'),
    },
    {
      id: 'wellness_rem',
      title: 'შეხსენებები',
      subtitle: 'სასწავლო განრიგი',
      gradient: 'bg-gradient-to-br from-[#38BDF8] to-[#1D4ED8]',
      icon: <Bell className="w-7 h-7 text-white" />,
      onClick: () => onSelect('reminders'),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-fluid-title font-extrabold text-slate-900 dark:text-white">
            სწავლა და სასარგებლო ფუნქციები
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            აირჩიე გაკვეთილი, ტვინის თამაში ან განვითარების ხელსაწყო.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onSelect('wellness')}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-gradient-to-r from-[#FF8C1A] to-[#EB5600] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-500/25"
        >
          <HeartHandshake className="w-4 h-4 shrink-0" />
          <span>ფსიქოლოგია და რჩევები</span>
        </button>
      </div>

      {/* Vibrant 2-col (mobile) -> 4-col (desktop) Colorful Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {primaryCards.map((card) => (
          <button
            key={card.id}
            type="button"
            onClick={card.onClick}
            className={`sl-tile rounded-2xl sm:rounded-3xl ${card.gradient} p-4 sm:p-5 min-h-[120px] flex flex-col items-center justify-center text-center gap-2 text-white`}
          >
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
              {card.icon}
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-xs min-[360px]:text-sm leading-tight break-words">
                {card.title}
              </div>
              <div className="text-[10px] min-[360px]:text-[11px] text-white/85 mt-0.5 break-words">
                {card.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Motivational Bottom Pill Banner (Matching Reference Screen 8) */}
      <button
        type="button"
        onClick={() => onSelect('assignments')}
        className="w-full min-h-[64px] rounded-full sl-card sl-frame-glow px-5 py-3.5 flex items-center justify-center gap-3 text-center hover:brightness-110 transition-all"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-amber-500/40">
          <Star className="w-5 h-5 fill-white" />
        </div>
        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
          ისწავლე, განვითარდი, მიაღწიე მეტს!
        </span>
      </button>
    </div>
  );
};
