import { shade } from '../lib/utils.js';

const Opt = ({ l, children }) => (
  <div className="mt-3">
    <div className="text-xs font-bold mb-1" style={{ color: '#9D95C0' }}>{l}</div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);
const Sw = ({ active, onClick, style }) => (
  <button onClick={onClick} className="w-9 h-9 rounded-full shrink-0"
    style={{ outline: active ? '3px solid #4D96FF' : '2px solid rgba(0,0,0,.1)', outlineOffset: 2, ...style }} />
);

// ---------- illustrated character system (chibi, big-eyed, layered hair) ----------
const HAIR_BACK = {
  swoop: () => null,
  spiky: () => null,
  puffs: (hc, hcD) => (
    <g fill={hcD}>
      <circle cx="32" cy="30" r="22" />
      <circle cx="128" cy="30" r="22" />
    </g>
  ),
  bob: (hc, hcD) => (
    <path d="M31 55 Q31 10 80 10 Q129 10 129 55 L129 90 Q129 102 116 102 L44 102 Q31 102 31 90 Z" fill={hcD} />
  ),
  long: (hc, hcD) => (
    <path d="M30 58 Q30 8 80 8 Q130 8 130 58 L133 118 Q121 134 108 121 L106 95 Q80 85 54 95 L52 121 Q39 134 27 118 Z" fill={hcD} />
  ),
  ponytail: (hc, hcD) => (
    <g>
      <path d="M118 24 Q152 32 144 80 Q139 98 126 93 Q138 64 110 42 Z" fill={hcD} />
      <ellipse cx="117" cy="32" rx="7" ry="10" fill="#F2C14E" />
    </g>
  ),
  buns: (hc, hcD) => (
    <g>
      <circle cx="31" cy="18" r="16" fill={hcD} />
      <circle cx="129" cy="18" r="16" fill={hcD} />
      <circle cx="31" cy="18" r="7" fill="none" stroke={shade(hcD, 18)} strokeWidth="3" />
      <circle cx="129" cy="18" r="7" fill="none" stroke={shade(hcD, 18)} strokeWidth="3" />
    </g>
  ),
};

