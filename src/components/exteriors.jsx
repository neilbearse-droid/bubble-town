const StairsSVG = ({ size, dir }) => (
  <svg width={size} height={size * 0.92} viewBox="0 0 124 112" style={{ transform: dir === 'down' ? 'scaleX(-1)' : 'none' }}>
    <rect x="6" y="86" width="34" height="22" rx="4" fill="#C58B5A" />
    <rect x="6" y="82" width="34" height="6" rx="3" fill="#D9A86C" />
    <rect x="34" y="64" width="34" height="44" rx="4" fill="#B07D48" />
    <rect x="34" y="60" width="34" height="6" rx="3" fill="#C58B5A" />
    <rect x="62" y="42" width="34" height="66" rx="4" fill="#A86F47" />
    <rect x="62" y="38" width="34" height="6" rx="3" fill="#B07D48" />
    <rect x="90" y="20" width="28" height="88" rx="4" fill="#9A6A3F" />
    <rect x="90" y="16" width="28" height="6" rx="3" fill="#A86F47" />
    <path d="M12 78 L100 12" stroke="#7E5230" strokeWidth="5" strokeLinecap="round" />
    <circle cx="12" cy="78" r="4.5" fill="#7E5230" />
    <circle cx="100" cy="12" r="4.5" fill="#7E5230" />
  </svg>
);

