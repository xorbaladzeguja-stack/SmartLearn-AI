import React from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  Bot,
  Brain,
  Calculator,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Flame,
  Gauge,
  Heart,
  Target,
  Trophy,
  Wrench,
} from 'lucide-react';
import { AppData, BrainCategory, LearnSubView, NavTab } from '../types/app';
import { MATH_LEVELS, isMathLessonUnlocked } from '../data/mathCurriculum';
import { VOCABULARY_BANK } from '../data/englishCurriculum';
import { ACHIEVEMENT_DEFINITIONS, calculateStreak } from '../services/achievements';
import { getTodayDateStr } from '../services/storage';
import { UkFlagBadge, UserAvatarBadge } from './SmartIllustrations';

interface DashboardHomeProps {
  data: AppData;
  onNavigate: (
    tab: NavTab,
    subView?: LearnSubView,
    options?: { brainCat?: BrainCategory }
  ) => void;
}

const LEVEL_LABELS: Record<AppData['profile']['level'], string> = {
  absolute_beginner: 'სრული დამწყები (0-დან)',
  beginner: 'საბაზისო დონე',
  intermediate: 'საშუალო დონე',
};

export const DashboardHome: React.FC<DashboardHomeProps> = ({ data, onNavigate }) => {
  const today = getTodayDateStr();
  const streak = calculateStreak(data.studyLog);

  const allMathLessons = MATH_LEVELS.flatMap((lvl) => lvl.lessons);
  const completedMathCount = allMathLessons.filter(
    (l) => data.mathProgress.lessons[l.id]?.completed
  ).length;
  const masteredLettersCount = data.englishProgress.masteredLetters.length;
  const vocabLearnedCount = Object.values(data.englishProgress.vocabulary).filter(
    (v) => v.mastered
  ).length;
  const completedEnglishStagesCount = data.englishProgress.completedStages.length;
  const totalCompletedLessons =
    completedMathCount + completedEnglishStagesCount + (masteredLettersCount >= 26 ? 1 : 0);

  // Real overall progress percentage across math + english + assignments
  const mathPct = allMathLessons.length > 0 ? completedMathCount / allMathLessons.length : 0;
  const englishTotal = 26 + VOCABULARY_BANK.length + 7;
  const englishPct =
    (masteredLettersCount + vocabLearnedCount + completedEnglishStagesCount) /
    Math.max(1, englishTotal);
  const overallProgressPct = Math.min(100, Math.round(((mathPct + englishPct) / 2) * 100));

  const todayAssignment = data.assignments[today];
  const pendingAssignmentCount = Object.values(data.assignments).filter(
    (a) => a.status === 'not_started' || a.status === 'in_progress' || a.status === 'needs_review'
  ).length;
  const todayHasPending =
    !todayAssignment ||
    todayAssignment.status === 'not_started' ||
    todayAssignment.status === 'in_progress' ||
    todayAssignment.status === 'needs_review';

  const totalLogMinutes = Object.values(data.studyLog).reduce((acc, d) => acc + d.minutes, 0);
  const totalToolMinutes = Math.round((data.tools.totalStudySeconds || 0) / 60);
  const totalMinutes = totalLogMinutes + totalToolMinutes;
  const todayMinutes = data.studyLog[today]?.minutes || 0;

  // Recommended next lesson based on real progress
  const nextMathLesson = allMathLessons.find(
    (l) =>
      !data.mathProgress.lessons[l.id]?.completed &&
      isMathLessonUnlocked(l.levelId, l.order, data.mathProgress.lessons)
  );

  let recommendedTitle = 'ინგლისური ანბანის შესწავლა';
  let recommendedDesc = 'დაიწყე პირველი ასოების ამოცნობით და გამოთქმით.';
  let recommendedTarget: { tab: NavTab; sub: LearnSubView } = { tab: 'learn', sub: 'english' };

  if (
    data.profile.subjectFocus === 'math' ||
    (nextMathLesson && completedMathCount <= masteredLettersCount)
  ) {
    if (nextMathLesson) {
      recommendedTitle = `მათემატიკა: ${nextMathLesson.title}`;
      recommendedDesc = nextMathLesson.subtitle;
      recommendedTarget = { tab: 'learn', sub: 'math' };
    }
  } else if (masteredLettersCount >= 26) {
    recommendedTitle = 'ინგლისური ლექსიკა და წინადადებები';
    recommendedDesc = 'გაიმდიდრე სიტყვების მარაგი და ივარჯიშე ფრაზებში.';
    recommendedTarget = { tab: 'learn', sub: 'english' };
  }

  const nextReminder = data.reminders
    .filter((r) => r.enabled)
    .sort((a, b) => a.time.localeCompare(b.time))[0];

  const unlockedDefs = ACHIEVEMENT_DEFINITIONS.filter((def) =>
    data.achievements.some((a) => a.id === def.id)
  );

  // 6 Signature Colorful Gradient Tiles (Matching Reference Screen 2)
  const heroTiles: {
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
      subtitle: '0 დონიდან',
      gradient: 'bg-gradient-to-br from-[#1EC8FF] via-[#0F8BFF] to-[#0044E5]',
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <Calculator className="w-6 h-6 text-white" />
        </div>
      ),
      onClick: () => onNavigate('learn', 'math'),
    },
    {
      id: 'english',
      title: 'ინგლისური',
      subtitle: '0 დონიდან',
      gradient: 'bg-gradient-to-br from-[#C04EFF] via-[#8438F5] to-[#4A1EC9]',
      icon: <UkFlagBadge className="w-12 h-8 border border-white/40" />,
      onClick: () => onNavigate('learn', 'english'),
    },
    {
      id: 'brain_memory',
      title: 'მეხსიერება',
      subtitle: 'და ლოგიკა',
      gradient: 'bg-gradient-to-br from-[#5CEB64] via-[#19C94A] to-[#048C33]',
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <Brain className="w-6 h-6 text-white" />
        </div>
      ),
      onClick: () => onNavigate('learn', 'brain', { brainCat: 'memory' }),
    },
    {
      id: 'wellness',
      title: 'ფსიქოლოგია',
      subtitle: 'და რჩევები',
      gradient: 'bg-gradient-to-br from-[#FFC336] via-[#FF8C1A] to-[#EB5600]',
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <Heart className="w-6 h-6 text-white" />
        </div>
      ),
      onClick: () => onNavigate('learn', 'wellness'),
    },
    {
      id: 'motor',
      title: 'მოტორიკა',
      subtitle: 'და ყურადღება',
      gradient: 'bg-gradient-to-br from-[#2CE6FF] via-[#0EA8DF] to-[#006B9E]',
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <Gauge className="w-6 h-6 text-white" />
        </div>
      ),
      onClick: () => onNavigate('learn', 'brain', { brainCat: 'motor' }),
    },
    {
      id: 'assignments',
      title: 'დავალებები',
      subtitle: 'და ტესტები',
      gradient: 'bg-gradient-to-br from-[#FF6394] via-[#EB2D67] to-[#B01242]',
      icon: (
        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
          <ClipboardCheck className="w-6 h-6 text-white" />
        </div>
      ),
      onClick: () => onNavigate('learn', 'assignments'),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Greeting & Overall Progress Row (Reference Screen 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
        {/* User Greeting Card */}
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="sl-card sl-frame-glow p-4 sm:p-5 flex items-center justify-between gap-3.5 text-left hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
            <UserAvatarBadge name={data.profile.name || 'მ'} className="w-14 h-14 sm:w-16 sm:h-16" />
            <div className="min-w-0">
              <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold truncate">
                {LEVEL_LABELS[data.profile.level]}
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
                გამარჯობა!
                <span className="block text-base sm:text-lg font-bold text-slate-700 dark:text-slate-100 mt-0.5">
                  {data.profile.name || 'მოსწავლე'} 👋
                </span>
              </h1>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-purple-400 shrink-0" />
        </button>

        {/* Overall Progress Card */}
        <div className="sl-card p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
                საერთო პროგრესი
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900 dark:text-white">
                  {overallProgressPct}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                  დღეს: {todayMinutes}/{data.profile.dailyGoalMinutes} წთ
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('progress')}
              aria-label="მიღწევების ნახვა"
              className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0"
            >
              <Trophy className="w-6 h-6" />
            </button>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-[#060B22] border border-purple-500/25 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300"
              style={{ width: `${Math.max(4, overallProgressPct)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main 6 Gradient Learning Tiles (2 cols mobile, 3 cols tablet/desktop) */}
      <section aria-label="სასწავლო მოდულები">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {heroTiles.map((tile) => (
            <button
              key={tile.id}
              type="button"
              onClick={tile.onClick}
              className={`sl-tile rounded-2xl sm:rounded-3xl ${tile.gradient} p-4 sm:p-5 min-h-[126px] sm:min-h-[144px] flex flex-col items-center justify-center text-center gap-2.5 text-white`}
            >
              {tile.icon}
              <div className="min-w-0">
                <div className="font-extrabold text-sm sm:text-base leading-tight break-words drop-shadow-sm">
                  {tile.title}
                </div>
                <div className="text-[11px] sm:text-xs font-medium text-white/90 mt-0.5 break-words">
                  {tile.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Next Step + Today's Assignment + Quick AI Teacher CTA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="lg:col-span-2 sl-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              რეკომენდებული შემდეგი გაკვეთილი
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white break-words">
              {recommendedTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 break-words">
              {recommendedDesc}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(recommendedTarget.tab, recommendedTarget.sub)}
            className="min-h-[48px] w-full sm:w-auto px-5 py-3 rounded-2xl sl-btn-purple text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 whitespace-nowrap"
          >
            <span>{todayHasPending ? 'სწავლის გაგრძელება' : 'გაკვეთილის გახსნა'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('teacher')}
          className="sl-card p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:border-cyan-400/70 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/30">
              <Bot className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white break-words">
                AI მასწავლებელი
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">
                მარტივი ახსნა და პრაქტიკა
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-cyan-400 shrink-0" />
        </button>
      </section>

      {/* 4 Compact Real KPI Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="sl-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">გაკვეთილები</span>
            <Target className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
            {totalCompletedLessons}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            მათ. {completedMathCount} · ანბანი {masteredLettersCount}/26
          </div>
        </div>

        <div className="sl-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">სერია</span>
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
            {streak} დღე
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {streak > 0 ? 'აქტიური რიტმი' : 'დაიწყე დღეს'}
          </div>
        </div>

        <div className="sl-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">დავალებები</span>
            <ClipboardCheck className="w-4 h-4 text-pink-400 shrink-0" />
          </div>
          <div className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
            {todayHasPending ? Math.max(1, pendingAssignmentCount) : pendingAssignmentCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {todayAssignment?.status === 'completed' ? 'შესრულებულია' : 'დღის გელოდება'}
          </div>
        </div>

        <div className="sl-card p-3.5 sm:p-4 min-w-0">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate">დრო და ჯილდო</span>
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="text-xl font-extrabold tabular-nums text-slate-900 dark:text-white mt-1">
            {totalMinutes} წთ
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            ჯილდო: {unlockedDefs.length}/{ACHIEVEMENT_DEFINITIONS.length}
          </div>
        </div>
      </section>

      {/* Reminders, Tools & Achievements Strip */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        <button
          type="button"
          onClick={() => onNavigate('learn', 'reminders')}
          className="sl-card min-h-[72px] p-4 flex items-center justify-between gap-3 text-left hover:border-cyan-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                ჭკვიანი შეხსენებები
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {nextReminder ? `შემდეგი: ${nextReminder.time} · ${nextReminder.title}` : 'გრაფიკის დაყენება'}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('learn', 'tools')}
          className="sl-card min-h-[72px] p-4 flex items-center justify-between gap-3 text-left hover:border-purple-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                დროის მართვა და კალკულატორი
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                პომოდორო, ჩვევები და გეგმა
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('progress')}
          className="sl-card min-h-[72px] p-4 flex items-center justify-between gap-3 text-left hover:border-amber-400/60 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                ჯილდოები და სტატისტიკა
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {unlockedDefs.length > 0 ? unlockedDefs[0].title : 'იხილე შენი პროგრესი'}
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </button>
      </section>
    </div>
  );
};
