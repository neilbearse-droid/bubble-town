const WardrobeC = ({ size, open }) => (
  <svg width={size} height={size * 1.2} viewBox="-12 0 184 220">
    <rect x="10" y="14" width="140" height="192" rx="14" fill="#B07D48" />
    <rect x="4" y="6" width="152" height="16" rx="8" fill="#9A6A3F" />
    <rect x="20" y="206" width="16" height="12" rx="4" fill="#8A5E33" />
    <rect x="124" y="206" width="16" height="12" rx="4" fill="#8A5E33" />
    {open ? (
      <g>
        <rect x="18" y="26" width="124" height="172" rx="8" fill="#5C3D24" />
        <path d="M24 50 h112" stroke="#8A5E33" strokeWidth="6" strokeLinecap="round" />
        <path d="M48 52 v8 M54 60 h-12 l-4 22 q10 5 20 0 z" fill="#4D96FF" stroke="#4D96FF" />
        <path d="M98 52 v8 M104 60 h-12 l-4 22 q10 5 20 0 z" fill="#F15BB5" stroke="#F15BB5" />
        <rect x="22" y="148" width="116" height="9" fill="#8A5E33" />
        <rect x="44" y="120" width="28" height="26" rx="5" fill="#F2C14E" />
        <path d="M18 26 L-8 42 L-8 200 L18 196 Z" fill="#C08A52" />
        <path d="M142 26 L168 42 L168 200 L142 196 Z" fill="#C08A52" />
      </g>
    ) : (
      <g>
        <rect x="18" y="26" width="60" height="172" rx="8" fill="#C08A52" />
        <rect x="82" y="26" width="60" height="172" rx="8" fill="#C08A52" />
        <rect x="28" y="38" width="40" height="148" rx="7" fill="none" stroke="#A8743F" strokeWidth="4" />
        <rect x="92" y="38" width="40" height="148" rx="7" fill="none" stroke="#A8743F" strokeWidth="4" />
        <circle cx="72" cy="112" r="4.5" fill="#6E4B2A" />
        <circle cx="88" cy="112" r="4.5" fill="#6E4B2A" />
      </g>
    )}
  </svg>
);
const CabinetC = ({ size, open }) => (
  <svg width={size} height={size * 0.69} viewBox="-12 0 204 140">
    <rect x="0" y="10" width="180" height="17" rx="8.5" fill="#C9A06A" />
    <rect x="8" y="25" width="164" height="105" rx="11" fill="#B07D48" />
    {open ? (
      <g>
        <rect x="16" y="33" width="148" height="89" rx="7" fill="#5C3D24" />
        <rect x="16" y="74" width="148" height="8" fill="#8A5E33" />
        <circle cx="52" cy="62" r="13" fill="#F2745F" />
        <rect x="86" y="48" width="22" height="26" rx="5" fill="#9AD9C2" />
        <circle cx="138" cy="102" r="12" fill="#F9C74F" />
        <path d="M16 33 L-10 46 L-10 124 L16 120 Z" fill="#C08A52" />
        <path d="M164 33 L190 46 L190 124 L164 120 Z" fill="#C08A52" />
      </g>
    ) : (
      <g>
        <rect x="16" y="33" width="72" height="89" rx="8" fill="#C08A52" />
        <rect x="92" y="33" width="72" height="89" rx="8" fill="#C08A52" />
        <rect x="26" y="43" width="52" height="69" rx="6" fill="none" stroke="#A8743F" strokeWidth="4" />
        <rect x="102" y="43" width="52" height="69" rx="6" fill="none" stroke="#A8743F" strokeWidth="4" />
        <circle cx="82" cy="78" r="4.5" fill="#6E4B2A" />
        <circle cx="98" cy="78" r="4.5" fill="#6E4B2A" />
      </g>
    )}
  </svg>
);
const FridgeC = ({ size, open }) => (
  <svg width={size} height={size * 1.38} viewBox="-8 0 152 210">
    <rect x="8" y="6" width="120" height="196" rx="16" fill="#BFE6DC" />
    {open ? (
      <g>
        <rect x="16" y="14" width="104" height="180" rx="10" fill="#EFFFF9" />
        <path d="M20 70 h96 M20 120 h96 M20 162 h96" stroke="#BFE6DC" strokeWidth="6" />
        <circle cx="44" cy="58" r="11" fill="#F2745F" />
        <rect x="66" y="36" width="18" height="28" rx="4" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth="3" />
        <ellipse cx="50" cy="106" rx="14" ry="9" fill="#F9C74F" />
        <circle cx="92" cy="148" r="10" fill="#90BE6D" />
        <path d="M128 6 L150 22 L150 188 L128 202 Z" fill="#A9D8CC" />
      </g>
    ) : (
      <g>
        <path d="M10 70 h116" stroke="#9CCFC2" strokeWidth="5" />
        <rect x="106" y="24" width="9" height="32" rx="4.5" fill="#7FB5A6" />
        <rect x="106" y="86" width="9" height="62" rx="4.5" fill="#7FB5A6" />
        <circle cx="40" cy="44" r="6" fill="#FFFFFF" opacity=".6" />
      </g>
    )}
  </svg>
);
const ChestC = ({ size, open }) => (
  <svg width={size} height={size * 1.06} viewBox="0 -50 170 180">
    {open && <ellipse cx="85" cy="56" rx="58" ry="18" fill="#FFE08A" opacity=".75" />}
    <rect x="10" y="58" width="150" height="58" rx="12" fill="#A9745B" />
    <rect x="40" y="58" width="11" height="58" fill="#7E5238" />
    <rect x="119" y="58" width="11" height="58" fill="#7E5238" />
    <g transform={open ? 'rotate(-46 14 58)' : undefined}>
      <path d="M10 58 Q10 20 85 20 Q160 20 160 58 Z" fill="#BC8156" />
      <path d="M40 58 Q42 30 50 26 M119 58 Q117 30 109 26" stroke="#7E5238" strokeWidth="9" fill="none" />
    </g>
    <rect x="76" y="76" width="18" height="22" rx="6" fill="#F2C14E" />
    <circle cx="85" cy="84" r="4" fill="#A8743F" />
    {open && (
      <g fill="#FFFFFF">
        <path d="M60 30 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3 z" />
        <path d="M112 14 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4 z" />
      </g>
    )}
  </svg>
);
const CONTAINER_DEFS = {
  wardrobe: { C: WardrobeC, s: 150 },
  cabinet: { C: CabinetC, s: 165 },
  fridge: { C: FridgeC, s: 118 },
  chest: { C: ChestC, s: 140 },
};

export { CONTAINER_DEFS };