// ---------- building exteriors for the town map ----------
const HomeExt = ({ size }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 124 112">
    <rect x="86" y="16" width="12" height="24" rx="3" fill="#A9745B" />
    <path d="M4 50 L62 10 L120 50 Z" fill="#E76F51" />
    <path d="M16 44 L62 14 L108 44" stroke="#F08A6E" strokeWidth="4" fill="none" strokeLinecap="round" />
    <rect x="16" y="46" width="92" height="62" rx="8" fill="#FFF3DC" />
    <rect x="52" y="70" width="22" height="38" rx="6" fill="#A9745B" />
    <circle cx="69" cy="90" r="2.5" fill="#F2C14E" />
    <rect x="26" y="58" width="18" height="16" rx="4" fill="#9ED5FF" stroke="#8A623F" strokeWidth="3" />
    <rect x="80" y="58" width="18" height="16" rx="4" fill="#9ED5FF" stroke="#8A623F" strokeWidth="3" />
  </svg>
);
const CafeExt = ({ size }) => (
  <svg width={size} height={size * 0.84} viewBox="0 0 124 104">
    <rect x="10" y="34" width="104" height="64" rx="8" fill="#FFE9B8" />
    <rect x="6" y="24" width="112" height="14" rx="7" fill="#F4A261" />
    <circle cx="62" cy="15" r="12" fill="#FFFFFF" stroke="#F4A261" strokeWidth="3" />
    <text x="62" y="20" fontSize="13" textAnchor="middle">☕</text>
    <g>
      <rect x="12" y="40" width="17" height="17" fill="#F2745F" />
      <rect x="29" y="40" width="17" height="17" fill="#FFFFFF" />
      <rect x="46" y="40" width="17" height="17" fill="#F2745F" />
      <rect x="63" y="40" width="17" height="17" fill="#FFFFFF" />
      <rect x="80" y="40" width="17" height="17" fill="#F2745F" />
      <rect x="97" y="40" width="15" height="17" fill="#FFFFFF" />
      <path d="M12 57 h100" stroke="#D98A4B" strokeWidth="3" />
    </g>
    <rect x="16" y="66" width="44" height="28" rx="6" fill="#9ED5FF" stroke="#C9A06A" strokeWidth="3" />
    <rect x="74" y="62" width="22" height="36" rx="6" fill="#C9A06A" />
    <circle cx="91" cy="81" r="2.5" fill="#6E4B2A" />
  </svg>
);
const ShopExt = ({ size }) => (
  <svg width={size} height={size * 0.84} viewBox="0 0 124 104">
    <rect x="10" y="30" width="104" height="68" rx="8" fill="#DCEFFB" />
    <rect x="6" y="18" width="112" height="18" rx="9" fill="#4D96FF" />
    <text x="62" y="31" fontSize="10" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="1.5">MINI MART</text>
    <rect x="14" y="52" width="48" height="8" rx="4" fill="#4D96FF" />
    <rect x="18" y="60" width="40" height="26" rx="5" fill="#9ED5FF" stroke="#7A9CC6" strokeWidth="3" />
    <rect x="24" y="72" width="8" height="10" rx="2" fill="#F2745F" />
    <rect x="36" y="70" width="8" height="12" rx="2" fill="#F9C74F" />
    <rect x="48" y="73" width="6" height="9" rx="2" fill="#52B788" />
    <rect x="72" y="58" width="24" height="40" rx="6" fill="#7A9CC6" />
    <circle cx="90" cy="79" r="2.5" fill="#FFFFFF" />
  </svg>
);
const BakeryExt = ({ size }) => (
  <svg width={size} height={size * 0.84} viewBox="0 0 124 104">
    <rect x="10" y="30" width="104" height="68" rx="8" fill="#FFE0EC" />
    <rect x="42" y="4" width="40" height="24" rx="9" fill="#FFFFFF" stroke="#F15BB5" strokeWidth="3" />
    <text x="62" y="21" fontSize="13" textAnchor="middle">🧁</text>
    <rect x="6" y="38" width="112" height="12" rx="6" fill="#F15BB5" />
    <circle cx="16" cy="50" r="7" fill="#F15BB5" />
    <circle cx="31" cy="50" r="7" fill="#FFFFFF" />
    <circle cx="46" cy="50" r="7" fill="#F15BB5" />
    <circle cx="61" cy="50" r="7" fill="#FFFFFF" />
    <circle cx="76" cy="50" r="7" fill="#F15BB5" />
    <circle cx="91" cy="50" r="7" fill="#FFFFFF" />
    <circle cx="106" cy="50" r="7" fill="#F15BB5" />
    <rect x="18" y="64" width="22" height="18" rx="4" fill="#9ED5FF" stroke="#C98A8A" strokeWidth="3" />
    <rect x="84" y="64" width="22" height="18" rx="4" fill="#9ED5FF" stroke="#C98A8A" strokeWidth="3" />
    <rect x="52" y="64" width="20" height="34" rx="6" fill="#C98A8A" />
    <circle cx="67" cy="82" r="2.5" fill="#FFF" />
  </svg>
);
const SchoolExt = ({ size }) => (
  <svg width={size} height={size * 0.94} viewBox="0 0 130 122">
    <rect x="58" y="6" width="9" height="36" rx="3" fill="#8A5A4A" />
    <path d="M67 8 L88 13 L67 19 Z" fill="#F2745F" />
    <path d="M6 50 L65 20 L124 50 Z" fill="#8A5A4A" />
    <rect x="12" y="46" width="106" height="70" rx="6" fill="#D77A6A" />
    <path d="M12 64 h106 M12 84 h106 M40 46 v70 M90 46 v70" stroke="#C26553" strokeWidth="2.5" opacity=".6" />
    <circle cx="65" cy="38" r="9" fill="#FFF3DC" stroke="#8A5A4A" strokeWidth="3" />
    <path d="M65 38 v-5 M65 38 h4" stroke="#8A5A4A" strokeWidth="2" strokeLinecap="round" />
    <rect x="54" y="80" width="22" height="36" rx="5" fill="#FFF3DC" />
    <rect x="20" y="56" width="16" height="14" rx="3" fill="#9ED5FF" stroke="#FFF3DC" strokeWidth="3" />
    <rect x="94" y="56" width="16" height="14" rx="3" fill="#9ED5FF" stroke="#FFF3DC" strokeWidth="3" />
    <rect x="20" y="90" width="16" height="14" rx="3" fill="#9ED5FF" stroke="#FFF3DC" strokeWidth="3" />
    <rect x="94" y="90" width="16" height="14" rx="3" fill="#9ED5FF" stroke="#FFF3DC" strokeWidth="3" />
  </svg>
);
const CastleExt = ({ size }) => (
  <svg width={size} height={size * 0.88} viewBox="0 0 140 124">
    <rect x="20" y="14" width="6" height="18" fill="#7E8B9E" />
    <path d="M26 14 l15 4 l-15 5 Z" fill="#F15BB5" />
    <rect x="114" y="14" width="6" height="18" fill="#7E8B9E" />
    <path d="M114 14 l-15 4 l15 5 Z" fill="#F15BB5" />
    <g fill="#BFC9D6">
      <rect x="8" y="40" width="6" height="10" /><rect x="20" y="40" width="6" height="10" /><rect x="32" y="40" width="6" height="10" />
      <rect x="102" y="40" width="6" height="10" /><rect x="114" y="40" width="6" height="10" /><rect x="126" y="40" width="6" height="10" />
      <rect x="8" y="48" width="30" height="72" rx="4" />
      <rect x="102" y="48" width="30" height="72" rx="4" />
    </g>
    <g fill="#CBD4E0">
      <rect x="42" y="58" width="8" height="9" /><rect x="56" y="58" width="8" height="9" /><rect x="70" y="58" width="8" height="9" /><rect x="84" y="58" width="8" height="9" />
      <rect x="36" y="65" width="68" height="55" />
    </g>
    <rect x="17" y="62" width="12" height="16" rx="6" fill="#5E7896" />
    <rect x="111" y="62" width="12" height="16" rx="6" fill="#5E7896" />
    <path d="M56 120 v-26 q14 -16 28 0 v26 Z" fill="#8A623F" />
    <circle cx="78" cy="104" r="2.5" fill="#F2C14E" />
  </svg>
);
const EXT = { home: HomeExt, cafe: CafeExt, shop: ShopExt, bakery: BakeryExt, school: SchoolExt, castle: CastleExt };

export { EXT, StairsSVG };
