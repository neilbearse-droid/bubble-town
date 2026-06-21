// Optional image backdrops per building. When present they replace the built-in
// CSS scene (the CSS scenes stay as the default/fallback everywhere else).
//   rooms: keyed "<floorIndex>-<roomIndex>"
//   yard / balcony: the exterior of the ground / upper floors
// Each entry is { day, night? } — the night image is used when night mode is on
// (and is a complete night scene, so the moon/stars overlay is suppressed for it).
const urls = import.meta.glob('../assets/bg/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['../assets/bg/' + name + '.webp'];

export const BACKDROPS = {
  home: {
    rooms: { '0-0': { day: u('room-home'), night: u('room-home-night') } }, // Living Room
    // `floor` = the y% where the standable ground starts in the image, so
    // furniture/characters land on the grass/deck instead of floating.
    yard: { day: u('yard-home'), night: u('yard-home-night'), floor: 66 },
    balcony: { day: u('balcony-home'), night: u('balcony-home-night'), floor: 65 },
  },
};

// Pick the right image for an entry given night mode (falls back to day).
export const pickBackdrop = (entry, night) => (entry ? (night && entry.night ? entry.night : entry.day) : null);
