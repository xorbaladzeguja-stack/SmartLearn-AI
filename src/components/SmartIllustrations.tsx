import React from 'react';

export const BrainBookHeroIllustration: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => (
  <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="slHeroAura" cx="50%" cy="48%" r="50%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
        <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#091233" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="slBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="52%" stopColor="#6D5BFF" />
        <stop offset="100%" stopColor="#FF3EC9" />
      </linearGradient>
      <linearGradient id="slBookCover" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#1D4ED8" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="slCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E293B" />
        <stop offset="100%" stopColor="#0F172A" />
      </linearGradient>
      <filter id="slGlow" x="-25%" y="-25%" width="150%" height="150%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Cosmic Aura & Stars */}
    <circle cx="120" cy="122" r="105" fill="url(#slHeroAura)" />
    <circle cx="38" cy="64" r="2.2" fill="#7DD3FC" opacity="0.85" />
    <circle cx="200" cy="70" r="2.5" fill="#F472B6" opacity="0.85" />
    <circle cx="50" cy="144" r="1.8" fill="#A5F3FC" opacity="0.7" />
    <circle cx="195" cy="148" r="2" fill="#C4B5FD" opacity="0.8" />
    <path d="M44 92 L47 98 L53 101 L47 104 L44 110 L41 104 L35 101 L41 98 Z" fill="#38BDF8" opacity="0.8" />
    <path d="M196 108 L198 113 L203 115 L198 117 L196 122 L194 117 L189 115 L194 113 Z" fill="#F472B6" opacity="0.85" />

    {/* Graduation Cap */}
    <g filter="url(#slGlow)">
      <polygon points="120,26 176,47 120,68 64,47" fill="url(#slCapGrad)" stroke="#38BDF8" strokeWidth="2" />
      <path d="M88,56 L88,73 C88,79 152,79 152,73 L152,56" fill="#172554" stroke="#60A5FA" strokeWidth="1.6" />
      <line x1="168" y1="50" x2="168" y2="86" stroke="#FBBF24" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="168" cy="88" r="4" fill="#FBBF24" />
    </g>

    {/* Glowing Brain */}
    <g filter="url(#slGlow)">
      {/* Left Hemisphere */}
      <path
        d="M118,80 C96,74 74,84 68,104 C62,119 67,138 80,148 C90,156 105,157 118,152 Z"
        fill="url(#slBrainGrad)"
        opacity="0.92"
        stroke="#A5F3FC"
        strokeWidth="2"
      />
      {/* Right Hemisphere */}
      <path
        d="M122,80 C144,74 166,84 172,104 C178,119 173,138 160,148 C150,156 135,157 122,152 Z"
        fill="url(#slBrainGrad)"
        opacity="0.92"
        stroke="#F9A8D4"
        strokeWidth="2"
      />
      {/* Neural Circuits */}
      <path d="M82,106 Q96,95 108,108 T115,126" fill="none" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M78,128 Q94,122 104,136" fill="none" stroke="#E0F2FE" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M158,106 Q144,95 132,108 T125,126" fill="none" stroke="#FCE7F3" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M162,128 Q146,122 136,136" fill="none" stroke="#FCE7F3" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="96" cy="100" r="3" fill="#FFFFFF" />
      <circle cx="144" cy="100" r="3" fill="#FFFFFF" />
      <circle cx="88" cy="128" r="2.6" fill="#FFFFFF" />
      <circle cx="152" cy="128" r="2.6" fill="#FFFFFF" />
    </g>

    {/* Open Glowing Book */}
    <g filter="url(#slGlow)">
      <path
        d="M42,175 Q81,158 120,176 Q159,158 198,175 L190,204 Q155,190 120,206 Q85,190 50,204 Z"
        fill="url(#slBookCover)"
        stroke="#38BDF8"
        strokeWidth="2"
      />
      <path
        d="M52,166 Q86,150 118,170 L118,196 Q86,178 55,192 Z"
        fill="#E0F2FE"
        stroke="#93C5FD"
        strokeWidth="1.5"
      />
      <path
        d="M188,166 Q154,150 122,170 L122,196 Q154,178 185,192 Z"
        fill="#FCE7F3"
        stroke="#C4B5FD"
        strokeWidth="1.5"
      />
      <line x1="120" y1="168" x2="120" y2="205" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  </svg>
);

