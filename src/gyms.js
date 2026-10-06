// Legacy BJJ academies, as listed at https://www.legacybjj.com.au/find-an-academy/
// `clubworx` is the site slug used at https://app.clubworx.com/websites/<slug>/...
// Academies without a public Clubworx calendar link out to their own timetable page instead.
const gyms = [
  { id: 'sydneyhq', name: 'Sydney HQ', suburb: 'Chippendale', region: 'NSW', clubworx: 'legacy-jiu-jitsu' },
  { id: 'brookvale', name: 'Brookvale', region: 'NSW', clubworx: 'warrior-training-academy' },
  { id: 'chatswood', name: 'Chatswood', region: 'NSW', clubworx: 'legacy-bjj-willoughby-pty-ltd' },
  { id: 'hornsby', name: 'Hornsby', region: 'NSW', clubworx: 'carioti-mma' },
  { id: 'parramatta', name: 'Parramatta', suburb: 'Rydalmere', region: 'NSW', clubworx: 'legacy-bjj-parramatta' },
  { id: 'corrimal', name: 'Corrimal', region: 'NSW', clubworx: 'legacy-bjj-wollongong' },
  { id: 'dapto', name: 'Dapto', region: 'NSW', clubworx: 'legacy-bjj-dapto' },
  { id: 'midcoast', name: 'Midcoast', suburb: 'Diamond Beach', region: 'NSW' },
  { id: 'sunshinecoast', name: 'Sunshine Coast', region: 'QLD', clubworx: 'legacy-bjj-sunshine-coast' },
  { id: 'peregian', name: 'Peregian', suburb: 'Peregian Beach', region: 'QLD', clubworx: 'legacy-bjj-peregian' },
  { id: 'hobart', name: 'Hobart', region: 'TAS', clubworx: 'legacy-bjj-hobart' },
].map(gym => ({ ...gym, url: `https://www.legacybjj.com.au/${gym.id}/` }));

module.exports = { gyms };
