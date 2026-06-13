const mkIcon = (g, m=1) => ({ size=18, color }) => (
  <span style={{ fontSize: Math.round(size*m), lineHeight: 1, color, fontWeight: 700, display: 'inline-block' }}>{g}</span>
);
const Sofa = mkIcon('🛋️');
const Users = mkIcon('😊');
const Paintbrush = mkIcon('🖌️');
const MapIcon = mkIcon('🗺️');
const Settings = mkIcon('⚙️');
const X = mkIcon('✕', 1.1);
const Plus = mkIcon('＋', 1.25);
const Shuffle = mkIcon('🎲');
const FlipHorizontal2 = mkIcon('⇄', 1.25);
const Pencil = mkIcon('✏️');
const Trash2 = mkIcon('🗑️');
const ChevronLeft = mkIcon('‹', 1.4);
const Sparkles = mkIcon('✨');
const Backpack = mkIcon('🎒');

export { mkIcon, Sofa, Users, Paintbrush, MapIcon, Settings, X, Plus, Shuffle, FlipHorizontal2, Pencil, Trash2, ChevronLeft, Sparkles, Backpack };
