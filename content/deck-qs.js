/* HER 2024 DECK'S WORKED EXAMPLES — "2024 Reproduction, Genetics & Special senses (corrected).pptx" (HS2 Canvas files; mined
   12 Oct 2026). Each question is a case she poses on a slide AND answers on the same slide: slide 10 (carrier mother ×
   normal father, colour blindness), slide 11 (colour-blind father × normal mother), slide 22 (heterozygous A × heterozygous B,
   "So what are the chances? 25%"), slide 23 (sickle cell, incomplete dominance: both parents Aa, then Aa × AA).
   Stems are her case wording; the options are the tool's (her slides ask an open question); every key is the answer on her
   slide. `row` = the checklist row, read by hand. Same shape as content/worksheet.js. */
export const DECKQS = {
  quiz: 'deck-gen24', name: 'Her genetics deck: worked examples', sys: 'gen',
  items: [
    { k: 'cb-carrier-sons', type: 'mcq', row: 'gen-sexlinked',
      q: 'Case (her deck, slide 10): a woman carries a defective allele (XBXb genotype). She has children with a man with normal colour vision (XBY genotype). What are her chances of having sons that are colour blind?',
      opts: ['0%', '25%', '50%', '100%'], key: '50%' },
    { k: 'cb-carrier-daughters', type: 'mcq', row: 'gen-sexlinked',
      q: 'Case (her deck, slide 10): a woman carries a defective allele (XBXb). She has children with a man with normal colour vision (XBY). What are her chances of having daughters that are colour blind?',
      opts: ['0%', '25%', '50%', '100%'], key: '0%' },
    { k: 'cb-father-sons', type: 'mcq', row: 'gen-sexlinked',
      q: 'Case (her deck, slide 11): a man carries a defective allele (XbY genotype). He has children with a woman with normal colour vision (XBXB genotype). What are the couple\'s chances of having sons that are colour blind?',
      opts: ['0%', '25%', '50%', '100%'], key: '0%' },
    { k: 'cb-father-daughters', type: 'mcq', row: 'gen-sexlinked',
      q: 'Case (her deck, slide 11): a colour-blind man (XbY) has children with a woman with normal colour vision (XBXB). What will their daughters be?',
      opts: ['All colour blind', 'Normal vision, but all carriers (XBXb)', 'Half carriers, half normal (XBXB)', 'Half colour blind, half carriers'], key: 'Normal vision, but all carriers (XBXb)' },
    { k: 'abo-ao-bo', type: 'mcq', row: 'gen-blood',
      q: 'Her deck, slide 22: what would be the chance of a child to have an O blood group if he has a heterozygous A blood group parent and a heterozygous B blood group parent?',
      opts: ['0%', '25%', '50%', '75%'], key: '25%' },
    { k: 'sickle-aa-aa', type: 'mcq', row: 'gen-patterns',
      q: 'Her deck, slide 23 (incomplete dominance): what would be the chance of a child to suffer from the lethal form of sickle cell anaemia (aa) if he is born from parents that are both heterozygous (Aa) for the condition?',
      opts: ['0%', '25%', '50%', '75%'], key: '25%' },
    { k: 'sickle-aa-AA', type: 'mcq', row: 'gen-patterns',
      q: 'Her deck, slide 23 (incomplete dominance): what would be the chance of a child to suffer from the lethal form of sickle cell anaemia (aa) if one parent is heterozygous (Aa) and the other not affected (AA)?',
      opts: ['0%', '25%', '50%', '75%'], key: '0%' },
  ],
};
