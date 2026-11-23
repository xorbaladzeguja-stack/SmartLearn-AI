import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookMarked,
  Flower2,
  Heart,
  Leaf,
  Lock,
  MessageCircle,
  Moon,
  Pause,
  Play,
  Send,
  Smile,
  Wind,
} from 'lucide-react';
import { JournalEntry, MoodEntry, MoodType } from '../../types/app';
import { getTodayDateStr } from '../../services/storage';
import { useOnlineStatus } from '../../hooks/usePWAInstall';
import { MeditationSunsetHero } from '../../components/SmartIllustrations';

interface WellnessModuleProps {
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  onAddMood: (mood: MoodType, note: string) => void;
  onAddJournal: (title: string, content: string) => void;
}

const MOOD_OPTIONS: { id: MoodType; label: string; color: string }[] = [
  { id: 'happy', label: 'ბედნიერი', color: 'border-emerald-400 bg-emerald-500/20 text-emerald-300' },
  { id: 'calm', label: 'მშვიდი', color: 'border-cyan-400 bg-cyan-500/20 text-cyan-300' },
  { id: 'tired', label: 'დაღლილი', color: 'border-amber-400 bg-amber-500/20 text-amber-300' },
  { id: 'stressed', label: 'სტრესული', color: 'border-orange-400 bg-orange-500/20 text-orange-300' },
  { id: 'sad', label: 'სევდიანი', color: 'border-blue-400 bg-blue-500/20 text-blue-300' },
  { id: 'anxious', label: 'შეშფოთებული', color: 'border-purple-400 bg-purple-500/20 text-purple-300' },
];

