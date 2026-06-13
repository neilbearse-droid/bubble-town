const EVENTS = {
  popstar: {
    n: 'Pop Star Mania', e: '🎤', accent: '#F15BB5', banner: '🎤 Pop Star Mania!',
    wash: 'radial-gradient(130% 80% at 50% 0%, rgba(241,91,181,.32), rgba(155,93,229,.16) 60%, rgba(155,93,229,0))',
    blurb: 'Mics, a disco ball & sparkly pop stars!',
    chars: [
      { name: 'Star', skin: '#FFDFC4', hair: 'ponytail', hairColor: '#FF8FAB', top: '#F15BB5', bottom: '#9B5DE5', outfit: 'dress', eyes: '#8E7CC3' },
      { name: 'Vinyl', skin: '#B07D48', hair: 'puffs', hairColor: '#7B5EA7', top: '#9B5DE5', bottom: '#2D2A26', outfit: 'hoodie', eyes: '#2D2A26' },
      { name: 'Glitter', skin: '#F2C9A1', hair: 'buns', hairColor: '#3E92CC', top: '#FF99C8', bottom: '#F15BB5', outfit: 'dress', eyes: '#3E92CC' },
    ],
  },
  mermaid: {
    n: 'Mermaid Lagoon', e: '🧜', accent: '#2BB3C0', banner: '🧜 Mermaid Lagoon!',
    wash: 'radial-gradient(130% 80% at 50% 0%, rgba(43,179,192,.34), rgba(77,150,255,.16) 60%, rgba(77,150,255,0))',
    blurb: 'Seashells, bubbles & ocean friends!',
    chars: [
      { name: 'Coral', skin: '#F2C9A1', hair: 'long', hairColor: '#52B788', top: '#43AA8B', bottom: '#4D96FF', outfit: 'dress', eyes: '#52B788' },
      { name: 'Pearl', skin: '#A8D8EA', hair: 'long', hairColor: '#3E92CC', top: '#4D96FF', bottom: '#90BE6D', outfit: 'dress', eyes: '#3E92CC' },
      { name: 'Finn', skin: '#DDA15E', hair: 'swoop', hairColor: '#43AA8B', top: '#4D96FF', bottom: '#577590', outfit: 'tee', eyes: '#52B788' },
    ],
  },
  space: {
    n: 'Space Camp', e: '🚀', accent: '#6C5DD3', banner: '🚀 Space Camp!',
    wash: 'radial-gradient(130% 80% at 50% 0%, rgba(108,93,211,.34), rgba(40,30,90,.2) 60%, rgba(40,30,90,0))',
    blurb: 'Rockets, planets & astronaut pals!',
    chars: [
      { name: 'Nova', skin: '#CDB4F0', hair: 'bob', hairColor: '#7B5EA7', top: '#577590', bottom: '#4D96FF', outfit: 'overalls', eyes: '#8E7CC3' },
      { name: 'Comet', skin: '#8D5524', hair: 'spiky', hairColor: '#2D2A26', top: '#9B5DE5', bottom: '#577590', outfit: 'hoodie', eyes: '#2D2A26' },
      { name: 'Astra', skin: '#FFDFC4', hair: 'ponytail', hairColor: '#3E92CC', top: '#4D96FF', bottom: '#9B5DE5', outfit: 'dress', eyes: '#3E92CC' },
    ],
  },
};

export { EVENTS };
