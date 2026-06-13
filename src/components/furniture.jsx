
const SofaSVG = ({ size, v = 0 }) => {
  const P = [{ b: '#7E6CE0', c: '#9A8AF0', a: '#6A58C8', t: '#2FE6F6' }, { b: '#5B8DEF', c: '#7FA9F2', a: '#4D78D6', t: '#F9C74F' }, { b: '#7BC49A', c: '#9FD7B8', a: '#5BAE82', t: '#FF8FAB' }][v] || { b: '#F2745F', c: '#F88F77', a: '#E8654F', t: '#9AD9C2' };
  return (
    <svg width={size} height={size * 0.59} viewBox="0 0 220 130">
      <rect x="8" y="30" width="204" height="68" rx="20" fill={P.b} />
      <rect x="24" y="50" width="84" height="44" rx="14" fill={P.c} />
      <rect x="112" y="50" width="84" height="44" rx="14" fill={P.c} />
      <rect x="0" y="56" width="34" height="58" rx="15" fill={P.a} />
      <rect x="186" y="56" width="34" height="58" rx="15" fill={P.a} />
      <rect x="8" y="96" width="204" height="22" rx="11" fill={P.a} />
      <rect x="34" y="54" width="30" height="30" rx="10" fill={P.t} transform="rotate(-8 49 69)" />
      <rect x="26" y="116" width="12" height="12" rx="4" fill="#9A6A3F" />
      <rect x="182" y="116" width="12" height="12" rx="4" fill="#9A6A3F" />
    </svg>
  );
};
const ArmchairSVG = ({ size }) => (
  <svg width={size} height={size * 0.93} viewBox="0 0 140 130">
    <rect x="22" y="14" width="96" height="72" rx="22" fill="#4FA3A5" />
    <rect x="32" y="50" width="76" height="40" rx="13" fill="#67B7B9" />
    <rect x="8" y="54" width="28" height="56" rx="13" fill="#418C8E" />
    <rect x="104" y="54" width="28" height="56" rx="13" fill="#418C8E" />
    <rect x="18" y="92" width="104" height="20" rx="10" fill="#418C8E" />
    <rect x="30" y="110" width="11" height="12" rx="4" fill="#9A6A3F" />
    <rect x="99" y="110" width="11" height="12" rx="4" fill="#9A6A3F" />
  </svg>
);
const BedSVG = ({ size, v = 0 }) => {
  const P = [{ bl: '#7FA9E6', st: '#9DBFF0', pl: '#FFF6E6', fr: '#B07D48', ft: '#8A5E33' }, { bl: '#F7A8C4', st: '#FCC4D8', pl: '#FFFFFF', fr: '#E2A6BC', ft: '#C98AA6' }, { bl: '#86C9A2', st: '#A9DCC0', pl: '#FFF1C7', fr: '#9A6A3F', ft: '#7E5230' }][v] || { bl: '#7FA9E6', st: '#9DBFF0', pl: '#FFF6E6', fr: '#B07D48', ft: '#8A5E33' };
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 240 150">
      <rect x="6" y="14" width="30" height="112" rx="11" fill={P.fr} />
      <rect x="6" y="102" width="228" height="28" rx="11" fill={P.fr} />
      <rect x="30" y="76" width="204" height="34" rx="13" fill="#FFFFFF" />
      <rect x="86" y="66" width="148" height="48" rx="14" fill={P.bl} />
      <path d="M92 80 h134" stroke={P.st} strokeWidth="7" strokeLinecap="round" />
      <rect x="36" y="60" width="52" height="28" rx="13" fill={P.pl} />
      {v === 1 && <path d="M62 70 q-6 -8 -12 0 q6 8 12 13 q6 -5 12 -13 q-6 -8 -12 0 z" fill="#F2748F" />}
      {v === 2 && <path d="M150 82 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 z" fill="#F9C74F" />}
      <rect x="12" y="128" width="14" height="16" rx="5" fill={P.ft} />
      <rect x="214" y="128" width="14" height="16" rx="5" fill={P.ft} />
    </svg>
  );
};
const TableSVG = ({ size }) => (
  <svg width={size} height={size * 0.7} viewBox="0 0 170 120">
    <rect x="5" y="32" width="160" height="17" rx="8.5" fill="#C58B5A" />
    <rect x="14" y="47" width="142" height="9" rx="4.5" fill="#A86F47" />
    <rect x="20" y="52" width="13" height="60" rx="5" fill="#B07D48" />
    <rect x="137" y="52" width="13" height="60" rx="5" fill="#B07D48" />
  </svg>
);
const ChairSVG = ({ size, v = 0 }) => {
  const P = [{ a: '#C58B5A', b: '#D9A86C', c: '#B07D48', d: '#A86F47' }, { a: '#6FB7B9', b: '#8FCED0', c: '#4FA3A5', d: '#418C8E' }, { a: '#F2945F', b: '#F9B68C', c: '#E07A45', d: '#C76838' }][v] || { a: '#C58B5A', b: '#D9A86C', c: '#B07D48', d: '#A86F47' };
  return (
    <svg width={size} height={size * 1.44} viewBox="0 0 90 130">
      <rect x="20" y="4" width="50" height="54" rx="11" fill={P.a} />
      <rect x="30" y="14" width="30" height="34" rx="8" fill={P.b} />
      <rect x="12" y="56" width="66" height="15" rx="7.5" fill={P.c} />
      <rect x="17" y="69" width="11" height="56" rx="4.5" fill={P.d} />
      <rect x="62" y="69" width="11" height="56" rx="4.5" fill={P.d} />
    </svg>
  );
};
const LampSVG = ({ size, v = 0 }) => {
  const sh = [{ c: '#F9C74F', e: '#E0A93C' }, { c: '#F7A8C4', e: '#E283A6' }, { c: '#8FC7E8', e: '#5FA3CF' }][v] || { c: '#F9C74F', e: '#E0A93C' };
  return (
    <svg width={size} height={size * 1.89} viewBox="0 0 90 170">
      <ellipse cx="45" cy="70" rx="42" ry="20" fill="#FFE08A" opacity=".32" />
      {v === 1
        ? <path d="M14 50 Q45 4 76 50 Z" fill={sh.c} />
        : <path d="M22 8 L68 8 L80 52 L10 52 Z" fill={sh.c} />}
      <path d="M10 52 L80 52" stroke={sh.e} strokeWidth="5" strokeLinecap="round" />
      <rect x="42" y="52" width="6" height="88" fill="#6B6B6B" />
      <ellipse cx="45" cy="148" rx="27" ry="10" fill="#5A5A5A" />
    </svg>
  );
};
const PlantSVG = ({ size }) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 120 150">
    <ellipse cx="60" cy="48" rx="12" ry="36" fill="#3E8E5A" />
    <ellipse cx="60" cy="54" rx="11" ry="32" fill="#57A86B" transform="rotate(30 60 76)" />
    <ellipse cx="60" cy="54" rx="11" ry="32" fill="#57A86B" transform="rotate(-30 60 76)" />
    <ellipse cx="60" cy="62" rx="10" ry="26" fill="#2F7A4D" transform="rotate(55 60 80)" />
    <ellipse cx="60" cy="62" rx="10" ry="26" fill="#2F7A4D" transform="rotate(-55 60 80)" />
    <path d="M34 96 L86 96 L78 144 L42 144 Z" fill="#C96F4A" />
    <rect x="29" y="88" width="62" height="14" rx="7" fill="#B85F3C" />
  </svg>
);
const ShelfSVG = ({ size }) => (
  <svg width={size} height={size * 1.33} viewBox="0 0 150 200">
    <rect x="6" y="6" width="138" height="190" rx="13" fill="#B07D48" />
    <rect x="17" y="17" width="116" height="168" rx="7" fill="#8A5A33" />
    <rect x="17" y="70" width="116" height="9" fill="#B07D48" />
    <rect x="17" y="128" width="116" height="9" fill="#B07D48" />
    <g>
      <rect x="26" y="30" width="13" height="40" rx="3" fill="#F2745F" />
      <rect x="41" y="36" width="13" height="34" rx="3" fill="#4D96FF" />
      <rect x="56" y="30" width="13" height="40" rx="3" fill="#F9C74F" />
      <rect x="80" y="34" width="13" height="36" rx="3" fill="#52B788" />
      <rect x="26" y="92" width="13" height="36" rx="3" fill="#9B5DE5" />
      <rect x="41" y="88" width="13" height="40" rx="3" fill="#F15BB5" />
      <rect x="70" y="92" width="13" height="36" rx="3" fill="#43AA8B" />
      <rect x="30" y="146" width="13" height="39" rx="3" fill="#F8961E" />
      <rect x="45" y="150" width="13" height="35" rx="3" fill="#577590" />
      <circle cx="105" cy="166" r="13" fill="#FFD166" />
    </g>
  </svg>
);
const TVSVG = ({ size }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 180 130">
    <rect x="8" y="8" width="164" height="94" rx="13" fill="#23272F" />
    <rect x="16" y="16" width="148" height="78" rx="8" fill="#39414E" />
    <path d="M30 86 L92 22 L116 22 L46 92 Z" fill="#FFFFFF" opacity=".1" />
    <circle cx="90" cy="55" r="14" fill="#FF8FAB" />
    <path d="M86 48 L98 55 L86 62 Z" fill="#FFFFFF" />
    <rect x="80" y="102" width="20" height="11" fill="#4A4F58" />
    <rect x="52" y="112" width="76" height="11" rx="5.5" fill="#3A3F47" />
  </svg>
);
const RugSVG = ({ size, v = 0 }) => {
  const P = [['#6A5AC0', '#8A7AD8', '#AFA0EC'], ['#8FC7E8', '#B6DCF2', '#DDF0FB'], ['#9ED9B5', '#C0E8CF', '#E0F4E8']][v] || ['#E8A6B8', '#F3C3D0', '#FBDDE6'];
  return (
    <svg width={size} height={size * 0.32} viewBox="0 0 200 64">
      <ellipse cx="100" cy="33" rx="96" ry="27" fill={P[0]} />
      <ellipse cx="100" cy="33" rx="70" ry="19" fill={P[1]} />
      <ellipse cx="100" cy="33" rx="40" ry="11" fill={P[2]} />
    </svg>
  );
};
const TeddySVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="26" cy="24" r="13" fill="#B07D48" /><circle cx="74" cy="24" r="13" fill="#B07D48" />
    <circle cx="26" cy="24" r="6" fill="#C99A66" /><circle cx="74" cy="24" r="6" fill="#C99A66" />
    <circle cx="22" cy="64" r="10" fill="#B07D48" /><circle cx="78" cy="64" r="10" fill="#B07D48" />
    <circle cx="36" cy="92" r="11" fill="#B07D48" /><circle cx="64" cy="92" r="11" fill="#B07D48" />
    <ellipse cx="50" cy="74" rx="28" ry="23" fill="#C98F5A" />
    <ellipse cx="50" cy="78" rx="16" ry="13" fill="#E8C49A" />
    <circle cx="50" cy="42" r="25" fill="#C98F5A" />
    <ellipse cx="50" cy="50" rx="8" ry="6" fill="#E8C49A" />
    <circle cx="40" cy="38" r="4" fill="#3B2A1A" /><circle cx="60" cy="38" r="4" fill="#3B2A1A" />
    <circle cx="50" cy="47" r="3.5" fill="#3B2A1A" />
    <path d="M47 52 q3 3 6 0" stroke="#3B2A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
const GiftSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <rect x="14" y="42" width="72" height="50" rx="7" fill="#F2745F" />
    <rect x="14" y="42" width="72" height="13" rx="6" fill="#E8654F" />
    <rect x="44" y="42" width="12" height="50" fill="#FFD166" />
    <rect x="14" y="47" width="72" height="8" fill="#FFD166" />
    <path d="M50 42 C40 24 16 26 26 38 C33 46 47 42 50 42 Z" fill="#FFD166" />
    <path d="M50 42 C60 24 84 26 74 38 C67 46 53 42 50 42 Z" fill="#FFD166" />
    <circle cx="50" cy="40" r="6" fill="#F9B233" />
  </svg>
);
const BalloonSVG = ({ size }) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 70 105">
    <path d="M35 6 C12 6 8 36 22 54 C28 62 30 64 35 70 C40 64 42 62 48 54 C62 36 58 6 35 6 Z" fill="#F2745F" />
    <ellipse cx="27" cy="26" rx="7" ry="10" fill="#F9A28E" opacity=".7" />
    <path d="M30 70 L40 70 L35 77 Z" fill="#C24A38" />
    <path d="M35 77 q-5 7 0 13 q5 6 0 12" stroke="#9A6A3F" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
const BallSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="#FF6B6B" />
    <path d="M50 6 C30 30 30 70 50 94 C70 70 70 30 50 6 Z" fill="#FFD166" />
    <path d="M6 50 C30 35 70 35 94 50 C70 65 30 65 6 50 Z" fill="#FFFFFF" opacity=".9" />
    <circle cx="50" cy="50" r="44" fill="none" stroke="#E2554F" strokeWidth="3" />
    <ellipse cx="36" cy="33" rx="10" ry="7" fill="#FFFFFF" opacity=".5" />
  </svg>
);
const FrameSVG = ({ size }) => (
  <svg width={size} height={size * 0.86} viewBox="0 0 100 86">
    <rect x="6" y="6" width="88" height="74" rx="7" fill="#B07D48" />
    <rect x="13" y="13" width="74" height="60" rx="3" fill="#EAF6FF" />
    <circle cx="68" cy="30" r="8" fill="#FFD166" />
    <path d="M13 73 L40 44 L56 60 L70 50 L87 68 L87 73 Z" fill="#8FC7A0" />
    <path d="M13 73 L33 53 L49 68 Z" fill="#6FB08A" />
  </svg>
);
const ClockSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="44" fill="#C98F5A" />
    <circle cx="50" cy="50" r="36" fill="#FFF6E6" stroke="#B07D48" strokeWidth="3" />
    <circle cx="50" cy="16" r="2.5" fill="#B07D48" /><circle cx="84" cy="50" r="2.5" fill="#B07D48" />
    <circle cx="50" cy="84" r="2.5" fill="#B07D48" /><circle cx="16" cy="50" r="2.5" fill="#B07D48" />
    <line x1="50" y1="50" x2="50" y2="28" stroke="#3B2A1A" strokeWidth="4" strokeLinecap="round" />
    <line x1="50" y1="50" x2="67" y2="58" stroke="#3B2A1A" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="50" r="4" fill="#F2745F" />
  </svg>
);
const CatSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M78 80 q16 -2 13 -17" stroke="#9AA0A6" strokeWidth="9" fill="none" strokeLinecap="round" />
    <path d="M50 94 C30 94 22 74 24 56 C26 40 37 30 50 30 C63 30 74 40 76 56 C78 74 70 94 50 94 Z" fill="#9AA0A6" />
    <path d="M30 40 L24 18 L43 31 Z" fill="#9AA0A6" /><path d="M70 40 L76 18 L57 31 Z" fill="#9AA0A6" />
    <path d="M32 37 L29 25 L39 32 Z" fill="#F7B7C8" /><path d="M68 37 L71 25 L61 32 Z" fill="#F7B7C8" />
    <ellipse cx="50" cy="58" rx="22" ry="20" fill="#B4B9BE" />
    <ellipse cx="40" cy="54" rx="4.5" ry="6" fill="#3B2A1A" /><ellipse cx="60" cy="54" rx="4.5" ry="6" fill="#3B2A1A" />
    <path d="M50 60 l-3 4 6 0 z" fill="#F2748F" />
    <path d="M47 66 q3 3 6 0" stroke="#3B2A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M30 60 h-12 M30 65 h-11 M70 60 h12 M70 65 h11" stroke="#7E848A" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const DogSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M50 94 C31 94 23 76 25 58 C27 42 38 32 50 32 C62 32 73 42 75 58 C77 76 69 94 50 94 Z" fill="#D8A05A" />
    <ellipse cx="26" cy="46" rx="9" ry="18" fill="#A8743F" transform="rotate(20 26 46)" />
    <ellipse cx="74" cy="46" rx="9" ry="18" fill="#A8743F" transform="rotate(-20 74 46)" />
    <ellipse cx="50" cy="60" rx="22" ry="20" fill="#E8C49A" />
    <ellipse cx="50" cy="71" rx="12" ry="10" fill="#F3DCBE" />
    <circle cx="41" cy="56" r="4" fill="#3B2A1A" /><circle cx="59" cy="56" r="4" fill="#3B2A1A" />
    <ellipse cx="50" cy="67" rx="6" ry="4.5" fill="#3B2A1A" />
    <path d="M50 71 v5" stroke="#3B2A1A" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const RobotSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <line x1="50" y1="20" x2="50" y2="9" stroke="#7E5BD6" strokeWidth="3" strokeLinecap="round" /><circle cx="50" cy="7" r="4" fill="#2FE6F6" />
    <rect x="22" y="18" width="56" height="46" rx="16" fill="#8A7AE0" stroke="#241B3C" strokeWidth="3" />
    <rect x="29" y="26" width="42" height="30" rx="11" fill="#161240" stroke="#241B3C" strokeWidth="2" />
    <circle cx="42" cy="40" r="4.5" fill="#2FE6F6" /><circle cx="58" cy="40" r="4.5" fill="#2FE6F6" />
    <path d="M44 48 q6 5 12 0" stroke="#2FE6F6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <rect x="30" y="66" width="40" height="26" rx="12" fill="#B6A9F0" stroke="#241B3C" strokeWidth="3" />
    <circle cx="50" cy="79" r="6" fill="#FF6FB5" stroke="#241B3C" strokeWidth="2" />
    <rect x="15" y="70" width="10" height="18" rx="5" fill="#8A7AE0" stroke="#241B3C" strokeWidth="2.4" /><rect x="75" y="70" width="10" height="18" rx="5" fill="#8A7AE0" stroke="#241B3C" strokeWidth="2.4" />
  </svg>
);
const AlienSVG = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path d="M31 16 q-6 -10 1 -13" stroke="#5BC99A" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="31" cy="3" r="3.5" fill="#6FE7B7" />
    <path d="M69 16 q6 -10 -1 -13" stroke="#5BC99A" strokeWidth="3" fill="none" strokeLinecap="round" /><circle cx="69" cy="3" r="3.5" fill="#6FE7B7" />
    <ellipse cx="50" cy="78" rx="26" ry="20" fill="#7FE3B0" stroke="#241B3C" strokeWidth="3" />
    <ellipse cx="50" cy="44" rx="30" ry="28" fill="#86E8B6" stroke="#241B3C" strokeWidth="3" />
    <ellipse cx="38" cy="45" rx="7" ry="9" fill="#161240" /><ellipse cx="62" cy="45" rx="7" ry="9" fill="#161240" />
    <circle cx="40" cy="42" r="2.4" fill="#FFFFFF" /><circle cx="64" cy="42" r="2.4" fill="#FFFFFF" />
    <path d="M44 57 q6 4 12 0" stroke="#3E8E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <ellipse cx="31" cy="86" rx="8" ry="6" fill="#7FE3B0" stroke="#241B3C" strokeWidth="2.4" /><ellipse cx="69" cy="86" rx="8" ry="6" fill="#7FE3B0" stroke="#241B3C" strokeWidth="2.4" />
  </svg>
);
const OrbSVG = ({ size }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 90 108">
    <ellipse cx="45" cy="48" rx="38" ry="38" fill="#A24BFF" opacity=".16" />
    <circle cx="45" cy="46" r="30" fill="#9B6FE8" stroke="#241B3C" strokeWidth="3" />
    <path d="M16 47 a29 29 0 0 1 58 -1 z" fill="#7FB8F0" opacity=".45" />
    <ellipse cx="36" cy="36" rx="9" ry="6" fill="#FFFFFF" opacity=".6" />
    <circle cx="53" cy="52" r="4" fill="#FF9DD0" opacity=".85" /><circle cx="37" cy="56" r="3" fill="#2FE6F6" opacity=".85" />
    <path d="M30 74 L60 74 L66 96 L24 96 Z" fill="#2E2059" stroke="#241B3C" strokeWidth="3" strokeLinejoin="round" />
    <ellipse cx="45" cy="75" rx="17" ry="5" fill="#3A2D66" />
  </svg>
);
const ConsoleSVG = ({ size }) => (
  <svg width={size} height={size * 0.66} viewBox="0 0 110 72">
    <path d="M20 16 Q55 6 90 16 Q104 40 96 60 Q86 70 74 58 Q55 50 36 58 Q24 70 14 60 Q6 40 20 16 Z" fill="#7E5BD6" stroke="#241B3C" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="34" cy="34" r="9" fill="#2E2059" /><path d="M34 29 v10 M29 34 h10" stroke="#2FE6F6" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="72" cy="30" r="3.8" fill="#FF6FB5" /><circle cx="83" cy="38" r="3.8" fill="#6FE7B7" /><circle cx="61" cy="38" r="3.8" fill="#2FE6F6" /><circle cx="72" cy="46" r="3.8" fill="#FFD166" />
  </svg>
);
const PodChairSVG = ({ size }) => (
  <svg width={size} height={size * 1.08} viewBox="0 0 120 130">
    <path d="M22 36 L40 16 L48 38 Z" fill="#8A7AE0" stroke="#241B3C" strokeWidth="3" strokeLinejoin="round" />
    <path d="M98 36 L80 16 L72 38 Z" fill="#8A7AE0" stroke="#241B3C" strokeWidth="3" strokeLinejoin="round" />
    <path d="M60 16 C26 16 14 56 18 86 C20 104 100 104 102 86 C106 56 94 16 60 16 Z" fill="#9B6FE8" stroke="#241B3C" strokeWidth="3" strokeLinejoin="round" />
    <path d="M58 30 C36 30 26 58 30 82 C70 92 90 82 88 70 C84 44 82 30 58 30 Z" fill="#6E4FB0" opacity=".5" />
    <ellipse cx="60" cy="92" rx="38" ry="16" fill="#B6A9F0" stroke="#241B3C" strokeWidth="3" />
    <rect x="40" y="96" width="14" height="22" rx="6" fill="#2E2059" stroke="#241B3C" strokeWidth="2.4" /><rect x="66" y="96" width="14" height="22" rx="6" fill="#2E2059" stroke="#241B3C" strokeWidth="2.4" />
  </svg>
);
const ArcadeSVG = ({ size }) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 90 135">
    <rect x="14" y="10" width="62" height="118" rx="12" fill="#5B3FA6" stroke="#241B3C" strokeWidth="3" />
    <rect x="20" y="16" width="50" height="14" rx="6" fill="#A24BFF" /><rect x="24" y="19" width="42" height="8" rx="4" fill="#2FE6F6" opacity=".8" />
    <rect x="20" y="36" width="50" height="40" rx="7" fill="#0F0E2C" stroke="#241B3C" strokeWidth="2" />
    <rect x="25" y="41" width="40" height="30" rx="4" fill="#2FE6F6" opacity=".22" />
    <circle cx="34" cy="50" r="3" fill="#FF6FB5" /><circle cx="46" cy="56" r="3" fill="#6FE7B7" /><circle cx="56" cy="48" r="3" fill="#FFD166" />
    <rect x="20" y="82" width="50" height="20" rx="6" fill="#3A2D66" />
    <circle cx="32" cy="92" r="5" fill="#FF6FB5" stroke="#241B3C" strokeWidth="2" /><circle cx="48" cy="92" r="5" fill="#2FE6F6" stroke="#241B3C" strokeWidth="2" /><circle cx="60" cy="90" r="3.4" fill="#FFD166" />
    <rect x="18" y="104" width="54" height="22" rx="7" fill="#4A3490" stroke="#241B3C" strokeWidth="2" />
  </svg>
);
const HoloSVG = ({ size }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 100 90">
    <polygon points="30,8 48,18 48,40 30,50 12,40 12,18" fill="#7FD8F0" opacity=".5" stroke="#2FE6F6" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="66,20 82,29 82,49 66,58 50,49 50,29" fill="#C9A7FF" opacity=".5" stroke="#A24BFF" strokeWidth="2.5" strokeLinejoin="round" />
    <polygon points="44,48 60,57 60,77 44,86 28,77 28,57" fill="#FFB6E0" opacity=".5" stroke="#FF6FB5" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const RingRugSVG = ({ size }) => (
  <svg width={size} height={size * 0.34} viewBox="0 0 200 68">
    <ellipse cx="100" cy="40" rx="94" ry="26" fill="#2A2150" />
    <ellipse cx="100" cy="40" rx="92" ry="25" fill="none" stroke="#A24BFF" strokeWidth="4" opacity=".9" />
    <ellipse cx="100" cy="40" rx="66" ry="18" fill="none" stroke="#2FE6F6" strokeWidth="3.5" opacity=".9" />
    <ellipse cx="100" cy="40" rx="40" ry="11" fill="none" stroke="#FF6FB5" strokeWidth="3" opacity=".85" />
  </svg>
);
const FURN = { Sofa: SofaSVG, Armchair: ArmchairSVG, Bed: BedSVG, Table: TableSVG, Chair: ChairSVG, Lamp: LampSVG, Plant: PlantSVG, Shelf: ShelfSVG, TV: TVSVG, Rug: RugSVG, Teddy: TeddySVG, Gift: GiftSVG, Balloon: BalloonSVG, Ball: BallSVG, Frame: FrameSVG, Clock: ClockSVG, Cat: CatSVG, Dog: DogSVG, Robot: RobotSVG, Alien: AlienSVG, Orb: OrbSVG, Console: ConsoleSVG, PodChair: PodChairSVG, Arcade: ArcadeSVG, Holo: HoloSVG, RingRug: RingRugSVG };
const VARIANTS = {};

export { FURN, VARIANTS };
