import React, { useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  Clock,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { AppData } from '../../types/app';
import { MATH_LEVELS } from '../../data/mathCurriculum';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { AiRobotTeacherIllustration } from '../../components/SmartIllustrations';

interface AITeacherModuleProps {
  data: AppData;
  initialPrompt?: string;
  onGoToOfflineLessons: () => void;
  onStartDailyAssignment?: () => void;
}

interface PracticeCard {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface TeacherMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  steps?: string[];
  hintOnly?: boolean;
  practiceQuestion?: PracticeCard;
}

export const AITeacherModule: React.FC<AITeacherModuleProps> = ({
  data,
  initialPrompt = '',
  onGoToOfflineLessons,
  onStartDailyAssignment,
}) => {
  const isOnline = useOnlineStatus();
  const [subject, setSubject] = useState<'math' | 'english' | 'general'>('general');
  const [mode, setMode] = useState<'explain' | 'hint' | 'worked_example' | 'practice'>('explain');
  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeacherMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `გამარჯობა, ${
        data.profile.name || 'მოსწავლე'
      }! მე ვარ შენი პირადი AI მასწავლებელი. მკითხე მათემატიკის ან ინგლისურის შესახებ, მოითხოვე მინიშნება ან ეტაპობრივი ახსნა.`,
    },
  ]);

  const [pickedAnswers, setPickedAnswers] = useState<Record<string, string>>({});
  const [convMode, setConvMode] = useState(false);
  const [convScenario, setConvScenario] = useState('greeting');

  const weakTopics = [
    ...data.mathProgress.weakTopics,
    ...data.englishProgress.weakTopics,
  ].slice(0, 6);

  const recentMistakes = [
    ...data.mathProgress.recentMistakes,
    ...data.englishProgress.recentMistakes,
  ].slice(0, 4);

  const totalMath = MATH_LEVELS.reduce((acc, l) => acc + l.lessons.length, 0);
  const completedLessons =
    Object.values(data.mathProgress.lessons).filter((l) => l.completed).length +
    data.englishProgress.completedStages.length;
  const statsPct = Math.min(100, Math.round((completedLessons / Math.max(1, totalMath + 7)) * 100));

  const focusTopicText =
    weakTopics[0] ||
    (data.profile.subjectFocus === 'english'
      ? 'ინგლისური ანბანი და სიტყვები'
      : 'მათემატიკა: მიმატება და საფუძვლები');

  const sendTeacherMessage = async (overrideText?: string, overrideMode = mode) => {
    const textToSend = (overrideText !== undefined ? overrideText : input).trim();
    if (!textToSend || loading) return;

    if (!isOnline) {
      setErrorMsg(
        'ინტერნეტთან კავშირი გამორთულია. AI მასწავლებელს სჭირდება ინტერნეტი — შეგიძლია გააგრძელო ოფლაინ გაკვეთილებით.'
      );
      return;
    }

    setErrorMsg(null);
    const userMsg: TeacherMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (overrideText === undefined) setInput('');
    setLoading(true);

    try {
      if (convMode) {
        const res = await fetch('/api/ai/english', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userSentence: textToSend,
            scenario: convScenario,
            level: data.profile.level,
          }),
        });
        const payload = await res.json();
        if (!res.ok) {
          setErrorMsg(payload.error || 'AI სერვისი დროებით მიუწვდომელია.');
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `m_${Date.now()}`,
              role: 'model',
              text: `${payload.isCorrect ? 'სწორია! ' : ''}${payload.georgianFeedback}\n\nსწორი ფორმა: ${
                payload.correctedEnglish
              }\n\nდიალოგის გაგრძელება: "${payload.nextEnglishPrompt}" (${payload.nextPromptGeorgian})`,
            },
          ]);
        }
      } else {
        const res = await fetch('/api/ai/teacher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: textToSend,
            mode: overrideMode,
            subject,
            userContext: {
              level: data.profile.level,
              completedLessons,
              weakTopics,
              recentMistakes,
            },
            history: messages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          }),
        });
        const payload = await res.json();
        if (!res.ok) {
          setErrorMsg(payload.error || 'AI მასწავლებელი დროებით მიუწვდომელია.');
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `m_${Date.now()}`,
              role: 'model',
              text: payload.reply || 'მიღებულია.',
              steps: Array.isArray(payload.steps) ? payload.steps : [],
              hintOnly: Boolean(payload.hintOnly),
              practiceQuestion: payload.practiceQuestion,
            },
          ]);
        }
      }
    } catch {
      setErrorMsg(
        'სერვერთან დაკავშირება ვერ მოხერხდა. შეგიძლია გააგრძელო შენახული ოფლაინ გაკვეთილებით.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3.5 short-viewport-gap h-[calc(100dvh-9.5rem)] md:h-[calc(100dvh-4.5rem)] min-h-[240px]">
      {/* Top Robot Greeting + Daily Context Card (Reference Screen 6) */}
      <section className="shrink-0 rounded-2xl sm:rounded-3xl sl-card sl-frame-glow p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <AiRobotTeacherIllustration className="w-14 h-14 sm:w-20 sm:h-20 shrink-0" />
            <div className="min-w-0 space-y-1">
              <div className="inline-block rounded-2xl rounded-tl-sm bg-white/95 dark:bg-slate-100 text-slate-900 px-3 py-1.5 text-xs font-bold shadow">
                გამარჯობა! დღევანდელი დავალება:
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {focusTopicText}
              </h1>
              <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  მიზანი: {data.profile.dailyGoalMinutes} წთ
                </span>
                <span className="inline-flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  სტატისტიკა: {statsPct}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onStartDailyAssignment || onGoToOfflineLessons}
              className="min-h-[40px] px-4 py-1.5 rounded-full sl-btn-purple text-white text-xs font-bold flex items-center justify-center gap-1 whitespace-nowrap"
            >
              <span>დავალების დაწყება</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setConvMode((c) => !c)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap ${
                convMode
                  ? 'sl-btn-blue border-cyan-400 text-white'
                  : 'bg-slate-50 dark:bg-[#070D24] border-purple-500/35 text-slate-700 dark:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>{convMode ? 'სტანდარტული რეჟიმი' : 'ინგლისური საუბარი'}</span>
            </button>
          </div>
        </div>

        {/* Mini Progress Bar (hidden on ultra short screens) */}
        <div className="hidden sm:block short-viewport-hide mt-2.5 pt-2.5 border-t border-purple-500/20">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-500 dark:text-slate-300 font-medium">შენი სტატისტიკა</span>
            <span className="font-mono-num font-bold text-emerald-400">{statsPct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#060B22] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${Math.max(5, statsPct)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Subject & Mode Pills */}
      <div className="space-y-1.5 shrink-0">
        {!convMode ? (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {(
              [
                ['general', 'ზოგადი'],
                ['math', 'მათემატიკა'],
                ['english', 'ინგლისური'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSubject(id)}
                className={`min-h-[38px] px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 ${
                  subject === id
                    ? 'sl-btn-blue border-cyan-400 text-white'
                    : 'sl-card text-slate-700 dark:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}

            <span className="text-slate-400 px-0.5 shrink-0">·</span>

            {(
              [
                ['explain', 'მარტივი ახსნა'],
                ['hint', 'მხოლოდ მინიშნება'],
                ['worked_example', 'ამოხსნილი მაგალითი'],
                ['practice', 'სავარჯიშო კითხვა'],
              ] as const
            ).map(([mId, mLabel]) => (
              <button
                key={mId}
                type="button"
                onClick={() => setMode(mId)}
                className={`min-h-[38px] px-3 py-1 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 ${
                  mode === mId
                    ? 'sl-btn-purple border-purple-400 text-white'
                    : 'sl-card text-slate-700 dark:text-slate-200'
                }`}
              >
                {mLabel}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {[
              ['greeting', 'მისალმება'],
              ['shopping', 'მაღაზიაში'],
              ['directions', 'გზის კითხვა'],
              ['intro', 'გაცნობა'],
            ].map(([sc, lbl]) => (
              <button
                key={sc}
                type="button"
                onClick={() => setConvScenario(sc)}
                className={`min-h-[38px] px-3.5 py-1 rounded-full border text-xs font-bold whitespace-nowrap shrink-0 ${
                  convScenario === sc
                    ? 'sl-btn-purple border-purple-400 text-white'
                    : 'sl-card'
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        )}

        {!convMode && (
          <div className="flex short-viewport-hide items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => sendTeacherMessage('ამიხსენი ათეულის გავლით მიმატება მარტივად.', 'explain')}
              className="min-h-[36px] px-3 py-1 rounded-full sl-card text-xs whitespace-nowrap shrink-0 hover:border-cyan-400/60"
            >
              ამიხსენი მიმატება 20-მდე
            </button>
            <button
              type="button"
              onClick={() => sendTeacherMessage('ამიხსენი ინგლისური არტიკლები a, an, the ქართულად.', 'explain')}
              className="min-h-[36px] px-3 py-1 rounded-full sl-card text-xs whitespace-nowrap shrink-0 hover:border-cyan-400/60"
            >
              ინგლისური არტიკლები
            </button>
            <button
              type="button"
              onClick={() =>
                sendTeacherMessage(
                  weakTopics.length > 0
                    ? `ჩემი სუსტი თემებია: ${weakTopics.join(', ')}. მომეცი პრაქტიკული კითხვა.`
                    : 'მომეცი ჩემი დონის შესაბამისი სავარჯიშო კითხვა.',
                  'practice'
                )
              }
              className="min-h-[36px] px-3 py-1 rounded-full sl-card text-xs whitespace-nowrap shrink-0 hover:border-cyan-400/60"
            >
              სავარჯიშო სუსტ თემებზე
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 min-h-0 rounded-2xl sm:rounded-3xl sl-card p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-sm space-y-3 min-w-0 ${
                msg.role === 'user'
                  ? 'sl-btn-blue text-white'
                  : 'bg-slate-50 dark:bg-[#070D24] border border-purple-500/30 text-slate-900 dark:text-slate-100'
              }`}
            >
              {msg.hintOnly && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Lightbulb className="w-4 h-4 shrink-0" />
                  <span>მინიშნება (სცადე ჯერ თავად ამოხსნა)</span>
                </div>
              )}

              <div className="whitespace-pre-line leading-relaxed break-words">{msg.text}</div>

              {msg.steps && msg.steps.length > 0 && (
                <ol className="space-y-1.5 text-xs border-t border-purple-500/20 pt-2.5">
                  {msg.steps.map((st, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold text-cyan-400 shrink-0">{idx + 1}.</span>
                      <span className="break-words">{st}</span>
                    </li>
                  ))}
                </ol>
              )}

              {msg.practiceQuestion && (
                <div className="rounded-xl bg-white dark:bg-[#0D183D] border border-purple-500/35 p-3 sm:p-3.5 space-y-2.5">
                  <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>პრაქტიკული სავარჯიშო</span>
                  </div>
                  <div className="font-bold text-sm break-words">{msg.practiceQuestion.question}</div>
                  <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-2">
                    {msg.practiceQuestion.options.map((opt) => {
                      const picked = pickedAnswers[msg.id] === opt;
                      const answered = Boolean(pickedAnswers[msg.id]);
                      const isRight = opt === msg.practiceQuestion!.correctAnswer;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={answered}
                          onClick={() => setPickedAnswers((prev) => ({ ...prev, [msg.id]: opt }))}
                          className={`min-h-[44px] rounded-xl border px-3 py-1.5 text-xs font-bold break-words ${
                            answered && isRight
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-600 dark:text-emerald-300'
                              : answered && picked
                              ? 'bg-rose-500/25 border-rose-400 text-rose-600 dark:text-rose-300'
                              : 'bg-slate-50 dark:bg-[#070D24] border-purple-500/30'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-xs text-cyan-400 font-medium">მასწავლებელი ფიქრობს...</div>
        )}
      </div>

      {errorMsg && (
        <div className="shrink-0 rounded-2xl bg-rose-500/15 border border-rose-500/40 p-3 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={onGoToOfflineLessons}
            className="min-h-[40px] px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0D183D] border border-rose-400/40 font-bold flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>ოფლაინ გაკვეთილები</span>
          </button>
        </div>
      )}

      {/* Always-Pinned Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendTeacherMessage();
        }}
        className="flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            convMode
              ? 'დაწერე ინგლისური წინადადება (მაგ: Hello)...'
              : 'დასვი შეკითხვა ქართულად...'
          }
          className="flex-1 min-w-0 min-h-[48px] rounded-full sl-card px-4 text-base sm:text-sm focus:outline-none focus:border-cyan-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="გაგზავნა"
          className="min-w-[48px] min-h-[48px] px-4 sm:px-5 rounded-full sl-btn-purple disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">გაგზავნა</span>
        </button>
      </form>
    </div>
  );
};