const HAIR_FRONT = {
  swoop: (hc, hcL) => (
    <g>
      <path d="M33 54 Q34 12 80 12 Q126 12 127 54 Q121 32 98 31 Q106 45 84 39 Q57 31 51 49 Q44 33 33 54 Z" fill={hc} />
      <path d="M50 27 Q70 16 96 21" stroke={hcL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  bob: (hc, hcL) => (
    <g>
      <path d="M33 56 Q33 14 80 14 Q127 14 127 56 Q116 38 97 40 Q80 45 63 40 Q44 38 33 56 Z" fill={hc} />
      <path d="M48 28 Q70 17 100 24" stroke={hcL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  long: (hc, hcL) => (
    <g>
      <path d="M33 56 Q34 12 80 12 Q126 12 127 56 Q121 28 88 26 L85 41 Q80 45 75 41 L72 26 Q39 28 33 56 Z" fill={hc} />
      <path d="M46 32 Q56 20 70 18" stroke={hcL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  ponytail: (hc, hcL) => (
    <g>
      <path d="M33 52 Q34 11 80 11 Q126 11 127 52 Q113 29 80 29 Q47 29 33 52 Z" fill={hc} />
      <path d="M50 25 Q72 14 102 22" stroke={hcL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  buns: (hc, hcL) => (
    <g>
      <path d="M33 52 Q34 11 80 11 Q126 11 127 52 Q113 29 80 29 Q47 29 33 52 Z" fill={hc} />
      <path d="M52 24 Q76 14 104 22" stroke={hcL} strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
  ),
  puffs: (hc, hcL) => (
    <g>
      <circle cx="54" cy="26" r="19" fill={hc} />
      <circle cx="80" cy="19" r="21" fill={hc} />
      <circle cx="106" cy="26" r="19" fill={hc} />
      <circle cx="38" cy="42" r="14" fill={hc} />
      <circle cx="122" cy="42" r="14" fill={hc} />
      <circle cx="70" cy="16" r="4" fill={hcL} opacity=".7" />
      <circle cx="96" cy="20" r="4" fill={hcL} opacity=".7" />
    </g>
  ),
  spiky: (hc, hcL) => (
    <g>
      <path d="M33 52 L41 20 L53 38 L63 12 L75 34 L82 8 L90 34 L101 12 L111 38 L121 20 L127 52 Q80 27 33 52 Z" fill={hc} />
      <path d="M58 28 L66 18" stroke={hcL} strokeWidth="4" strokeLinecap="round" />
    </g>
  ),
};

function CharSVG({ c, size = 120, style, pose, mouth, mood }) {
  const sk = c.skin, skD = shade(c.skin, -16);
  const hc = c.hairColor, hcD = shade(c.hairColor, -16), hcL = shade(c.hairColor, 24);
  const brow = shade(c.hairColor, -34);
  const top = c.top, topD = shade(c.top, -16);
  const bot = c.bottom;
  const eye = c.eyes || '#5B3A2E';
  const o = c.outfit || 'tee';
  const acc = c.acc || 'none';
  const longSleeve = o === 'hoodie' || o === 'bomber';
  const OL = '#241B3C', sw = 3;
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 160 224" style={style}>
      {HAIR_BACK[c.hair] ? HAIR_BACK[c.hair](hc, hcD) : null}
      {/* legs */}
      {o === 'dress' ? (
        <g fill={sk} stroke={OL} strokeWidth={sw}>
          <rect x="61" y="156" width="15" height="40" rx="7.5" />
          <rect x="84" y="156" width="15" height="40" rx="7.5" />
        </g>
      ) : (
        <g fill={bot} stroke={OL} strokeWidth={sw}>
          <rect x="60" y="150" width="17" height="46" rx="8.5" />
          <rect x="83" y="150" width="17" height="46" rx="8.5" />
        </g>
      )}
      {/* chunky sneakers */}
      <g stroke={OL} strokeWidth={sw}>
        <rect x="49" y="189" width="34" height="21" rx="10" fill="#FFFFFF" />
        <rect x="77" y="189" width="34" height="21" rx="10" fill="#FFFFFF" />
      </g>
      <g>
        <rect x="52" y="203" width="29" height="6" rx="3" fill="#2FE6F6" />
        <rect x="79" y="203" width="29" height="6" rx="3" fill="#2FE6F6" />
        <circle cx="57" cy="196" r="2.6" fill="#A24BFF" />
        <circle cx="101" cy="196" r="2.6" fill="#A24BFF" />
      </g>
      {/* arms */}
      <g>
        <rect x="33" y="108" width="18" height={longSleeve ? 38 : 24} rx="9" fill={top} stroke={OL} strokeWidth={sw} />
        {!longSleeve && <rect x="35" y="126" width="14" height="20" rx="7" fill={sk} stroke={OL} strokeWidth={sw} />}
        <circle cx="42" cy="150" r="8.5" fill={sk} stroke={OL} strokeWidth={sw} />
        {pose === 'wave' ? (
          <g>
            <rect x="110" y="70" width="17" height="46" rx="8.5" fill={top} stroke={OL} strokeWidth={sw} transform="rotate(40 118 112)" />
            {!longSleeve && <rect x="112" y="72" width="13" height="22" rx="6.5" fill={sk} stroke={OL} strokeWidth={sw} transform="rotate(40 118 112)" />}
            <circle cx="152" cy="86" r="9" fill={sk} stroke={OL} strokeWidth={sw} />
          </g>
        ) : (
          <g>
            <rect x="109" y="108" width="18" height={longSleeve ? 38 : 24} rx="9" fill={top} stroke={OL} strokeWidth={sw} />
            {!longSleeve && <rect x="111" y="126" width="14" height="20" rx="7" fill={sk} stroke={OL} strokeWidth={sw} />}
            <circle cx="118" cy="150" r="8.5" fill={sk} stroke={OL} strokeWidth={sw} />
          </g>
        )}
      </g>
      {/* neck */}
      <rect x="72" y="94" width="16" height="16" rx="7" fill={sk} stroke={OL} strokeWidth={sw} />
      {/* torso by outfit */}
      {o === 'dress' ? (
        <g stroke={OL} strokeWidth={sw} strokeLinejoin="round">
          <rect x="48" y="104" width="64" height="38" rx="17" fill={top} />
          <path d="M50 134 L38 188 Q80 202 122 188 L110 134 Z" fill={top} />
          <path d="M40 185 Q80 199 120 185" stroke={bot} strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>
      ) : (
        <rect x="47" y="104" width="66" height="54" rx="20" fill={top} stroke={OL} strokeWidth={sw} />
      )}
      {o === 'tee' && <path d="M80 116 l4.2 9 9.8 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 9.8 -1 z" fill="#2FE6F6" opacity=".92" />}
      {o === 'hoodie' && (
        <g>
          <path d="M48 104 Q80 130 112 104 Q105 124 80 126 Q55 124 48 104 Z" fill={topD} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
          <rect x="61" y="132" width="38" height="19" rx="9" fill={topD} stroke={OL} strokeWidth="2.4" />
          <path d="M74 112 L72 128 M86 112 L88 128" stroke="#ECE7FA" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {o === 'overalls' && (
        <g stroke={OL} strokeWidth="2.4">
          <rect x="57" y="100" width="10" height="18" rx="4" fill={bot} />
          <rect x="93" y="100" width="10" height="18" rx="4" fill={bot} />
          <rect x="57" y="112" width="46" height="46" rx="10" fill={bot} />
          <circle cx="63" cy="116" r="3.5" fill="#2FE6F6" stroke="none" />
          <circle cx="97" cy="116" r="3.5" fill="#2FE6F6" stroke="none" />
          <rect x="70" y="128" width="20" height="15" rx="5" fill={shade(bot, 14)} />
        </g>
      )}
      {o === 'bomber' && (
        <g>
          <rect x="58" y="106" width="44" height="50" rx="14" fill="#E7E3F4" stroke={OL} strokeWidth="2.4" />
          <path d="M47 116 Q47 104 60 104 L80 104 L74 156 L54 156 Q47 156 47 146 Z" fill={top} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M113 116 Q113 104 100 104 L80 104 L86 156 L106 156 Q113 156 113 146 Z" fill={top} stroke={OL} strokeWidth={sw} strokeLinejoin="round" />
          <path d="M51 120 L70 110 L66 150 L53 150 Z" fill="#9CE8F0" opacity=".35" />
          <path d="M96 112 L109 122 L106 150 L92 150 Z" fill="#FF9DD0" opacity=".3" />
          <path d="M70 104 L80 117 L90 104 Z" fill={shade(top, -16)} stroke={OL} strokeWidth="2.4" strokeLinejoin="round" />
          <line x1="80" y1="117" x2="80" y2="152" stroke="#2FE6F6" strokeWidth="2.5" />
          <rect x="52" y="149" width="56" height="9" rx="4.5" fill={shade(top, -18)} stroke={OL} strokeWidth="2.2" />
        </g>
      )}
      {/* head + ears */}
      <ellipse cx="80" cy="60" rx="47" ry="45" fill={sk} stroke={OL} strokeWidth={sw} />
      <circle cx="33" cy="64" r="9" fill={sk} stroke={OL} strokeWidth={sw} />
      <circle cx="127" cy="64" r="9" fill={sk} stroke={OL} strokeWidth={sw} />
      {/* eyes — relaxed shows soft closed happy arcs */}
      {mood === 'relaxed' ? (
        <g fill="none" stroke={OL} strokeWidth="4" strokeLinecap="round">
          <path d="M49 65 Q60 74 71 65" />
          <path d="M89 65 Q100 74 111 65" />
        </g>
      ) : (
        <g>
          <ellipse cx="60" cy="63" rx="14.5" ry="17" fill="#FFFFFF" stroke={OL} strokeWidth="2.2" />
          <ellipse cx="100" cy="63" rx="14.5" ry="17" fill="#FFFFFF" stroke={OL} strokeWidth="2.2" />
          <circle cx="61" cy="66" r="9" fill={eye} />
          <circle cx="99" cy="66" r="9" fill={eye} />
          <circle cx="61" cy="67" r="4.6" fill="#160F2A" />
          <circle cx="99" cy="67" r="4.6" fill="#160F2A" />
          <circle cx="57.4" cy="61" r="3.4" fill="#FFFFFF" />
          <circle cx="95.4" cy="61" r="3.4" fill="#FFFFFF" />
          <circle cx="64" cy="69.5" r="1.7" fill="#FFFFFF" opacity=".9" />
          <circle cx="102" cy="69.5" r="1.7" fill="#FFFFFF" opacity=".9" />
        </g>
      )}
      {/* brows */}
      <path d="M47 42 q12 -7 24 -3" stroke={brow} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M89 39 q12 -4 24 3" stroke={brow} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      {/* nose */}
      <path d="M77 73 q3 5 7 1" stroke={skD} strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* mouth */}
      {mouth === 'open' ? (
        <g>
          <ellipse cx="80" cy="88" rx="10" ry="12" fill="#9E4B43" stroke={OL} strokeWidth="2" />
          <ellipse cx="80" cy="94" rx="6" ry="5" fill="#FF8FAB" />
        </g>
      ) : (
        <path d="M62 85 Q80 99 98 85" stroke={OL} strokeWidth="4.5" strokeLinecap="round" fill="none" />
      )}
      {/* blush */}
      <ellipse cx="46" cy="80" rx="8" ry="5" fill="#FF6FB5" opacity=".4" />
      <ellipse cx="114" cy="80" rx="8" ry="5" fill="#FF6FB5" opacity=".4" />
      {HAIR_FRONT[c.hair] ? HAIR_FRONT[c.hair](hc, hcL) : null}
      {/* accessory */}
      {acc === 'headphones' && (
        <g>
          <path d="M30 58 Q80 4 130 58" stroke="#2E2059" strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M30 58 Q80 4 130 58" stroke="#A24BFF" strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="19" y="52" width="21" height="32" rx="9" fill="#A24BFF" stroke={OL} strokeWidth={sw} />
          <rect x="120" y="52" width="21" height="32" rx="9" fill="#A24BFF" stroke={OL} strokeWidth={sw} />
          <rect x="24" y="59" width="12" height="18" rx="6" fill="#FF6FB5" />
          <rect x="124" y="59" width="12" height="18" rx="6" fill="#FF6FB5" />
        </g>
      )}
      {acc === 'cap' && (
        <g stroke={OL} strokeWidth={sw} strokeLinejoin="round">
          <path d="M36 40 Q80 2 124 40 Q124 46 80 46 Q36 46 36 40 Z" fill="#A24BFF" />
          <path d="M30 44 Q20 56 48 54 L80 48 Q56 42 30 44 Z" fill="#7E5BD6" />
          <circle cx="80" cy="16" r="4" fill="#2FE6F6" stroke="none" />
        </g>
      )}
      {acc === 'beanie' && (
        <g stroke={OL} strokeWidth={sw} strokeLinejoin="round">
          <path d="M33 52 Q33 6 80 6 Q127 6 127 52 Q80 40 33 52 Z" fill="#6FE7B7" />
          <rect x="32" y="46" width="96" height="13" rx="6.5" fill="#56C9A0" />
          <circle cx="80" cy="7" r="6" fill="#FFFFFF" stroke="none" />
        </g>
      )}
    </svg>
  );
}

export { Opt, Sw, CharSVG, HAIR_BACK, HAIR_FRONT };
