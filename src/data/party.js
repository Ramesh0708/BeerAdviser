export const BOTTLE_SLICES = [
  { id: "truth", label: "Truth", hue: "#7cffb2" },
  { id: "dare", label: "Dare", hue: "#ff6b6b" },
  { id: "task", label: "Task", hue: "#f5b942" },
  { id: "toast", label: "Toast", hue: "#f4d35e" },
  { id: "hydrate", label: "Hydrate", hue: "#6ee7b7" },
  { id: "wild", label: "Wild", hue: "#c4a574" },
];

export const TRUTHS = [
  "What’s the worst beer you’ve ever finished anyway?",
  "Who in this room has the most chaotic taste in pours?",
  "What’s a song you’d put on if you owned the aux forever?",
  "What’s your most embarrassing toast?",
  "Which house would you get a tattoo of — and why?",
  "What’s a secret snack you pair with beer that nobody knows?",
  "Who would you trust to pour your Guinness?",
  "What’s the last lie you told about being ‘fine to drive’ — water only from now on.",
  "Which friend is most likely to start a kitchen dance?",
  "What’s your 2am order every single time?",
];

export const DARES = [
  "Do your best bartender pour mime for 15 seconds.",
  "Speak only in beer slogans until your next turn.",
  "Give a 20-second TED talk on foam.",
  "Swap seats with the person on your left.",
  "Make a toast that rhymes. No mercy.",
  "Impression of the last person who said ‘one more’.",
  "Balance a lime (or a lime-shaped fist) on your head for 10 seconds.",
  "Hum a cricket anthem until someone names it.",
  "Let the group rename you for the next three rounds.",
  "Send a voice note to the group chat that is only the word ‘cheers’.",
];

export const TASKS = [
  "Refill everyone’s water. Champion behavior.",
  "Queue one song. If it slaps, you are legend.",
  "Deal the snacks like a croupier.",
  "Take a group photo. Make it cinematic.",
  "Invent a house cocktail name. No ingredients required.",
  "Clink glasses with every person at the table.",
  "Write a one-line review of the night so far.",
  "Pick the next game. Your dictatorship lasts one round.",
  "Compliment the pour of the person across from you.",
  "Count to 10 in your most dramatic movie trailer voice.",
];

export function promptForSlice(id) {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  if (id === "truth") return { kind: "Truth", text: pick(TRUTHS) };
  if (id === "dare") return { kind: "Dare", text: pick(DARES) };
  if (id === "task") return { kind: "Task", text: pick(TASKS) };
  if (id === "toast") return { kind: "Toast", text: "Stand up. Toast the room. Make it weird. Make it kind." };
  if (id === "hydrate") return { kind: "Hydrate", text: "Water round. The table waits. Then we spin again." };
  return { kind: "Wild", text: pick([...TRUTHS, ...DARES, ...TASKS]) };
}
