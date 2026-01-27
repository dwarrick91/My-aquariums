export const INITIAL_DATA = [
  {
    id: 1, name: "The Monster", category: "home", type: "Freshwater", size: "135 Gallon",
    image: null,
    notes: [],
    tasks: [
      { name: "Water Change", frequency: 7, lastCompleted: null, history: [] },
      { name: "Clean Canister Filters", frequency: 30, lastCompleted: null, history: [] }
    ]
  },
  // ... (Paste the rest of your INITIAL_DATA array here)
  {
    id: 806, name: "Filter 6", category: "rodi", type: "Polishing", size: "Stage 6",
    image: null,
    notes: [],
    tasks: [{ name: "Replace Filter", frequency: 180, lastCompleted: null, history: [] }]
  }
];

export const DEFAULT_CATEGORIES = ['home', 'hermit', 'plants', 'meemaw', 'rodi'];