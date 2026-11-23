import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Check,
  CheckCircle2,
  ChevronRight,
  Lock,
  Play,
  RotateCcw,
  Triangle,
  XCircle,
} from 'lucide-react';
import {
  MATH_LEVELS,
  MathLessonDef,
  MathQuestion,
  isMathLessonUnlocked,
} from '../../data/mathCurriculum';
import { MathProgress } from '../../types/app';
import { MathVisualStage } from './MathVisualStage';
import { playErrorChime, playSuccessChime } from '../../services/speechAndSound';

interface MathModuleProps {
  mathProgress: MathProgress;
  soundEnabled: boolean;
  onCompleteLesson: (payload: {
    lessonId: string;
    levelId: number;
    score: number;
    passed: boolean;
    questionsCount: number;
    correctCount: number;
    mistakes: string[];
    topic: string;
  }) => void;
  onAskAiHelp: (topic: string) => void;
}

interface MathTopicItem {
  id: string;
  title: string;
  subtitle: string;
  badgeText: string;
  badgeIcon?: React.ReactNode;
  badgeGradient: string;
  levelId: number;
  preferredLessonId?: string;
}

const MATH_TOPICS: MathTopicItem[] = [
  {
    id: 'topic_add',
    title: 'მიმატება (0-დან)',
    subtitle: 'საგნებით, 10-ის, 20-ის და 100-ის ფარგლებში',
    badgeText: '+',
    badgeGradient: 'from-[#34D399] to-[#059669]',
    levelId: 2,
  },
  {
    id: 'topic_sub',
    title: 'გამოკლება (0-დან)',
    subtitle: 'უკუთვლა, სხვაობა და ათეულის დაშლა',
    badgeText: '−',
    badgeGradient: 'from-[#38BDF8] to-[#2563EB]',
    levelId: 3,
  },
  {
    id: 'topic_mult',
    title: 'გამრავლება',
    subtitle: 'ჯგუფები, ტაბულა და პრაქტიკული ამოცანები',
    badgeText: '×',
    badgeGradient: 'from-[#FBBF24] to-[#EA580C]',
    levelId: 4,
  },
  {
    id: 'topic_div',
    title: 'გაყოფა',
    subtitle: 'თანაბრად განაწილება და ნაშთიანი გაყოფა',
    badgeText: '÷',
    badgeGradient: 'from-[#A855F7] to-[#6D28D9]',
    levelId: 5,
  },
  {
    id: 'topic_func',
    title: 'ფუნქციები',
    subtitle: 'ცვლადი x, წრფივი წესები f(x) და გრაფიკები',
    badgeText: 'f(x)',
    badgeGradient: 'from-[#22D3EE] to-[#0284C7]',
    levelId: 6,
    preferredLessonId: 'm6_functions',
  },
  {
    id: 'topic_geo',
    title: 'გეომეტრია',
    subtitle: 'პერიმეტრი, ფართობი, წილადები და პროცენტები',
    badgeText: '',
    badgeIcon: <Triangle className="w-5 h-5 text-white fill-white/25" />,
    badgeGradient: 'from-[#4ADE80] to-[#16A34A]',
    levelId: 6,
    preferredLessonId: 'm6_geometry',
  },
  {
    id: 'topic_logic',
    title: 'ლოგიკა და ამოცანები',
    subtitle: 'ციფრები (0–10), თანმიმდევრობა, > < = და ღერძი',
    badgeText: '',
    badgeIcon: <Brain className="w-5 h-5 text-white" />,
    badgeGradient: 'from-[#FB7185] to-[#E11D48]',
    levelId: 1,
  },
];

