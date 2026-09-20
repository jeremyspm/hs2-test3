/* Model answers for the 18 essay questions in her Module 2 quizzes.
   Canvas publishes no key for essays — THE ANSWERS BELOW ARE THE TOOL'S,
   sourced from her decks/learning pages, written as numbered steps (her
   marking = one mark per distinct step). Keyed on the normalised opening
   of the question text ONLY (an overlay may never key on what it writes).
   build.mjs fails if any essay in the bank finds no entry here, and if any
   entry here matches no essay — both directions. */
export const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const SAQ_ANSWERS = [
];
