// Fixed, kid-safe preset notes + stickers. A note stores only the PRESET INDEX
// and an optional sticker — never free text — so there's nothing to moderate.
// (Append only; never reorder, or existing messages would change meaning.)
export const NOTE_PRESETS = [
  'Love your room! 💕',
  'So cozy in here! 🏡',
  'Coolest sofa ever!',
  'Your town is amazing!',
  'Your friends are so cute!',
  'Best room I have seen! ⭐',
  'Can I move in? 😄',
  'Hi friend! 👋',
  'This is so pretty! 🌸',
  'Total goals! 🔥',
];

export const NOTE_STICKERS = ['❤️', '⭐', '🎉', '😄', '🌈', '🔥', '👍', '🌸', '🦄', '🍩'];

export const presetText = (i) => NOTE_PRESETS[i] || '💬';
