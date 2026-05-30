/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AppUser {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  xp: number;
  level: number;
  rank: string;
  unlockedAchievements?: string[];
}

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  iconName: 'Sparkles' | 'Trophy' | 'Award' | 'Flame' | 'Crown' | 'Zap' | 'Mic' | 'Calendar' | 'BookOpen';
  color: 'emerald' | 'amber' | 'purple' | 'orange' | 'rose';
}

export const ACHIEVEMENTS_LIST: AchievementDef[] = [
  {
    id: 'first_steps',
    title: 'Vocal Explorer',
    description: 'Complete your first speech exercise milestone',
    iconName: 'Mic',
    color: 'emerald'
  },
  {
    id: 'rank_novice',
    title: 'Vocal Novice',
    description: 'Begin your journey as a Novice speaker (Level 1+)',
    iconName: 'Zap',
    color: 'emerald'
  },
  {
    id: 'vocal_maestro',
    title: 'Vocal Maestro',
    description: 'Complete 3 speech exercises to build momentum',
    iconName: 'Flame',
    color: 'amber'
  },
  {
    id: 'rank_practitioner',
    title: 'Rising Practitioner',
    description: 'Reach Level 5 or higher to achieve the Practitioner rank',
    iconName: 'Award',
    color: 'amber'
  },
  {
    id: 'silver_tongue',
    title: 'Silver Tongue',
    description: 'Score 85% or higher in clarity metric',
    iconName: 'Sparkles',
    color: 'purple'
  },
  {
    id: 'golden_tone',
    title: 'Master of Cadence',
    description: 'Score 90% or higher in both clarity and intonation',
    iconName: 'Trophy',
    color: 'purple'
  },
  {
    id: 'seven_day_streak',
    title: '7-Day Streak',
    description: 'Complete 7 exercises to build a speech habit',
    iconName: 'Calendar',
    color: 'orange'
  },
  {
    id: 'rank_orator',
    title: 'Master Orator',
    description: 'Reach Level 10 or higher to achieve the Master Orator rank',
    iconName: 'BookOpen',
    color: 'purple'
  },
  {
    id: 'vocal_athlete',
    title: 'Vocal Athlete',
    description: 'Complete 15 speech exercises to form an expert routine',
    iconName: 'Flame',
    color: 'rose'
  },
  {
    id: 'rank_legend',
    title: 'Articulate Legend',
    description: 'Reach Level 15 or higher to achieve the Articulate Legend rank',
    iconName: 'Crown',
    color: 'rose'
  }
];

export function getEligibleAchievements(params: {
  xp: number;
  level: number;
  completedCount: number;
  clarityScore: number;
  intonationScore: number;
}): string[] {
  const eligible: string[] = [];

  // 1. Vocal Explorer
  if (params.completedCount >= 1) {
    eligible.push('first_steps');
  }

  // 2. Novice Rank (Level 1+)
  if (params.level >= 1) {
    eligible.push('rank_novice');
  }

  // 3. Vocal Maestro
  if (params.completedCount >= 3) {
    eligible.push('vocal_maestro');
  }

  // 4. Practitioner Rank (Level 5+)
  if (params.level >= 5) {
    eligible.push('rank_practitioner');
  }

  // 5. Silver Tongue
  if (params.clarityScore >= 85) {
    eligible.push('silver_tongue');
  }

  // 6. Golden Tone (Score 90% or higher in both clarity and intonation)
  if (params.clarityScore >= 90 && params.intonationScore >= 90) {
    eligible.push('golden_tone');
  }

  // 7. 7-Day Streak / 7 Exercises Completed
  if (params.completedCount >= 7) {
    eligible.push('seven_day_streak');
  }

  // 8. Master Orator Rank (Level 10+)
  if (params.level >= 10) {
    eligible.push('rank_orator');
  }

  // 9. Vocal Athlete
  if (params.completedCount >= 15) {
    eligible.push('vocal_athlete');
  }

  // 10. Articulate Legend Rank (Level 15+)
  if (params.level >= 15) {
    eligible.push('rank_legend');
  }

  return eligible;
}

