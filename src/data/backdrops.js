// Optional image backdrops per building. When present they replace the built-in
// CSS scene (the CSS scenes stay as the default/fallback everywhere else).
//   rooms: keyed "<floorIndex>-<roomIndex>"
//   yard / balcony: the exterior of the ground / upper floors
const urls = import.meta.glob('../assets/bg/*.webp', { eager: true, query: '?url', import: 'default' });
const u = (name) => urls['../assets/bg/' + name + '.webp'];

export const BACKDROPS = {
  home: {
    rooms: { '0-0': u('room-home') }, // Living Room (first room you see)
    yard: u('yard-home'),
    balcony: u('balcony-home'),
  },
};
