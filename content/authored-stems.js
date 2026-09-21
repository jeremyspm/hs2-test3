/* Authored stems. `st` replaces the structured stem's LAYOUT only (the key, blanks and grading still come from the capture).
   An entry with `fig` rescues a question whose words are printed INSIDE her figure and nowhere else: `stem` is those printed
   words, copied, never written by the tool; it is matched on the figure file the question ships. A stale entry fails the build. */
export const AUTHORED_STEMS = [
  {
    // 211091 #19 — Canvas shows only her pedigree and its source link; the question is lettered across the top of the figure.
    quiz: '211091',
    fig: 'HS2DATA-784330d9f34c20d9.webp',
    stem: 'What pattern of inheritance does this trait follow?',
    k: 'what pattern of inheritance does this trait follow',
    st: {
      html:
        '<p>What pattern of inheritance does this trait follow? <em>(her question, as printed across the top of her figure)</em></p>' +
        '[[IMG:HS2DATA-784330d9f34c20d9.webp]]',
    },
  },
  {
    // 211011 #2 — on Canvas the question is ONLY an embedded video ("Anatomy and Function of the Eye") above the pairs. His save
    // kept the player's own page (title, channel, "728 subscribers", "Watch on") and not its link, so the stem read as YouTube
    // furniture. The one question line is the tool's and says so; the pairs, key and grading are hers, unchanged.
    quiz: '211011',
    k: 'anatomy and function of the eye youtube',
    st: {
      html:
        '<p>Match each description with the part of the eye.</p>' +
        '<p><em>(On Canvas this question is only her embedded video, “Anatomy and Function of the Eye”, above the pairs; ' +
        'this line is the tool’s.)</em></p>',
    },
  },
];
