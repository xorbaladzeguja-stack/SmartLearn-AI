import React, { useState } from 'react';
import {
  ArrowRight,
  Brain,
  Calculator,
  Check,
  ChevronRight,
  Languages,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AppData, KnowledgeLevel, SubjectFocus, UserProfile } from '../types/app';
import { BrainBookHeroIllustration } from './SmartIllustrations';

interface OnboardingProps {
  initialProfile: UserProfile;
  onComplete: (updates: Partial<UserProfile>) => void;
  onImportBackup?: (imported: AppData) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({
  initialProfile,
  onComplete,
  onImportBackup,
}) => {
  // -1 = Screen 1 Welcome Hero (matches Reference Screen 1); 0..4 = 5-step profile wizard; 'login' = quick guest/backup entry
  const [step, setStep] = useState<number>(-1);
  const [loginMode, setLoginMode] = useState(false);
  const [name, setName] = useState(initialProfile.name || '');
  const [subjectFocus, setSubjectFocus] = useState<SubjectFocus>(initialProfile.subjectFocus || 'all');
  const [level, setLevel] = useState<KnowledgeLevel>(initialProfile.level || 'absolute_beginner');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState<number>(initialProfile.dailyGoalMinutes || 15);
  const [preferredReminderTime, setPreferredReminderTime] = useState<string>(
    initialProfile.preferredReminderTime || '18:00'
  );
  const [mainGoal, setMainGoal] = useState(
    initialProfile.mainGoal || 'ვისწავლო მათემატიკა და ინგლისური საფუძვლიანად ნულიდან'
  );
  const [error, setError] = useState('');

  const handleQuickEnter = () => {
    setError('');
    const finalName = name.trim() || 'მოსწავლე';
    onComplete({
      name: finalName,
      subjectFocus,
      level,
      dailyGoalMinutes,
      preferredReminderTime,
      mainGoal: mainGoal.trim() || 'ყოველდღიური განვითარება და სწავლა',
      onboardingCompleted: true,
    });
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportBackup) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const candidate = parsed.data || parsed;
        if (!candidate?.profile || !candidate?.mathProgress) {
          setError('არასწორი სარეზერვო ფაილის ფორმატი.');
          return;
        }
        onImportBackup({
          ...candidate,
          profile: {
            ...candidate.profile,
            userId: initialProfile.userId,
            onboardingCompleted: true,
          },
        });
      } catch {
        setError('სარეზერვო ფაილის წაკითხვა ვერ მოხერხდა.');
      }
    };
    reader.readAsText(file);
  };

  const handleNext = () => {
    setError('');
    if (step === 0 && name.trim().length < 2) {
      setError('გთხოვ შეიყვანო შენი სახელი (მინიმუმ 2 სიმბოლო).');
      return;
    }
    if (step === 4 && mainGoal.trim().length < 3) {
      setError('ჩაწერე შენი მთავარი სასწავლო მიზანი ან აირჩიე ქვემოთ მოცემული ვარიანტი.');
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      onComplete({
        name: name.trim(),
        subjectFocus,
        level,
        dailyGoalMinutes,
        preferredReminderTime,
        mainGoal: mainGoal.trim(),
        onboardingCompleted: true,
      });
    }
  };

  const subjectOptions: { id: SubjectFocus; title: string; desc: string; icon: React.ReactNode; grad: string }[] = [
    {
      id: 'all',
      title: 'ყველა მოდული ერთად',
      desc: 'მათემატიკა, ინგლისური და ტვინის ვარჯიში',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      grad: 'from-cyan-500 to-purple-600',
    },
    {
      id: 'math',
      title: 'მათემატიკა (0-დან)',
      desc: 'რიცხვებიდან ფუნქციებამდე ეტაპობრივად',
      icon: <Calculator className="w-5 h-5 text-white" />,
      grad: 'from-[#1AB8FF] to-[#0055FF]',
    },
    {
      id: 'english',
      title: 'ინგლისური (ანბანიდან)',
      desc: 'ასოები, სიტყვები, გრამატიკა და საუბარი',
      icon: <Languages className="w-5 h-5 text-white" />,
      grad: 'from-[#B04EFF] to-[#5224DC]',
    },
    {
      id: 'memory',
      title: 'მეხსიერება და ლოგიკა',
      desc: 'ყურადღების, ლოგიკისა და მეხსიერების თამაშები',
      icon: <Brain className="w-5 h-5 text-white" />,
      grad: 'from-[#49E65C] to-[#069E3B]',
    },
  ];

  const levelOptions: { id: KnowledgeLevel; title: string; desc: string }[] = [
    {
      id: 'absolute_beginner',
      title: 'სრული დამწყები (0-დან)',
      desc: 'ვიწყებ საფუძვლებიდან — ციფრები და ანბანი ნულიდან.',
    },
    {
      id: 'beginner',
      title: 'საბაზისო ცოდნა',
      desc: 'ვიცი მარტივი თვლა ან რამდენიმე ინგლისური სიტყვა.',
    },
    {
      id: 'intermediate',
      title: 'საშუალო დონე',
      desc: 'მინდა ცოდნის გამყარება, პრაქტიკა და უფრო რთული თემები.',
    },
  ];

  const goalPresets = [
    'ვისწავლო მათემატიკა და ინგლისური საფუძვლიანად ნულიდან',
    'ყოველდღე ვივარჯიშო 15 წუთი და ჩამოვიყალიბო სწავლის ჩვევა',
    'გავაუმჯობესო მეხსიერება, კონცენტრაცია და ლოგიკა',
  ];

  // SCREEN 1: Welcome Screen matching Reference Image
  if (step === -1 && !loginMode) {
    return (
      <div className="min-h-dvh sl-cosmic-bg text-white flex items-center justify-center p-3 min-[360px]:p-5 sm:p-8">
        <div className="w-full max-w-md lg:max-w-lg rounded-[2rem] sl-card sl-frame-glow p-6 min-[360px]:p-8 sm:p-10 flex flex-col items-center text-center space-y-6">
          <div className="animate-sl-float">
            <BrainBookHeroIllustration className="w-44 h-44 sm:w-52 sm:h-52 mx-auto drop-shadow-[0_0_28px_rgba(56,189,248,0.4)]" />
          </div>

          <div className="space-y-2.5">
            <h1 className="text-3xl min-[360px]:text-4xl font-extrabold tracking-tight">
              <span className="text-white">Smart</span>
              <span className="text-cyan-400">Learn</span>
            </h1>
            <p className="text-base sm:text-lg font-medium text-slate-200 leading-snug">
              ისწავლე მეტი,
              <br />
              გაიუმჯობესე უნარები!
            </p>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
              მათემატიკა ნულიდან, ინგლისური ანბანიდან, ტვინის ვარჯიში და AI მასწავლებელი ქართულ ენაზე.
            </p>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="w-full min-h-[52px] rounded-full sl-btn-purple text-white font-bold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            >
              <span>დაწყება</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => setLoginMode(true)}
              className="w-full min-h-[48px] rounded-full bg-[#091233]/80 border border-blue-500/60 hover:border-cyan-400 text-slate-100 font-semibold text-sm flex items-center justify-center transition-colors shadow-[0_0_16px_-4px_rgba(59,130,246,0.45)]"
            >
              შესვლა
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quick Entry / Local Restore Screen ("შესვლა")
  if (loginMode) {
    return (
      <div className="min-h-dvh sl-cosmic-bg text-white flex items-center justify-center p-3 min-[360px]:p-5">
        <div className="w-full max-w-md rounded-3xl sl-card sl-frame-glow p-6 sm:p-8 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-white">სწრაფი შესვლა პროფილში</h2>
            <p className="text-xs text-slate-300">
              გააგრძელე ლოკალური სტუმრის პროფილით ან აღადგინე შენახული სარეზერვო ასლი.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="quick-login-name" className="block text-xs font-medium text-slate-200">
              შენი სახელი
            </label>
            <input
              id="quick-login-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="მაგ: გუჯა, ნინო, გიორგი..."
              className="w-full min-h-[48px] rounded-xl bg-[#070D24] border border-purple-500/40 px-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {onImportBackup && (
            <label className="w-full min-h-[46px] rounded-xl bg-[#070D24] border border-blue-500/40 hover:border-cyan-400 px-4 py-2.5 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4 shrink-0" />
              <span>სარეზერვო ასლის აღდგენა (JSON)</span>
              <input type="file" accept="application/json" onChange={handleRestoreFile} className="hidden" />
            </label>
          )}

          {error && (
            <div className="rounded-xl bg-red-500/15 border border-red-500/40 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleQuickEnter}
              className="w-full min-h-[48px] rounded-full sl-btn-purple text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <span>სწავლის გაგრძელება</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode(false);
                setError('');
              }}
              className="w-full min-h-[44px] rounded-full border border-slate-700 text-slate-300 text-xs font-semibold"
            >
              უკან დაბრუნება
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5-Step Setup Wizard
  return (
    <div className="min-h-dvh sl-cosmic-bg text-slate-100 flex items-center justify-center p-3 min-[360px]:p-4 sm:p-6">
      <div className="w-full max-w-2xl rounded-3xl sl-card sl-frame-glow p-4 min-[360px]:p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30 shrink-0 font-extrabold text-white text-sm">
              SL
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white truncate">
                <span>Smart</span>
                <span className="text-cyan-400">Learn</span>
              </h1>
              <p className="text-xs text-slate-300">ნაბიჯი {step + 1} / 5 · პირადი სასწავლო პროფილი</p>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-bold tabular-nums shrink-0">
            {Math.round(((step + 1) / 5) * 100)}%
          </span>
        </div>

        <div className="w-full h-2 bg-[#070D24] rounded-full overflow-hidden mb-6 sm:mb-8 border border-purple-500/30">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 transition-all duration-300"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>

        {step === 0 && (
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h2 className="text-fluid-title font-bold text-white mb-2">გამარჯობა! დავიწყოთ სწავლა</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                SmartLearn AI დაგეხმარება ისწავლო მათემატიკა და ინგლისური სრული ნულიდან, ავარჯიშო გონება და
                დაგეგმო შენი ყოველდღიური განვითარება.
              </p>
            </div>
            <div>
              <label htmlFor="onb-name" className="block text-sm font-medium text-slate-200 mb-2">
                როგორ მოგმართოთ? (სახელი)
              </label>
              <input
                id="onb-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="მაგ: გიორგი, ნინო, გუჯა..."
                className="w-full min-h-[48px] rounded-xl bg-[#070D24] border border-purple-500/40 px-4 py-3 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              მონაცემები უსაფრთხოდ ინახება ამ მოწყობილობაზე (ლოკალური სტუმრის რეჟიმი).
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-fluid-title font-bold text-white mb-2">რისი სწავლა გსურს?</h2>
              <p className="text-sm text-slate-300">
                აირჩიე მთავარი მიმართულება — სხვა მოდულებზე წვდომა მაინც ყოველთვის გექნება.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjectOptions.map((opt) => {
                const active = subjectFocus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSubjectFocus(opt.id)}
                    className={`min-h-[76px] text-left rounded-2xl p-3.5 sm:p-4 border transition-all flex items-start gap-3 min-w-0 ${
                      active
                        ? 'bg-purple-600/25 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-[#070D24] border-purple-500/25 text-slate-300 hover:border-purple-400/60'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.grad} flex items-center justify-center shrink-0`}>
                      {opt.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white break-words">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-1 break-words">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-fluid-title font-bold text-white mb-2">რა არის შენი მიმდინარე დონე?</h2>
              <p className="text-sm text-slate-300">
                თუ არაფერი იცი, თამამად აირჩიე სრული დამწყები — ყველაფერს თავიდან აგიხსნით.
              </p>
            </div>
            <div className="space-y-3">
              {levelOptions.map((opt) => {
                const active = level === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLevel(opt.id)}
                    className={`w-full min-h-[64px] text-left rounded-2xl p-3.5 sm:p-4 border transition-all flex items-center justify-between gap-3 ${
                      active
                        ? 'bg-purple-600/25 border-purple-400 text-white shadow-md shadow-purple-500/25'
                        : 'bg-[#070D24] border-purple-500/25 text-slate-300 hover:border-purple-400/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-white break-words">{opt.title}</div>
                      <div className="text-xs text-slate-400 mt-1 break-words">{opt.desc}</div>
                    </div>
                    {active && <Check className="w-5 h-5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 sm:space-y-6">
            <div>
              <h2 className="text-fluid-title font-bold text-white mb-2">დღიური დრო და შეხსენება</h2>
              <p className="text-sm text-slate-300">
                რამდენ წუთს დაუთმობ სწავლას ყოველდღე და რომელ საათზე გირჩევნია შეხსენება?
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200 mb-3">დღიური სასწავლო მიზანი</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[10, 15, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDailyGoalMinutes(mins)}
                    className={`min-h-[48px] rounded-xl border font-semibold text-sm tabular-nums transition-all ${
                      dailyGoalMinutes === mins
                        ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                        : 'bg-[#070D24] border-purple-500/25 text-slate-300 hover:border-purple-400/60'
                    }`}
                  >
                    {mins} წუთი
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="onb-time" className="block text-sm font-medium text-slate-200 mb-2">
                შეხსენების სასურველი დრო
              </label>
              <input
                id="onb-time"
                type="time"
                value={preferredReminderTime}
                onChange={(e) => setPreferredReminderTime(e.target.value)}
                className="w-full min-[420px]:w-auto min-h-[48px] rounded-xl bg-[#070D24] border border-purple-500/40 px-4 py-2 text-white font-mono-num focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-fluid-title font-bold text-white mb-2">რა არის შენი მთავარი მიზანი?</h2>
              <p className="text-sm text-slate-300">
                შეგიძლია ჩაწერო საკუთარი მიზანი ან აირჩიო მზა ვარიანტი.
              </p>
            </div>
            <textarea
              rows={3}
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              placeholder="მაგ: მინდა 3 თვეში ვისწავლო გამართული საბაზისო ინგლისური და მათემატიკა..."
              className="w-full rounded-xl bg-[#070D24] border border-purple-500/40 p-3.5 sm:p-4 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <div className="space-y-2">
              {goalPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMainGoal(preset)}
                  className="w-full min-h-[44px] text-left text-xs text-slate-300 hover:text-white bg-[#070D24] hover:bg-purple-500/15 border border-purple-500/25 rounded-xl px-4 py-3 transition-colors break-words"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/15 border border-red-500/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 sm:mt-8 flex flex-col-reverse min-[420px]:flex-row items-stretch min-[420px]:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="min-h-[48px] px-5 py-2.5 rounded-full border border-purple-500/40 text-slate-200 hover:bg-purple-500/15 text-sm font-medium whitespace-nowrap text-center"
          >
            უკან
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="min-h-[48px] w-full min-[420px]:w-auto px-7 py-3 rounded-full sl-btn-purple text-white font-bold text-sm flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>{step === 4 ? 'სწავლის დაწყება' : 'შემდეგი'}</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
};
