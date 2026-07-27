import type { LearningPlan } from "../../shared/learning-plan.js";

export const seedPlan: LearningPlan = {
  id: "seed-guitar-campfire",
  hobby: "Guitar",
  title: "Play guitar at the next campfire.",
  promise:
    "Six useful techniques. No rabbit holes. Just enough guitar to play the songs you love with people you like.",
  source: "crafted-fallback",
  techniques: [
    {
      id: 1,
      eyebrow: "Foundation",
      title: "Clean chord changes",
      description: "Switch between G, C, D and Em without breaking the rhythm.",
      duration: 18,
      medium: "practice",
      status: "done",
      why: "Unlocks hundreds of songs and makes every next step feel musical.",
    },
    {
      id: 2,
      eyebrow: "Rhythm",
      title: "The pocket strum",
      description:
        "Build a relaxed down–down–up groove you can hold through a full song.",
      duration: 22,
      medium: "watch",
      status: "active",
      why: "Steady rhythm matters more than fancy chords when you play with others.",
    },
    {
      id: 3,
      eyebrow: "Expression",
      title: "Dynamics that tell a story",
      description:
        "Use touch and volume to make a simple progression feel intentional.",
      duration: 14,
      medium: "listen",
      status: "ready",
      why: "A small technique with a huge effect on how your playing sounds.",
    },
    {
      id: 4,
      eyebrow: "Vocabulary",
      title: "The useful sus chords",
      description:
        "Add movement with Dsus2, Dsus4 and Asus2—without learning new shapes.",
      duration: 16,
      medium: "read",
      status: "ready",
      why: "Adds colour without adding much cognitive load.",
    },
    {
      id: 5,
      eyebrow: "Repertoire",
      title: "Your first complete song",
      description:
        "Put the pieces together in a song chosen for your taste and level.",
      duration: 28,
      medium: "practice",
      status: "ready",
      why: "Finishing a real song turns isolated practice into confidence.",
    },
    {
      id: 6,
      eyebrow: "Independence",
      title: "Learn songs by ear",
      description:
        "A repeatable three-step method for finding the key and basic chords.",
      duration: 20,
      medium: "watch",
      status: "ready",
      why: "Helps you keep learning without depending on tutorials forever.",
    },
  ],
};
