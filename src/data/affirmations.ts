import { LifeStage } from "../types";

export interface Affirmation {
  id: string;
  text: string;
  theme: string;
  focusTag: string;
}

export const STAGE_AFFIRMATIONS: Record<LifeStage, Affirmation[]> = {
  teen: [
    {
      id: "teen-1",
      text: "Your body is learning its natural rhythm. Give yourself patience and kindness today.",
      theme: "Self-Compassion",
      focusTag: "Body Literacy",
    },
    {
      id: "teen-2",
      text: "Every change you experience is a healthy part of growing into your strength and wisdom.",
      theme: "Growth & Trust",
      focusTag: "Confidence",
    },
    {
      id: "teen-3",
      text: "Your emotions are valid signals, not inconveniences. Honor your need for rest and quiet.",
      theme: "Emotional Balance",
      focusTag: "Mindfulness",
    },
    {
      id: "teen-4",
      text: "You don't have to have everything figured out today. Listening to your feelings is the best first step.",
      theme: "Inner Peace",
      focusTag: "Self-Trust",
    },
    {
      id: "teen-5",
      text: "Confidence comes from knowing and celebrating your own unique timing and natural energy.",
      theme: "Empowerment",
      focusTag: "Individuality",
    },
    {
      id: "teen-6",
      text: "You are strong, capable, and worthy of taking up space exactly as you are.",
      theme: "Self-Worth",
      focusTag: "Self-Love",
    },
  ],

  cycle_hormonal: [
    {
      id: "cycle-1",
      text: "Your cycle is your fifth vital sign. Honor each phase for the unique strength and intuition it brings.",
      theme: "Cyclical Wisdom",
      focusTag: "Hormonal Rhythm",
    },
    {
      id: "cycle-2",
      text: "Resting during your luteal phase is not a setback—it is essential restoration for your vitality.",
      theme: "Nervous System Rest",
      focusTag: "Luteal Grace",
    },
    {
      id: "cycle-3",
      text: "Your body communicates in rhythms, not rules. You are learning to listen with compassionate awareness.",
      theme: "Body Connection",
      focusTag: "Mind-Body Flow",
    },
    {
      id: "cycle-4",
      text: "You are worthy of calm, space, and gentle nourishment regardless of where you are in your cycle.",
      theme: "Nourishment",
      focusTag: "Self-Care",
    },
    {
      id: "cycle-5",
      text: "Energy fluctuations are natural internal seasons. Flow with them rather than resisting them.",
      theme: "Natural Flow",
      focusTag: "Energy Syncing",
    },
    {
      id: "cycle-6",
      text: "Nourish your nervous system today; when you cultivate peace, your hormonal health flourishes.",
      theme: "Holistic Vitality",
      focusTag: "Endocrine Care",
    },
  ],

  ttc: [
    {
      id: "ttc-1",
      text: "Your body is resilient, capable, and doing extraordinary work every single day.",
      theme: "Resilience",
      focusTag: "Fertility Hope",
    },
    {
      id: "ttc-2",
      text: "Hold space for hope while treating your heart and body with deep, unconditional gentleness.",
      theme: "Gentle Hope",
      focusTag: "Emotional Care",
    },
    {
      id: "ttc-3",
      text: "You are so much more than numbers, charts, and tests. Your worth is absolute and complete.",
      theme: "Unconditional Worth",
      focusTag: "Self-Compassion",
    },
    {
      id: "ttc-4",
      text: "Trust the timing of your journey, and allow yourself moments of pure stillness and joy today.",
      theme: "Trust & Patience",
      focusTag: "Mindful Living",
    },
    {
      id: "ttc-5",
      text: "Every nourishing choice you make today is a meaningful act of love for your future and yourself.",
      theme: "Loving Intention",
      focusTag: "Pre-conception Wellness",
    },
    {
      id: "ttc-6",
      text: "Breathe in peace and release expectation. Your body is a sanctuary of strength.",
      theme: "Calm Strength",
      focusTag: "Inner Sanctuary",
    },
  ],

  pregnant: [
    {
      id: "pregnant-1",
      text: "You are creating life and holding immense strength, beauty, and power within you.",
      theme: "Maternal Strength",
      focusTag: "Baby & Body",
    },
    {
      id: "pregnant-2",
      text: "Trust your body's ancient wisdom. It intuitively knows how to adapt, nourish, and grow.",
      theme: "Innate Wisdom",
      focusTag: "Trimester Flow",
    },
    {
      id: "pregnant-3",
      text: "Take a deep breath and slow down—growing a human is sacred, profound work.",
      theme: "Slowing Down",
      focusTag: "Maternal Peace",
    },
    {
      id: "pregnant-4",
      text: "You are providing the safest, most nurturing environment for your baby today.",
      theme: "Safe Sanctuary",
      focusTag: "Bonding",
    },
    {
      id: "pregnant-5",
      text: "Listen to your maternal intuition; you already possess the quiet knowing your baby needs.",
      theme: "Intuitive Motherhood",
      focusTag: "Confidence",
    },
    {
      id: "pregnant-6",
      text: "Celebrate the quiet flutters and small moments today—they are milestones of profound connection.",
      theme: "Present Connection",
      focusTag: "Mindful Motherhood",
    },
  ],

  postpartum: [
    {
      id: "postpartum-1",
      text: "Healing is a continuous journey. You are rebuilding yourself with grace while nurturing new life.",
      theme: "Postpartum Grace",
      focusTag: "Fourth Trimester",
    },
    {
      id: "postpartum-2",
      text: "There is no rush to 'bounce back'—you are blooming forward into your next powerful chapter.",
      theme: "Blooming Forward",
      focusTag: "Body Healing",
    },
    {
      id: "postpartum-3",
      text: "Asking for help and taking a quiet moment for yourself strengthens your capacity to care for others.",
      theme: "Support & Strength",
      focusTag: "Self-Care",
    },
    {
      id: "postpartum-4",
      text: "Your body performed an absolute miracle. Treat every part of it with reverence and gratitude.",
      theme: "Body Reverence",
      focusTag: "Restoration",
    },
    {
      id: "postpartum-5",
      text: "Rest is essential medicine. Your recovery is just as important as the care you give.",
      theme: "Recovery Sanctuary",
      focusTag: "Pelvic & Energy Rest",
    },
    {
      id: "postpartum-6",
      text: "You are doing an incredible job, even on the days that feel tender and demanding.",
      theme: "Compassionate Motherhood",
      focusTag: "Daily Resilience",
    },
  ],

  perimenopause: [
    {
      id: "perimenopause-1",
      text: "This transition is an initiation into your most empowered, sovereign, and self-assured chapter.",
      theme: "Sovereign Power",
      focusTag: "Midlife Vitality",
    },
    {
      id: "perimenopause-2",
      text: "Your body is shifting its focus to your long-term wisdom. Embrace the power of setting clear boundaries.",
      theme: "Sacred Boundaries",
      focusTag: "Self-Protection",
    },
    {
      id: "perimenopause-3",
      text: "Fluctuations do not diminish your strength. You are redefining vitality on your own terms.",
      theme: "Renewed Vitality",
      focusTag: "Hormonal Transition",
    },
    {
      id: "perimenopause-4",
      text: "Listen to your body's invitation to slow down, nourish deeply, and release what no longer serves you.",
      theme: "Release & Renewal",
      focusTag: "Nervous System Care",
    },
    {
      id: "perimenopause-5",
      text: "Your wisdom and presence deepen with every season. Honor the evolution of your magnificent body.",
      theme: "Graceful Evolution",
      focusTag: "Longevity",
    },
    {
      id: "perimenopause-6",
      text: "You are stepping into a season of unfiltered clarity, deep autonomy, and authentic confidence.",
      theme: "Authentic Clarity",
      focusTag: "Empowerment",
    },
  ],

  menopause: [
    {
      id: "menopause-1",
      text: "You have arrived at a season of profound wisdom, grounded confidence, and radiant freedom.",
      theme: "Post-Menopausal Radiance",
      focusTag: "Golden Chapter",
    },
    {
      id: "menopause-2",
      text: "Your body is your lifelong sanctuary. Celebrate the strength, history, and resilience it holds.",
      theme: "Sanctuary of Strength",
      focusTag: "Body Appreciation",
    },
    {
      id: "menopause-3",
      text: "This is your time to invest in your joy, skeletal vitality, cardiovascular health, and inner peace.",
      theme: "Active Longevity",
      focusTag: "Bone & Heart Health",
    },
    {
      id: "menopause-4",
      text: "You live in deep alignment with your accumulated wisdom, intuition, and sovereign power.",
      theme: "Intuitive Mastery",
      focusTag: "Self-Mastery",
    },
    {
      id: "menopause-5",
      text: "Strength, sensuality, and vibrant vitality belong to you in this rich chapter and always.",
      theme: "Vibrant Presence",
      focusTag: "Holistic Health",
    },
    {
      id: "menopause-6",
      text: "Celebrate the freedom to prioritize yourself, your passions, and your peaceful wellbeing without apology.",
      theme: "Unapologetic Joy",
      focusTag: "Freedom",
    },
  ],
};

export function getDailyAffirmation(stage: LifeStage, seedOffset = 0): Affirmation {
  const list = STAGE_AFFIRMATIONS[stage] || STAGE_AFFIRMATIONS.cycle_hormonal;
  
  // Calculate deterministic day-of-year index so it's consistent for the day, but allows manual offset
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  const index = Math.abs((dayOfYear + seedOffset) % list.length);
  return list[index];
}