export const MathModule: React.FC<MathModuleProps> = ({
  mathProgress,
  soundEnabled,
  onCompleteLesson,
  onAskAiHelp,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>('topic_add');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [activeLesson, setActiveLesson] = useState<MathLessonDef | null>(null);
  const [phase, setPhase] = useState<'learn' | 'quiz' | 'result'>('learn');
  const [questions, setQuestions] = useState<MathQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);

  const currentLevel = useMemo(
    () => MATH_LEVELS.find((l) => l.id === selectedLevelId) || MATH_LEVELS[0],
    [selectedLevelId]
  );

  const allLessons = useMemo(() => MATH_LEVELS.flatMap((l) => l.lessons), []);
  const completedCount = allLessons.filter((l) => mathProgress.lessons[l.id]?.completed).length;
  const completedLevelBadge = Math.min(6, Math.floor(completedCount / 5));

  const openLesson = (lesson: MathLessonDef, directQuiz = false) => {
    setActiveLesson(lesson);
    setQuestions(directQuiz ? lesson.generateQuestions(5) : []);
    setPhase(directQuiz ? 'quiz' : 'learn');
    setQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setCorrectCount(0);
    setMistakes([]);
  };

  const handleSelectTopic = (topic: MathTopicItem) => {
    setSelectedTopicId(topic.id);
    setSelectedLevelId(topic.levelId);
  };

  const handleLaunchSelectedTopic = () => {
    const topic = MATH_TOPICS.find((t) => t.id === selectedTopicId) || MATH_TOPICS[0];
    const lvl = MATH_LEVELS.find((l) => l.id === topic.levelId) || MATH_LEVELS[0];
    const preferred = topic.preferredLessonId
      ? lvl.lessons.find((l) => l.id === topic.preferredLessonId)
      : undefined;
    const nextIncomplete = lvl.lessons.find((l) => !mathProgress.lessons[l.id]?.completed);
    const targetLesson = preferred || nextIncomplete || lvl.lessons[0];
    if (targetLesson) {
      openLesson(targetLesson, false);
    }
  };

  const startQuiz = () => {
    if (!activeLesson) return;
    const generated = activeLesson.generateQuestions(5);
    setQuestions(generated);
    setPhase('quiz');
    setQIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setCorrectCount(0);
    setMistakes([]);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || !questions[qIndex] || isChecked) return;
    const currentQ = questions[qIndex];
    const ok = selectedOption === currentQ.correctAnswer;
    setIsChecked(true);
    if (ok) {
      setCorrectCount((c) => c + 1);
      playSuccessChime(soundEnabled);
    } else {
      setMistakes((prev) => [
        ...prev,
        `${currentQ.prompt} (სწორი პასუხი: ${currentQ.correctAnswer})`,
      ]);
      playErrorChime(soundEnabled);
    }
  };

  const handleNextQuestion = () => {
    if (!activeLesson) return;
    if (qIndex + 1 < questions.length) {
      setQIndex((i) => i + 1);
      setSelectedOption(null);
      setIsChecked(false);
    } else {
      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= 70;
      setPhase('result');
      onCompleteLesson({
        lessonId: activeLesson.id,
        levelId: activeLesson.levelId,
        score,
        passed,
        questionsCount: questions.length,
        correctCount,
        mistakes,
        topic: activeLesson.title,
      });
    }
  };

  // Active Lesson / Quiz Screen (Reference Screen 4)
  if (activeLesson) {
    const currentQ = questions[qIndex];
    const finalScore =
      questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col min-[460px]:flex-row min-[460px]:items-center justify-between gap-2.5 sm:gap-4">
          <button
            type="button"
            onClick={() => setActiveLesson(null)}
            className="min-h-[44px] w-full min-[460px]:w-auto px-4 py-2 rounded-2xl sl-card text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-cyan-400/60 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>თემებზე დაბრუნება</span>
          </button>

          <button
            type="button"
            onClick={() => onAskAiHelp(`მათემატიკა — ${activeLesson.title}`)}
            className="min-h-[44px] w-full min-[460px]:w-auto px-4 py-2 rounded-2xl sl-btn-purple text-white text-xs font-bold text-center"
          >
            AI მასწავლებლის დახმარება
          </button>
        </div>

        {phase === 'learn' && (
          <div className="rounded-3xl sl-card sl-frame-glow p-4 min-[360px]:p-6 sm:p-8 space-y-5 sm:space-y-6">
            <div>
              <div className="text-xs font-bold text-cyan-500 dark:text-cyan-400">
                დონე {activeLesson.levelId} · გაკვეთილი {activeLesson.order}
              </div>
              <h1 className="text-fluid-title font-extrabold text-slate-900 dark:text-white mt-1 break-words">
                {activeLesson.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-200 mt-3 leading-relaxed">
                {activeLesson.explanation}
              </p>
            </div>

            <MathVisualStage
              type={activeLesson.visualDemo.type}
              a={activeLesson.visualDemo.a}
              b={activeLesson.visualDemo.b}
              caption={activeLesson.visualDemo.caption}
            />

            <div className="space-y-2.5">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                ეტაპობრივი ახსნა:
              </h2>
              <ol className="space-y-2">
                {activeLesson.steps.map((st, idx) => (
                  <li
                    key={idx}
                    className="rounded-2xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/25 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={startQuiz}
                className="min-h-[50px] w-full sm:w-auto px-7 py-3 rounded-full sl-btn-blue text-white font-bold text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>პრაქტიკისა და ტესტის დაწყება (5 კითხვა)</span>
              </button>
            </div>
          </div>
        )}

        {/* SCREEN 4: MATH QUIZ SCREEN */}
        {phase === 'quiz' && currentQ && (
          <div className="rounded-3xl sl-card sl-frame-glow p-4 min-[360px]:p-6 sm:p-8 space-y-5 sm:space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500 dark:text-slate-300">
              <span className="truncate">{activeLesson.title}</span>
              <span className="font-mono-num text-cyan-500 dark:text-cyan-400 shrink-0 text-sm font-bold">
                {qIndex + 1} / {questions.length}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-[#060B22] overflow-hidden border border-purple-500/25">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300"
                style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Large Prominent Question Display */}
            <div className="py-2 sm:py-4 text-center space-y-4">
              <h2
                className={`font-extrabold text-slate-900 dark:text-white tracking-tight break-words ${
                  currentQ.prompt.length <= 28
                    ? 'text-3xl sm:text-5xl font-mono-num'
                    : 'text-xl sm:text-2xl'
                }`}
              >
                {currentQ.prompt}
              </h2>

              {currentQ.visual?.type === 'count' && currentQ.visual.a && (
                <div className="flex flex-wrap justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/25">
                  {Array.from({ length: currentQ.visual.a }, (_, i) => (
                    <span key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-sm" />
                  ))}
                </div>
              )}

              {currentQ.visual?.type === 'add' && currentQ.visual.a && currentQ.visual.b && (
                <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/25">
                  {Array.from({ length: currentQ.visual.a }, (_, i) => (
                    <span key={`va_${i}`} className="w-6 h-6 rounded-md bg-blue-500" />
                  ))}
                  <span className="font-bold text-slate-400 px-1.5 text-lg">+</span>
                  {Array.from({ length: currentQ.visual.b }, (_, i) => (
                    <span key={`vb_${i}`} className="w-6 h-6 rounded-md bg-emerald-500" />
                  ))}
                </div>
              )}

              {currentQ.visual?.type === 'sub' &&
                currentQ.visual.a &&
                currentQ.visual.b !== undefined && (
                  <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/25">
                    {Array.from({ length: currentQ.visual.a }, (_, i) => (
                      <span
                        key={`vs_${i}`}
                        className={`w-6 h-6 rounded-md ${
                          i >= currentQ.visual!.a! - currentQ.visual!.b!
                            ? 'bg-red-500/35 border border-red-400'
                            : 'bg-blue-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
            </div>

            {/* Pill Option Buttons matching Reference Screen 4 */}
            <div className="space-y-3 max-w-md mx-auto w-full">
              {currentQ.options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === currentQ.correctAnswer;
                let style =
                  'bg-slate-50 dark:bg-[#0A1436] border-purple-500/35 text-slate-900 dark:text-white hover:border-cyan-400';

                if (isChecked) {
                  if (isCorrect) {
                    style =
                      'bg-gradient-to-r from-[#00D284] to-[#059669] border-emerald-300 text-white shadow-lg shadow-emerald-500/35';
                  } else if (isSelected && !isCorrect) {
                    style =
                      'bg-gradient-to-r from-rose-600 to-red-600 border-rose-400 text-white shadow-lg shadow-rose-500/30';
                  }
                } else if (isSelected) {
                  style =
                    'bg-gradient-to-r from-blue-600/40 to-purple-600/40 border-cyan-400 text-white shadow-md shadow-cyan-500/25';
                }

                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={isChecked}
                    onClick={() => setSelectedOption(opt)}
                    className={`w-full min-h-[54px] rounded-full border-2 px-5 py-3 text-lg font-extrabold font-mono-num transition-all flex items-center justify-between ${style}`}
                  >
                    <span className="w-6 shrink-0" />
                    <span className="truncate">{opt}</span>
                    <span className="w-6 flex items-center justify-end shrink-0">
                      {isChecked && isCorrect && <Check className="w-5 h-5 text-white stroke-[3]" />}
                      {isChecked && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner */}
            {isChecked && (
              <div
                className={`rounded-2xl p-4 border text-sm text-center space-y-1 max-w-md mx-auto ${
                  selectedOption === currentQ.correctAnswer
                    ? 'bg-emerald-500/15 border-emerald-400/50 text-emerald-700 dark:text-emerald-200'
                    : 'bg-rose-500/15 border-rose-400/50 text-rose-700 dark:text-rose-200'
                }`}
              >
                <div className="font-extrabold text-base flex items-center justify-center gap-2">
                  {selectedOption === currentQ.correctAnswer ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-400">სწორია!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-400" />
                      <span>სწორი პასუხი: {currentQ.correctAnswer}</span>
                    </>
                  )}
                </div>
                <p className="text-xs leading-relaxed opacity-90">{currentQ.explanation}</p>
              </div>
            )}

            <div className="max-w-md mx-auto w-full pt-1">
              {!isChecked ? (
                <button
                  type="button"
                  disabled={!selectedOption}
                  onClick={handleCheckAnswer}
                  className="w-full min-h-[50px] rounded-full sl-btn-purple disabled:opacity-40 text-white font-bold text-sm"
                >
                  პასუხის შემოწმება
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="w-full min-h-[50px] rounded-full sl-btn-blue text-white font-bold text-sm flex items-center justify-center gap-1.5"
                >
                  <span>{qIndex + 1 < questions.length ? 'შემდეგი' : 'შედეგის ნახვა'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {phase === 'result' && (
          <div className="rounded-3xl sl-card sl-frame-glow p-6 sm:p-8 space-y-5 text-center max-w-lg mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono-num text-slate-900 dark:text-white">
              {finalScore}% ({correctCount} / {questions.length})
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {finalScore >= 70
                ? 'შესანიშნავია! გაკვეთილი ჩაბარებულია და შენი პროგრესი შეინახა.'
                : 'გადასვლისთვის საჭიროა მინიმუმ 70%. გადახედე ახსნას და სცადე თავიდან.'}
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={startQuiz}
                className="min-h-[46px] px-5 py-2.5 rounded-full border border-purple-500/40 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>თავიდან გავლა</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveLesson(null)}
                className="min-h-[46px] px-6 py-2.5 rounded-full sl-btn-blue text-white text-sm font-bold"
              >
                თემების სიაში დაბრუნება
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SCREEN 3: MATHEMATICS TOPICS & CURRICULUM
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Purple Gradient Level Banner (Reference Screen 3) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#5B3DF5] via-[#4C2DD8] to-[#3B21B8] p-4 sm:p-5 text-white flex items-center justify-between gap-4 shadow-lg shadow-purple-700/35 border border-purple-400/40">
        <div className="min-w-0">
          <div className="text-xs text-purple-200 font-medium">მათემატიკა</div>
          <h1 className="text-base sm:text-xl font-extrabold mt-0.5 break-words">
            შენი დონე: {completedLevelBadge} - {completedLevelBadge === 0 ? 'საწყისი' : 'აქტიური'}
          </h1>
          <div className="text-xs text-purple-100 mt-0.5">
            დასრულებული გაკვეთილები: {completedCount} / {allLessons.length}
          </div>
        </div>
        {/* Signal Level Bars */}
        <div className="flex items-end gap-1.5 h-9 shrink-0" aria-hidden="true">
          <span className="w-2 h-3 rounded-sm bg-white" />
          <span className={`w-2 h-5 rounded-sm ${completedLevelBadge >= 1 ? 'bg-white' : 'bg-white/35'}`} />
          <span className={`w-2 h-7 rounded-sm ${completedLevelBadge >= 2 ? 'bg-white' : 'bg-white/35'}`} />
          <span className={`w-2 h-9 rounded-sm ${completedLevelBadge >= 4 ? 'bg-white' : 'bg-white/35'}`} />
        </div>
      </div>

      {/* Topic Selector List + Selected Topic Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">აირჩიე თემა:</h2>
          <div className="space-y-2.5">
            {MATH_TOPICS.map((topic) => {
              const selected = selectedTopicId === topic.id;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={`w-full min-h-[58px] rounded-2xl p-2.5 pr-4 flex items-center justify-between gap-3 text-left transition-all border ${
                    selected
                      ? 'bg-[#111F4D] dark:bg-[#132255] border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'sl-card text-slate-900 dark:text-white hover:border-purple-400/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-br ${topic.badgeGradient} text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-md`}
                    >
                      {topic.badgeIcon || topic.badgeText}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{topic.title}</div>
                      <div
                        className={`text-[11px] truncate ${
                          selected ? 'text-cyan-200' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {topic.subtitle}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 ${selected ? 'text-cyan-400' : 'text-slate-400'}`}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleLaunchSelectedTopic}
            className="w-full min-h-[50px] rounded-full sl-btn-blue text-white font-bold text-sm flex items-center justify-center gap-2 mt-2"
          >
            <span>სწავლა დაწყება</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Full 6-Level Lesson List */}
        <section className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {MATH_LEVELS.map((lvl) => {
              const active = lvl.id === selectedLevelId;
              const doneCount = lvl.lessons.filter((l) => mathProgress.lessons[l.id]?.completed).length;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setSelectedLevelId(lvl.id)}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    active
                      ? 'sl-btn-purple border-purple-400 text-white'
                      : 'sl-card text-slate-700 dark:text-slate-300 hover:border-cyan-400/50'
                  }`}
                >
                  დონე {lvl.id} ({doneCount}/{lvl.lessons.length})
                </button>
              );
            })}
          </div>

          <div className="rounded-3xl sl-card p-4 min-[360px]:p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white break-words">
                {currentLevel.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 break-words">
                {currentLevel.description}
              </p>
            </div>

            <div className="space-y-3">
              {currentLevel.lessons.map((lesson) => {
                const unlocked = isMathLessonUnlocked(
                  lesson.levelId,
                  lesson.order,
                  mathProgress.lessons
                );
                const record = mathProgress.lessons[lesson.id];
                const completed = Boolean(record?.completed);
                // Allow direct practice on the selected topic's first lesson or unlocked lessons
                const canOpen = unlocked || lesson.order === 1;

                return (
                  <div
                    key={lesson.id}
                    className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col min-[440px]:flex-row min-[440px]:items-center justify-between gap-3 sm:gap-4 ${
                      canOpen
                        ? 'bg-slate-50 dark:bg-[#070D24] border-purple-500/30'
                        : 'bg-slate-100/70 dark:bg-[#070D24]/45 border-slate-300/60 dark:border-slate-800/40 opacity-75'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          completed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40'
                            : canOpen
                            ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white'
                            : 'bg-slate-300 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : canOpen ? (
                          lesson.order
                        ) : (
                          <Lock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-slate-900 dark:text-white break-words">
                          {lesson.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-words">
                          {canOpen
                            ? record
                              ? `${lesson.subtitle} · საუკეთესო: ${record.bestScore}%`
                              : lesson.subtitle
                            : 'დაბლოკილია — ჯერ დაასრულე წინა გაკვეთილი (≥70%)'}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!canOpen}
                      onClick={() => openLesson(lesson, false)}
                      className={`min-h-[44px] w-full min-[440px]:w-auto px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap shrink-0 ${
                        canOpen
                          ? 'sl-btn-blue text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {completed ? 'გამეორება' : canOpen ? 'დაწყება' : 'ჩაკეტილია'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