export interface Exercise {
  id: string;
  title: string;
  text: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  baseXP: number;
  lang: 'en' | 'id';
}

export const EXERCISES_LIST: Exercise[] = [
  // ================= EN ENGLISH EXERCISES =================
  // 1. Sibilants Focus (S/Z sounds)
  { id: 'sibilants-b1', title: 'The Sibilant Snail', text: 'Six slippery snails slid slowly seaward.', category: 'Sibilants', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'sibilants-b2', title: 'Silk Shirts', text: "Sam's shop sells short, silk shirts.", category: 'Sibilants', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'sibilants-i1', title: 'Sharif\'s Sofa', text: "She saw Sharif's shoes on the sofa.", category: 'Sibilants', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'sibilants-i2', title: 'Shellfish Shelter', text: 'Seven selfish shellfish sheltered in a shallow shack.', category: 'Sibilants', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'sibilants-a1', title: 'The Sizzling Soup', text: 'The spicy soup sizzled, sending several sensational scents swirling.', category: 'Sibilants', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 2. Plosives Focus (P/B/T/D/K/G sounds)
  { id: 'plosives-b1', title: 'Baked Beans', text: 'Pat prepped delicious sweet hot baked beans.', category: 'Plosives', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'plosives-b2', title: 'Black Bug Bites', text: 'The big black bear bit a big black bug.', category: 'Plosives', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'plosives-i1', title: 'Peter Piper\'s Peppers', text: 'Peter Piper picked a peck of pickled peppers.', category: 'Plosives', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'plosives-i2', title: 'Double Bubble', text: 'Double bubble gum bubbles double.', category: 'Plosives', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'plosives-a1', title: 'Crisp Crusts', text: 'Crisp crusts crackle and crunch conspicuously under copper pots.', category: 'Plosives', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 3. Rhotic Focus (R-sounds)
  { id: 'rhotic-b1', title: 'Rare Rivers', text: 'Real rock ring rings around rare rivers.', category: 'Rhotic', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'rhotic-b2', title: 'Rough Roads', text: 'Run rough roads rapidly for rich rewards.', category: 'Rhotic', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'rhotic-i1', title: 'Lory Rhymes', text: 'Red lory, yellow lory, red lory, yellow lory.', category: 'Rhotic', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'rhotic-i2', title: 'Richard\'s Raw Rollers', text: 'Richard readily wrote wrong rhymes on raw rollers.', category: 'Rhotic', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'rhotic-a1', title: 'The Raging Warrior', text: 'Rory the warrior and Roger the worrywart rushed round the rugged rocks.', category: 'Rhotic', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 4. Nasals Focus (M/N/NG sounds)
  { id: 'nasals-b1', title: 'Many Mammals', text: 'Many mammals munch merry morsels.', category: 'Nasals', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'nasals-b2', title: 'Nice Nestlings', text: 'Nine nice owls nestled in a noisy barn.', category: 'Nasals', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'nasals-i1', title: 'Monkeys Midday Moves', text: 'Noisy monkeys make more messy moves on midday.', category: 'Nasals', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'nasals-i2', title: 'Ringing Song', text: 'A cunning king sang a long, ringing song.', category: 'Nasals', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'nasals-a1', title: 'Murmuring Management', text: 'Minimizing monumental management normalizes noncommittal nominated murmurs.', category: 'Nasals', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 5. Woodchucking Focus (Consonant / W alternation)
  { id: 'woodchucking-b1', title: 'The Woodchuck Classic', text: 'How much wood would a woodchuck chuck if a woodchuck could chuck wood?', category: 'Woodchucking', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'woodchucking-b2', title: 'Chucking Speed', text: 'He chucked wood as fast as a woodchuck would with pride.', category: 'Woodchucking', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'woodchucking-i1', title: 'The Full Chuck', text: 'A woodchuck would chuck all the wood he could chuck if empowered.', category: 'Woodchucking', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'woodchucking-i2', title: 'Wet or Dry Wood', text: 'Whether the wood is wet or the wood is dry, he chucks.', category: 'Woodchucking', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'woodchucking-a1', title: 'Clever Chipmunks', text: 'Woodchucks challenging clever chipmunks continuously churned chopped chestnut logs.', category: 'Woodchucking', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 6. Vowels Focus (Vocal resonance)
  { id: 'vowels-b1', title: 'Blue Spoons', text: 'Blue spoons pool cool soup on the roof.', category: 'Vowels', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'vowels-b2', title: 'Apes at the Lake', text: 'Eight apes ate grapes late at the lake.', category: 'Vowels', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'vowels-i1', title: 'The Glowing Moon', text: 'The glowing moon illuminates the gloomy room.', category: 'Vowels', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'vowels-i2', title: 'Bright Lights', text: 'Bright light shines in the white night sky.', category: 'Vowels', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'vowels-a1', title: 'Eager Eagles', text: 'Eager eagles easily sweep over the deep green valley stream.', category: 'Vowels', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 7. Consonants Focus (Challenging stops)
  { id: 'consonants-b1', title: 'Bat and Bag', text: 'Black back bat went back to the bag.', category: 'Consonants', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'consonants-b2', title: 'Prompt Plums', text: 'The prompt public picked a warm pink plum.', category: 'Consonants', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'consonants-i1', title: 'Thirsty Thieves', text: 'Thirteen thirsty thieves thanked their thoughtful trainer.', category: 'Consonants', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'consonants-i2', title: 'Whistling Postman', text: 'Flash message from the busy whistling postman.', category: 'Consonants', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'consonants-a1', title: 'Seashell Seashore', text: 'She sells seashells by the seashore, and the shells she sells are seashells.', category: 'Consonants', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 8. Fricatives Focus (F/V/TH friction breathing)
  { id: 'fricatives-b1', title: 'Fresh Fish', text: 'Four fine fresh fish freed for food.', category: 'Fricatives', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'fricatives-b2', title: 'Vivid Voices', text: 'Very vivid voices value vital votes.', category: 'Fricatives', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'fricatives-i1', title: 'Fifty-five Frogs', text: 'Fifty-five friendly frogs fled from fifty fierce fishes.', category: 'Fricatives', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'fricatives-i2', title: 'Father\'s Flights', text: 'Father felt fine following five friendly flights.', category: 'Fricatives', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'fricatives-a1', title: 'The Ruthless Youth', text: 'The ruthless truth of the toothless youth was voiced fourth.', category: 'Fricatives', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 9. Diphthongs Focus (Vowel glides)
  { id: 'diphthongs-b1', title: 'Boy and Oil', text: 'The boy joyfully pointed to the oil in the soil.', category: 'Diphthongs', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'diphthongs-b2', title: 'Pain and Gain', text: 'No pain, no gain, stay on the train.', category: 'Diphthongs', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'diphthongs-i1', title: 'Loudest Clown', text: 'Brown cows crowd around the loudest town clown.', category: 'Diphthongs', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'diphthongs-i2', title: 'Troy\'s Toys', text: 'Troy enjoyed showing his choice toys to the royal boys.', category: 'Diphthongs', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'diphthongs-a1', title: 'The High Wire Guy', text: 'Our dry eyes spy five wide ties on the high wire guy.', category: 'Diphthongs', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 10. Liquids Focus (Fluid transition of L & R)
  { id: 'liquids-b1', title: 'Red and Yellow Roses', text: 'Red roses lily, yellow roses bloom in tandem.', category: 'Liquids', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'liquids-b2', title: 'Larry\'s Logs', text: 'Larry likes rolling logs down the grassy hill.', category: 'Liquids', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'liquids-i1', title: 'The Loyal Warrior', text: 'A loyal warrior rarely worries about rural rulers.', category: 'Liquids', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'liquids-i2', title: 'Classic Leather', text: 'Red leather, yellow leather, red leather, yellow leather.', category: 'Liquids', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'liquids-a1', title: 'Parallel Guidelines', text: 'Literally literary critically parallel rural library guidelines.', category: 'Liquids', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 11. Laterals Focus (Accentuated L sound)
  { id: 'laterals-b1', title: 'Lucy\'s Locket', text: 'Lucky little Lucy lost her yellow locket.', category: 'Laterals', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'laterals-b2', title: 'Leaping Leopards', text: 'Lively leopards like leaping over leafy logs.', category: 'Laterals', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'laterals-i1', title: 'Yellow Lilies', text: 'Little Leyla lovingly lighted yellow lilies.', category: 'Laterals', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'laterals-i2', title: 'Lonely Lion', text: 'The lonely lion licked the lovely lime lollipop.', category: 'Laterals', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'laterals-a1', title: 'Lyrical Leads', text: 'Locally loyal lyrical leads legitimately leveled several long tall ladders.', category: 'Laterals', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // 12. Oratory Focus (Rhetoric & Cadence)
  { id: 'oratory-b1', title: 'Deliberate Cadence', text: 'Practice speaking slowly, state opinions clearly and warmly.', category: 'Oratory', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'oratory-b2', title: 'Strong Voice', text: 'Strong voices inspire hope and unite people everywhere.', category: 'Oratory', difficulty: 'Beginner', baseXP: 50, lang: 'en' },
  { id: 'oratory-i1', title: 'Public Delivery', text: 'Public speaking demands deliberate breathing and balanced vocal resonance.', category: 'Oratory', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'oratory-i2', title: 'Vocal Dynamics', text: 'A grand orator captures the crowd with dynamic pitch variance.', category: 'Oratory', difficulty: 'Intermediate', baseXP: 100, lang: 'en' },
  { id: 'oratory-a1', title: 'The Graceful Broadcaster', text: 'The unique New York knack of articulating architectural innovations gracefully.', category: 'Oratory', difficulty: 'Advanced', baseXP: 150, lang: 'en' },

  // ================= ID INDONESIAN EXERCISES =================
  // 1. Sibilants Focus (S/Z sounds)
  { id: 'id-sibilants-b1', title: 'Satu Sate', text: 'Satu sate tujuh tusuk sate sapu-sapu.', category: 'Sibilants', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-sibilants-b2', title: 'Saya Suka Susu', text: 'Saya suka susu sapi segar setiap selasa.', category: 'Sibilants', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-sibilants-i1', title: 'Sisi Susun Susu', text: 'Sisi susun sepuluh susu sapi di atas meja sasar.', category: 'Sibilants', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-sibilants-i2', title: 'Sesat di Sawah', text: 'Samsul sesat di sawah sambil sesak napas sedikit.', category: 'Sibilants', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-sibilants-a1', title: 'Silsilah Singa', text: 'Silsilah sang singa sungsang sangat menyulitkan semua sirkus.', category: 'Sibilants', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 2. Plosives Focus (P/B/T/D/K/G sounds)
  { id: 'id-plosives-b1', title: 'Papa Minta Pipa', text: 'Papa papa minta pipa panjang pakai perunggu.', category: 'Plosives', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-plosives-b2', title: 'Bebek Bebas', text: 'Bebek bapak berkeliaran bebas di belakang bangsal.', category: 'Plosives', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-plosives-i1', title: 'Kuku Kakek Kaku', text: 'Kuku kaki kakekku kaku-kaku kena kuman kaktus.', category: 'Plosives', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-plosives-i2', title: 'Dadang Dinding', text: 'Dadang dandan di depan dinding dapur dekil.', category: 'Plosives', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-plosives-a1', title: 'Gatot Gatal', text: 'Gatot gemar makan getuk goreng hangat di gubuk genteng garut.', category: 'Plosives', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 3. Rhotic Focus (R-sounds)
  { id: 'id-rhotic-b1', title: 'Lari Lurus', text: 'Lutung kasarung lari lurus tanpa ragu.', category: 'Rhotic', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-rhotic-b2', title: 'Ular Melingkar', text: 'Ular melingkar-lingkar di atas pagar rumah rari.', category: 'Rhotic', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-rhotic-i1', title: 'Rara Riri Ruru', text: 'Rara riri ruru rera rero berlari-lari riang.', category: 'Rhotic', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-rhotic-i2', title: 'Raja Rubah', text: 'Raja rubah merusak rantai ring besi merah rontok.', category: 'Rhotic', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-rhotic-a1', title: 'Roro Rugi Ratusan', text: 'Roro rindu rasi bintang sambil meraba-raba rute roda gerobak.', category: 'Rhotic', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 4. Nasals Focus (M/N/NG sounds)
  { id: 'id-nasals-b1', title: 'Mama Makan Mangga', text: 'Mama makan mangga matang manis melimpah.', category: 'Nasals', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-nasals-b2', title: 'Nanas Nia', text: 'Nita nanam nanas muda di nampan.', category: 'Nasals', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-nasals-i1', title: 'Nyonya Nyanyi', text: 'Nyonya nyanyi nyaring-nyaring membuat nyaman tetangga.', category: 'Nasals', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-nasals-i2', title: 'Menguning Mangga', text: 'Mangga menguning menggantung manis menggoda monyet.', category: 'Nasals', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-nasals-a1', title: 'Menyanyi Nyaring', text: 'Nuning menyanyi nyaring sambil mengunyah nyam-nyam manis di ranjang.', category: 'Nasals', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 5. Woodchucking Focus (Consonant / W alternation)
  { id: 'id-woodchucking-b1', title: 'Kucing Kuning', text: 'Kucing kuning kencing kencang di kasur.', category: 'Woodchucking', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-woodchucking-b2', title: 'Warta Warga', text: 'Wiwit wara-wara warta warga yang waras.', category: 'Woodchucking', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-woodchucking-i1', title: 'Cari Cacing', text: 'Cicak-cicak di dinding cari cacing cokelat cepat.', category: 'Woodchucking', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-woodchucking-i2', title: 'Kuku Kucing', text: 'Kuku kucing kusam kaku kena kikis kayu.', category: 'Woodchucking', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-woodchucking-a1', title: 'Kecap Cap Kunci', text: 'Koki kecam kecap cap kunci karena kurang kental.', category: 'Woodchucking', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 6. Vowels Focus (Vocal resonance)
  { id: 'id-vowels-b1', title: 'Ono Opo-opo', text: 'Ono opo opo-opo oleh dimakan orang ompong.', category: 'Vowels', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-vowels-b2', title: 'Ibu Iri', text: 'Ibu tiri iri melihat iuran indah itu.', category: 'Vowels', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-vowels-i1', title: 'Ular Usil', text: 'Ular usil utus udang untuk ukur ubin.', category: 'Vowels', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-vowels-i2', title: 'Ayam Alas', text: 'Ayam alas anak angsa aman di atas anjungan.', category: 'Vowels', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-vowels-a1', title: 'Elang Elok', text: 'Elang elok emang enak egois di sore elok.', category: 'Vowels', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 7. Consonants Focus (Challenging stops)
  { id: 'id-consonants-b1', title: 'Khawatir Khusus', text: 'Khawatir khusus di hari akhir pekan itu.', category: 'Consonants', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-consonants-b2', title: 'Syarat Syukur', text: 'Masyarakat wajib memiliki syarat syukur yang luas.', category: 'Consonants', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-consonants-i1', title: 'Ziarah Zaman', text: 'Zul melakukan ziarah zaman dulu secara tertib.', category: 'Consonants', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-consonants-i2', title: 'Proyek Promosi', text: 'Pratama memimpin proyek promosi produk secara profesional.', category: 'Consonants', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-consonants-a1', title: 'Struktur Strategis', text: 'Struktur strategis transportasi stasiun sulit distabilkan seketika.', category: 'Consonants', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 8. Fricatives Focus (F/V/TH friction breathing)
  { id: 'id-fricatives-b1', title: 'Feri Veteran', text: 'Feri veteran foto-foto villa yang sangat mewah.', category: 'Fricatives', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-fricatives-b2', title: 'Hutan Hijau', text: 'Hutan hijau penuh harimau hitam bermain riang.', category: 'Fricatives', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-fricatives-i1', title: 'Fokus Visual', text: 'Fitri fokus melihat visual variasi vas bunga.', category: 'Fricatives', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-fricatives-i2', title: 'Hari Hangat', text: 'Hari hangat hiasi hubungan harmonis hamdan.', category: 'Fricatives', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-fricatives-a1', title: 'Fasilitas Valid', text: 'Fasilitas film festival fiksi memerlukan verifikasi fisik yang valid.', category: 'Fricatives', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 9. Diphthongs Focus (Vowel glides)
  { id: 'id-diphthongs-b1', title: 'Tupai Pandai', text: 'Kalau damai, tupai pandai melompat ke lantai.', category: 'Diphthongs', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-diphthongs-b2', title: 'Kicau Limau', text: 'Kicau burung di kebun limau dekat danau sunyi.', category: 'Diphthongs', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-diphthongs-i1', title: 'Sepai Amboi', text: 'Tupai amboi santai makan petai di pantai.', category: 'Diphthongs', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-diphthongs-i2', title: 'Andai Santai', text: 'Andai pacar pandai santai di atas balai-balai.', category: 'Diphthongs', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-diphthongs-a1', title: 'Saujana Lampau', text: 'Saujana hijau di masa lampau melahirkan kilau memukau.', category: 'Diphthongs', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 10. Liquids Focus (Fluid transition of L & R)
  { id: 'id-liquids-b1', title: 'Lalat Lari', text: 'Lalat lari lurus lari liar di lemari.', category: 'Liquids', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-liquids-b2', title: 'Rara Loyo', text: 'Rara lari lalu riri mendadak loyo sekali.', category: 'Liquids', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-liquids-i1', title: 'Lolor Loreng', text: 'Lolor loreng melar lari melintasi laras senapan.', category: 'Liquids', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-liquids-i2', title: 'Rambut Lurus', text: 'Rara meraba rambut lurus lili berkali-kali.', category: 'Liquids', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-liquids-a1', title: 'Lirik Rel', text: 'Lili relaks lirik rel kereta lurus memanjang rampung.', category: 'Liquids', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 11. Laterals Focus (Accentuated L sound)
  { id: 'id-laterals-b1', title: 'Lili Lelah', text: 'Lili lelah lalu lalang lama-lama di lobi.', category: 'Laterals', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-laterals-b2', title: 'Lalat Layu', text: 'Lulur kulit lalat lalu layu terkena lilin.', category: 'Laterals', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-laterals-i1', title: 'Lolipop Lemon', text: 'Lila lapar lalu lelap lahap lolipop lemon.', category: 'Laterals', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-laterals-i2', title: 'Lentera Lemah', text: 'Lentera lemah lulur lilin luntur di lantai luas.', category: 'Laterals', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-laterals-a1', title: 'Lele Lincah', text: 'Linu lele lincah lewati lubang lumpur lekat-lekat.', category: 'Laterals', difficulty: 'Advanced', baseXP: 150, lang: 'id' },

  // 12. Oratory Focus (Rhetoric & Cadence)
  { id: 'id-oratory-b1', title: 'Bicara Jelas', text: 'Berbicaralah dengan tenang, sampaikan pesan dengan penuh ketulusan.', category: 'Oratory', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-oratory-b2', title: 'Suara Mantap', text: 'Suara mantap dan tenang membangkitkan harapan besar bagi semua.', category: 'Oratory', difficulty: 'Beginner', baseXP: 50, lang: 'id' },
  { id: 'id-oratory-i1', title: 'Napas Teratur', text: 'Pidato persuasif memerlukan pengaturan napas panjang yang teratur dan rileks.', category: 'Oratory', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-oratory-i2', title: 'Orator Ulung', text: 'Seorang orator ulung memukau pendengar dengan dinamika intonasi yang memikat.', category: 'Oratory', difficulty: 'Intermediate', baseXP: 100, lang: 'id' },
  { id: 'id-oratory-a1', title: 'Artikulasi Bangsa', text: 'Kemampuan artikulasi luhur mempersatukan perbedaan gagasan demi kemajuan bangsa.', category: 'Oratory', difficulty: 'Advanced', baseXP: 150, lang: 'id' }
];
