import type { LearningPlan } from "./models";

export const seedPlan: LearningPlan = {
  id: "mobile-seed",
  hobby: "Guitar",
  title: "Play guitar at the next campfire.",
  promise:
    "Six useful techniques. No rabbit holes. Just enough guitar to play with people you like.",
  source: "crafted-fallback",
  techniques: [
    [
      "Foundation",
      "Clean chord changes",
      "Switch between G, C, D and Em without breaking the rhythm.",
      18,
      "practice",
    ],
    [
      "Rhythm",
      "Pocket strumming",
      "Keep a relaxed down-down-up groove through a complete progression.",
      22,
      "watch",
    ],
    [
      "Control",
      "Dynamic touch",
      "Use touch and volume to make a simple progression feel intentional.",
      16,
      "practice",
    ],
    [
      "Vocabulary",
      "Suspended movement",
      "Add two expressive shapes without memorising more songs.",
      20,
      "read",
    ],
    [
      "Performance",
      "Your first complete song",
      "Connect verse, chorus, and transitions without stopping.",
      35,
      "watch",
    ],
    [
      "Recovery",
      "Keep going after mistakes",
      "Recover on the next beat and protect the shared moment.",
      15,
      "listen",
    ],
  ].map(([eyebrow, title, description, duration, medium], index) => ({
    id: index + 1,
    eyebrow: String(eyebrow),
    title: String(title),
    description: String(description),
    duration: Number(duration),
    medium: medium as "practice" | "watch" | "read" | "listen",
    status: index === 0 ? "active" : "ready",
    why: "This is a high-leverage step toward your real-world goal.",
  })),
};
