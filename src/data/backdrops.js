// Optional image backdrops per building. When present they replace the built-in
// CSS scene (the CSS scenes stay as the default/fallback everywhere else).
//   rooms: keyed "<floorIndex>-<roomIndex>"
//   yard / balcony: the exterior of the ground / upper floors
// Each entry is { day, night?, floor? } — the night image is used when night mode
// is on (and is a complete night scene, so the moon/stars overlay is suppressed for
// it). `floor` is the y% where the standable ground starts in that image; placement
// is clamped to it so characters/furniture land on the floor instead of floating
// (omit it when the floor seam sits at or above the default ~66% band).
const urls = import.meta.glob('../assets/bg/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['../assets/bg/' + name + '.webp'];

export const BACKDROPS = {
  home: {
    rooms: {
      '0-0': { day: u('room-home'), night: u('room-home-night') },                  // Living Room (seam ~60%)
      '0-1': { day: u('room-kitchen'), night: u('room-kitchen-night') },            // Kitchen (seam ~64%)
      '1-0': { day: u('room-bed'), night: u('room-bed-night'), floor: 70 },         // Bedroom (carpet seam ~70%)
      '1-1': { day: u('room-bath'), night: u('room-bath-night') },                  // Bathroom (seam ~65%)
    },
    yard: { day: u('yard-home'), night: u('yard-home-night'), floor: 68 },
    balcony: { day: u('balcony-home'), night: u('balcony-home-night'), floor: 66 },
  },
};

// Pick the right image for an entry given night mode (falls back to day).
export const pickBackdrop = (entry, night) => (entry ? (night && entry.night ? entry.night : entry.day) : null);