export const UserAvatarBadge: React.FC<{ name?: string; className?: string }> = ({
  name = 'მ',
  className = 'w-14 h-14',
}) => {
  const initial = (name.trim()[0] || 'მ').toUpperCase();
  return (
    <div
      className={`relative rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0 ${className}`}
    >
      <svg viewBox="0 0 80 80" className="w-full h-full rounded-full bg-[#132252]" aria-hidden="true">
        <defs>
          <linearGradient id="slAvatarBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="40" fill="url(#slAvatarBg)" />
        {/* Shoulders / Hoodie */}
        <path d="M16,78 C18,56 62,56 64,78 Z" fill="#0EA5E9" />
        <path d="M27,78 C29,63 51,63 53,78 Z" fill="#38BDF8" opacity="0.55" />
        {/* Head */}
        <circle cx="40" cy="34" r="15" fill="#FCD5B5" />
        {/* Hair */}
        <path d="M24,33 C24,18 56,16 56,32 C53,24 44,22 36,24 C30,25 27,29 24,33 Z" fill="#1E293B" />
        {/* Eyes + Smile */}
        <circle cx="34.5" cy="34.5" r="1.9" fill="#0F172A" />
        <circle cx="45.5" cy="34.5" r="1.9" fill="#0F172A" />
        <path d="M35.5,41 Q40,45 44.5,41" fill="none" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" />
        <text x="64" y="21" fontSize="11" fontWeight="bold" fill="#38BDF8" textAnchor="middle">
          {initial}
        </text>
      </svg>
    </div>
  );
};

export const UkFlagBadge: React.FC<{ className?: string }> = ({ className = 'w-11 h-8' }) => (
  <svg viewBox="0 0 60 36" className={`rounded-lg shadow-md shrink-0 ${className}`} aria-hidden="true">
    <rect width="60" height="36" fill="#012169" />
    <path d="M0,0 L60,36 M60,0 L0,36" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="2.5" />
    <path d="M30,0 V36 M0,18 H60" stroke="#FFFFFF" strokeWidth="10" />
    <path d="M30,0 V36 M0,18 H60" stroke="#C8102E" strokeWidth="5.5" />
  </svg>
);

export const AiRobotTeacherIllustration: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => (
  <svg viewBox="0 0 160 160" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="slRobotAura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#091233" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="slRobotShell" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#F8FAFC" />
        <stop offset="100%" stopColor="#CBD5E1" />
      </linearGradient>
    </defs>
    <circle cx="80" cy="80" r="72" fill="url(#slRobotAura)" />
    {/* Antenna */}
    <line x1="80" y1="16" x2="80" y2="30" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" />
    <circle cx="80" cy="14" r="5" fill="#22D3EE" />
    {/* Ears */}
    <rect x="30" y="50" width="10" height="24" rx="5" fill="#3B82F6" />
    <rect x="120" y="50" width="10" height="24" rx="5" fill="#3B82F6" />
    {/* Head */}
    <rect x="38" y="30" width="84" height="58" rx="22" fill="url(#slRobotShell)" stroke="#38BDF8" strokeWidth="2" />
    {/* Visor */}
    <rect x="48" y="42" width="64" height="32" rx="14" fill="#091233" />
    {/* Eyes */}
    <circle cx="65" cy="57" r="6" fill="#22D3EE" />
    <circle cx="95" cy="57" r="6" fill="#22D3EE" />
    <circle cx="67" cy="55" r="2" fill="#FFFFFF" />
    <circle cx="97" cy="55" r="2" fill="#FFFFFF" />
    <path d="M72,66 Q80,71 88,66" fill="none" stroke="#38BDF8" strokeWidth="2.4" strokeLinecap="round" />
    {/* Body & Open Book */}
    <rect x="46" y="92" width="68" height="46" rx="18" fill="url(#slRobotShell)" stroke="#60A5FA" strokeWidth="1.8" />
    <circle cx="80" cy="106" r="6" fill="#38BDF8" opacity="0.85" />
    {/* Book held in front */}
    <path d="M40,118 Q60,110 80,120 Q100,110 120,118 L116,144 Q98,136 80,145 Q62,136 44,144 Z" fill="#1D4ED8" stroke="#7DD3FC" strokeWidth="2" />
    <path d="M46,116 Q63,109 79,119 L79,140 Q63,131 48,138 Z" fill="#E0F2FE" />
    <path d="M114,116 Q97,109 81,119 L81,140 Q97,131 112,138 Z" fill="#E0F2FE" />
  </svg>
);

export const MeditationSunsetHero: React.FC<{ className?: string }> = ({ className = 'w-full h-40' }) => (
  <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
    <defs>
      <linearGradient id="slSunsetSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1E1B4B" />
        <stop offset="45%" stopColor="#9D174D" />
        <stop offset="82%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#FDE68A" />
      </linearGradient>
      <radialGradient id="slSunCore" cx="50%" cy="62%" r="36%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="1" />
        <stop offset="55%" stopColor="#FB923C" stopOpacity="0.65" />
        <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="600" height="220" fill="url(#slSunsetSky)" />
    <circle cx="300" cy="130" r="115" fill="url(#slSunCore)" />
    <circle cx="300" cy="126" r="42" fill="#FEF9C3" opacity="0.92" />
    {/* Stars */}
    <circle cx="70" cy="36" r="1.8" fill="#FFF" opacity="0.85" />
    <circle cx="145" cy="24" r="1.4" fill="#FFF" opacity="0.7" />
    <circle cx="480" cy="30" r="2" fill="#FFF" opacity="0.85" />
    <circle cx="540" cy="54" r="1.5" fill="#FFF" opacity="0.7" />
    {/* Distant Mountains */}
    <polygon points="0,220 0,152 95,124 195,165 290,136 405,168 510,122 600,158 600,220" fill="#311042" opacity="0.85" />
    <polygon points="0,220 80,176 190,192 300,168 420,190 540,172 600,195 600,220" fill="#110A2B" />
    {/* Calm Meditation Silhouette */}
    <circle cx="300" cy="98" r="13" fill="#0B071C" />
    <path
      d="M286,114 C293,111 307,111 314,114 L323,136 L342,155 C345,158 343,163 338,164 L262,164 C257,163 255,158 258,155 L277,136 Z"
      fill="#0B071C"
    />
    {/* Lotus Pose Legs */}
    <ellipse cx="300" cy="162" rx="42" ry="10" fill="#0B071C" />
  </svg>
);