export const WellnessModule: React.FC<WellnessModuleProps> = ({
  moodEntries,
  journalEntries,
  onAddMood,
  onAddJournal,
}) => {
  const isOnline = useOnlineStatus();
  const [selectedMood, setSelectedMood] = useState<MoodType>('calm');
  const [moodNote, setMoodNote] = useState('');
  const [moodSavedToast, setMoodSavedToast] = useState(false);

  const breathingRef = useRef<HTMLElement>(null);
  const moodRef = useRef<HTMLElement>(null);
  const journalRef = useRef<HTMLElement>(null);
  const chatRef = useRef<HTMLElement>(null);

  const [sleepTipOpen, setSleepTipOpen] = useState(false);

  // Breathing timer (4-4-4-2 box breathing)
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathState, setBreathState] = useState({ stageIdx: 0, sec: 4, cycles: 0 });

  const breathStages = [
    { label: 'ჩაისუნთქე ნელა', duration: 4, scale: 'scale-125 bg-cyan-500/30 border-cyan-400' },
    { label: 'შეიკავე სუნთქვა', duration: 4, scale: 'scale-125 bg-blue-500/30 border-blue-400' },
    { label: 'ამოისუნთქე მშვიდად', duration: 4, scale: 'scale-90 bg-emerald-500/25 border-emerald-400' },
    { label: 'დაისვენე', duration: 2, scale: 'scale-90 bg-purple-500/20 border-purple-400' },
  ];

  useEffect(() => {
    if (!breathingActive) return;
    const t = setInterval(() => {
      setBreathState((prev) => {
        if (prev.sec > 1) {
          return { ...prev, sec: prev.sec - 1 };
        }
        const nextIdx = (prev.stageIdx + 1) % breathStages.length;
        return {
          stageIdx: nextIdx,
          sec: breathStages[nextIdx].duration,
          cycles: nextIdx === 0 ? prev.cycles + 1 : prev.cycles,
        };
      });
    }, 1000);
    return () => clearInterval(t);
  }, [breathingActive]);

  // Private journal
  const [jTitle, setJTitle] = useState('');
  const [jContent, setJContent] = useState('');
  const [journalError, setJournalError] = useState('');

  // AI Wellness chat
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [safetyAlert, setSafetyAlert] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: 'გამარჯობა. შეგიძლია გამიზიარო როგორ ჩაიარა დღემ, რა გაღელვებს ან უბრალოდ ვისაუბროთ სიმშვიდესა და მოტივაციაზე.',
    },
  ]);

  const handleSaveMood = () => {
    onAddMood(selectedMood, moodNote.trim());
    setMoodNote('');
    setMoodSavedToast(true);
    setTimeout(() => setMoodSavedToast(false), 2500);
  };

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    setJournalError('');
    if (jContent.trim().length < 5) {
      setJournalError('ჩაწერე მინიმუმ რამდენიმე სიტყვა დღიურში.');
      return;
    }
    onAddJournal(jTitle.trim() || `ჩანაწერი · ${getTodayDateStr()}`, jContent.trim());
    setJTitle('');
    setJContent('');
  };

  const sendWellnessMessage = async (textOverride?: string) => {
    const msg = (textOverride ?? chatInput).trim();
    if (!msg || chatLoading) return;
    if (!isOnline) {
      setChatError(
        'AI საუბრისთვის საჭიროა ინტერნეტი. სუნთქვის ტაიმერი და პირადი დღიური მუშაობს ოფლაინ.'
      );
      return;
    }

    setChatError('');
    setChatHistory((prev) => [...prev, { role: 'user', text: msg }]);
    if (!textOverride) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/wellness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          mood: selectedMood,
          history: chatHistory.slice(-6),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setChatError(payload.error || 'სერვისი დროებით მიუწვდომელია.');
      } else {
        if (payload.safetyAlert) setSafetyAlert(true);
        setChatHistory((prev) => [...prev, { role: 'model', text: payload.reply }]);
      }
    } catch {
      setChatError('კავშირის შეცდომა. გამოიყენე სუნთქვის ვარჯიში ან პირადი დღიური.');
    } finally {
      setChatLoading(false);
    }
  };

  const currentStage = breathStages[breathState.stageIdx];

  const topicRows = [
    {
      id: 'stress',
      title: 'სტრესის მართვა',
      icon: <Flower2 className="w-5 h-5 text-pink-400" />,
      bg: 'bg-pink-500/20',
      action: () => {
        setBreathState({ stageIdx: 0, sec: 4, cycles: 0 });
        setBreathingActive(true);
        breathingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
    },
    {
      id: 'positive',
      title: 'დადებითი აზრები',
      icon: <Smile className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/20',
      action: () => moodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    },
    {
      id: 'confidence',
      title: 'თვითრწმენა',
      icon: <Heart className="w-5 h-5 text-rose-400" />,
      bg: 'bg-rose-500/20',
      action: () => journalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    },
    {
      id: 'sleep',
      title: 'კარგი ძილი',
      icon: <Moon className="w-5 h-5 text-sky-400" />,
      bg: 'bg-sky-500/20',
      action: () => setSleepTipOpen((o) => !o),
    },
    {
      id: 'motivation',
      title: 'მოტივაცია',
      icon: <Leaf className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/20',
      action: () => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        void sendWellnessMessage('დღეს მოტივაცია მჭირდება სწავლის გასაგრძელებლად.');
      },
    },
    {
      id: 'ai_talk',
      title: 'საუბარი AI-თან',
      icon: <MessageCircle className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-500/20',
      action: () => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Screen 7 Warm Sunset Meditation Hero + Topic List */}
      <section className="rounded-3xl sl-card sl-frame-glow overflow-hidden">
        <div className="relative">
          <MeditationSunsetHero className="w-full h-36 sm:h-48" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#091233] via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white drop-shadow">
                ფსიქოლოგიური დამხმარე
              </h1>
              <p className="text-xs text-amber-100/90 drop-shadow">
                მშვიდი გონება — ძლიერი შენ · აპი არ ცვლის ექიმს ან ფსიქოლოგს
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {topicRows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={row.action}
                className="min-h-[52px] rounded-2xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/30 hover:border-cyan-400 px-3.5 py-2.5 flex items-center gap-3 text-left transition-all"
              >
                <span className={`w-9 h-9 rounded-full ${row.bg} flex items-center justify-center shrink-0`}>
                  {row.icon}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {row.title}
                </span>
              </button>
            ))}
          </div>

          {sleepTipOpen && (
            <div className="rounded-2xl bg-sky-500/15 border border-sky-400/40 p-4 text-xs text-slate-800 dark:text-sky-100 space-y-1">
              <strong className="block text-sm">მშვიდი ძილის რჩევები:</strong>
              <p>
                ძილამდე 30 წუთით ადრე შეამცირე ეკრანის განათება, გააკეთე 4-4-4 სუნთქვის 3 ციკლი და
                ჩაწერე 1 პატარა მადლიერების ფიქრი პირად დღიურში.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              void sendWellnessMessage('მომეცი მოკლე დამამშვიდებელი რჩევა და გამამხნევე.');
            }}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3 rounded-full sl-btn-purple text-white font-bold text-sm flex items-center justify-center mx-auto"
          >
            რჩევის მიღება
          </button>
        </div>
      </section>

      {safetyAlert && (
        <div className="rounded-2xl bg-rose-500/15 border border-rose-500/50 p-4 text-sm text-rose-900 dark:text-rose-100 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <strong>გადაუდებელი დახმარება:</strong> თუ საფრთხეში ხარ ან მძიმე კრიზისს გადიხარ, დარეკე{' '}
            <strong>112</strong>-ზე ან დაუკავშირდი სანდო ახლობელსა და პროფესიონალს.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Daily Mood Check-in */}
        <section ref={moodRef} className="rounded-3xl sl-card p-4 min-[360px]:p-5 sm:p-6 space-y-4">
          <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
            დღევანდელი განწყობის აღრიცხვა
          </h2>
          <div className="grid grid-cols-2 min-[460px]:grid-cols-3 gap-2">
            {MOOD_OPTIONS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                className={`min-h-[46px] rounded-2xl border px-2.5 py-2 text-xs font-bold transition-all break-words ${
                  selectedMood === m.id
                    ? m.color
                    : 'bg-slate-50 dark:bg-[#070D24] border-purple-500/25 text-slate-700 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
            placeholder="მოკლე შენიშვნა (სურვილისამებრ)..."
            className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/35 px-3.5 text-base sm:text-sm"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSaveMood}
              className="min-h-[44px] w-full min-[380px]:w-auto px-5 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold"
            >
              განწყობის შენახვა
            </button>
            {moodSavedToast && (
              <span className="text-xs text-emerald-400 font-bold">შენახულია მოწყობილობაზე</span>
            )}
          </div>

          {moodEntries.length > 0 && (
            <div className="pt-3 border-t border-purple-500/20 space-y-1.5">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400">ბოლო ჩანაწერები:</div>
              {moodEntries
                .slice(-3)
                .reverse()
                .map((me) => (
                  <div
                    key={me.id}
                    className="text-xs text-slate-600 dark:text-slate-300 flex justify-between gap-2"
                  >
                    <span>{MOOD_OPTIONS.find((o) => o.id === me.mood)?.label}</span>
                    <span className="font-mono-num text-slate-400 shrink-0">{me.date}</span>
                  </div>
                ))}
            </div>
          )}
        </section>

        {/* Guided Breathing Timer */}
        <section
          ref={breathingRef}
          className="rounded-3xl sl-card p-4 min-[360px]:p-5 sm:p-6 flex flex-col items-center justify-between text-center space-y-5 overflow-hidden"
        >
          <div className="w-full flex items-center justify-between gap-2">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>სუნთქვის სავარჯიშო</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono-num shrink-0">
              ციკლი: {breathState.cycles}
            </span>
          </div>

          <div className="py-8 sm:py-10 flex items-center justify-center">
            <div
              className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 flex flex-col items-center justify-center transition-transform duration-1000 ease-in-out shadow-lg shadow-cyan-500/20 ${
                breathingActive
                  ? currentStage.scale
                  : 'scale-100 bg-slate-100 dark:bg-[#070D24] border-purple-500/40'
              }`}
            >
              <div className="text-2xl sm:text-3xl font-extrabold font-mono-num text-slate-900 dark:text-white">
                {breathingActive ? breathState.sec : '4-4-4'}
              </div>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-200 mt-1 px-2">
                {breathingActive ? currentStage.label : 'დასაწყებად დააჭირე'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (breathingActive) {
                setBreathingActive(false);
              } else {
                setBreathState((prev) => ({
                  ...prev,
                  stageIdx: 0,
                  sec: breathStages[0].duration,
                }));
                setBreathingActive(true);
              }
            }}
            className="min-h-[44px] w-full min-[380px]:w-auto px-6 py-2.5 rounded-full sl-btn-blue text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            {breathingActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{breathingActive ? 'გაჩერება' : 'სუნთქვის დაწყება'}</span>
          </button>
        </section>
      </div>

      {/* Private Local Journal + AI Supportive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section ref={journalRef} className="rounded-3xl sl-card p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-purple-400" />
              <span>პირადი დღიური</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>ინახება მხოლოდ ამ მოწყობილობაზე და არასდროს იგზავნება AI-სთან.</span>
            </p>
          </div>

          <form onSubmit={handleSaveJournal} className="space-y-3">
            <input
              type="text"
              value={jTitle}
              onChange={(e) => setJTitle(e.target.value)}
              placeholder="სათაური (სურვილისამებრ)"
              className="w-full min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/35 px-3.5 text-base sm:text-sm"
            />
            <textarea
              rows={3}
              value={jContent}
              onChange={(e) => setJContent(e.target.value)}
              placeholder="დაწერე შენი ფიქრები, დღის შეჯამება ან მადლიერების ჩანაწერი..."
              className="w-full rounded-xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/35 p-3.5 text-base sm:text-sm"
            />
            {journalError && <div className="text-xs text-rose-400">{journalError}</div>}
            <button
              type="submit"
              className="min-h-[44px] w-full min-[380px]:w-auto px-5 py-2 rounded-full sl-btn-purple text-white text-xs font-bold"
            >
              დღიურში შენახვა
            </button>
          </form>

          {journalEntries.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-purple-500/20 max-h-48 overflow-y-auto">
              {journalEntries
                .slice()
                .reverse()
                .map((je) => (
                  <div
                    key={je.id}
                    className="rounded-xl bg-slate-50 dark:bg-[#070D24] border border-purple-500/25 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-900 dark:text-white">
                      <span className="truncate">{je.title}</span>
                      <span className="font-mono-num text-slate-400 shrink-0">
                        {je.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 break-words">
                      {je.content}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section
          ref={chatRef}
          className="rounded-3xl sl-card p-4 min-[360px]:p-5 sm:p-6 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-3">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">
              მშვიდი AI საუბარი და მხარდაჭერა
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => sendWellnessMessage('დღეს დავიღალე და მოტივაცია მჭირდება.')}
                className="min-h-[40px] px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#070D24] border border-purple-500/30 text-xs font-semibold"
              >
                მოტივაცია მჭირდება
              </button>
              <button
                type="button"
                onClick={() => sendWellnessMessage('რთული დღე მქონდა, როგორ განვიტვირთო?')}
                className="min-h-[40px] px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#070D24] border border-purple-500/30 text-xs font-semibold"
              >
                სტრესის მართვა
              </button>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {chatHistory.map((m, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-3 text-xs leading-relaxed break-words ${
                    m.role === 'user'
                      ? 'sl-btn-purple text-white ml-3 sm:ml-6'
                      : 'bg-slate-50 dark:bg-[#070D24] border border-purple-500/25 mr-3 sm:mr-6'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {chatLoading && <div className="text-xs text-cyan-400">პასუხი იწერება...</div>}
            </div>
            {chatError && <div className="text-xs text-amber-400">{chatError}</div>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendWellnessMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="გამიზიარე შენი ფიქრი..."
              className="flex-1 min-w-0 min-h-[44px] rounded-full bg-slate-50 dark:bg-[#070D24] border border-purple-500/35 px-4 text-base sm:text-sm"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              aria-label="გაგზავნა"
              className="min-w-[44px] min-h-[44px] px-4 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};
