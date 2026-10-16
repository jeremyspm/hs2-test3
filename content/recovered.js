/* FIGURES THAT HAD NOT LOADED WHEN HIS QUIZ PAGES WERE SAVED (16 Oct 2026). His single-file saves keep a blank placeholder
   (`src=data:,`) for every picture that was still loading, so 14 of her questions shipped with a figure missing (12 of them
   text-only, on the NO_IMAGE_OK list in build.mjs). The Canvas API archive (canvas-harvest/CanvasArchive/2026/…, each quiz's
   questions.json) kept each question's ORIGINAL <img src>, which is how every one below was traced to its source.
   - `rec`: her own figure, back from that source. Each file was fetched once, read by eye, and stored in the capture's
     images folder as REC-<name>; `from` says where it came from (the live link where it still answers, else the Internet
     Archive's copy of that exact URL, with its capture date).
   - `slide`: the picture on her quiz is GONE (dead link, no archive copy, or a Canvas file in an old course), and one of
     HER OWN deck slides that shows the same thing stands in, labelled as hers. Never a picture of ours.
   - `tableFrom`: her quiz text says "They are:" and the picture of the six genotypes never loaded; the SAME question in her
     other quiz carries that table as text, and it is copied from there word for word.
   Placement: `top` (the stem opens with it, as on Canvas), `before` / `after` (exactly where Canvas had it; the anchor must
   occur exactly once in the stem), or neither (shown under the stem). `note` is the line the page shows under the figure.
   Matched by quiz + normalised stem prefix, like NO_IMAGE_OK. An entry that matches no question, a missing file or slide,
   or an anchor not found once fails the build.
   Gone for good (no copy anywhere): the vasectomy picture (Canvas file 1196499 of the 2019 course, now behind a login), the
   NIHL "study the images" figure (slideplayer), the eye-defects collage (my-iclinic, 404), the mitochondrial pedigree
   (memorang CDN), and 5 of the 9 Leeds micrographs. */
const REC = '🖼 Her picture, restored from its source: it had not loaded when this quiz was saved.';
export const RECOVERED = [
  { quiz: '210994', k: '13 in a female which of the following structures houses the oocytes',
    rec: ['REC-leeds-primary-follicle.jpg', 'REC-leeds-secondary-follicle.jpg', 'REC-leeds-graafian-follicle.jpg', 'REC-leeds-corpus-luteum.gif'],
    from: 'histology.leeds.ac.uk/female/assets/{primary_follicle,second_fol,graf_fol}.jpg + corpus-luteum.gif, Internet Archive copies (Jul 2024 – Dec 2025)',
    note: '🖼 4 of the 9 micrographs on her quiz, restored from the Leeds histology site (the other 5 are gone).' },
  { quiz: '211120', k: 'erection is a process', rec: ['REC-erect-penis-cross-section.gif'], after: 'can be identified.</p>',
    from: 'd2m3czf6fvb8bh.cloudfront.net/…/men/penis_crosssection_erect.gif, Internet Archive copy (8 Nov 2022)', note: REC },
  { quiz: '211120', k: 'complete the sentences using the appropriate items from the drop box', rec: ['REC-fertilisation-leeds.gif'], after: 'from the drop box.</strong></p>',
    from: 'histology.leeds.ac.uk/female/assets/fertil.gif, Internet Archive copy (10 Feb 2026)', note: REC },
  { quiz: '211120', k: 'some congenital conditions can be linked', rec: ['REC-edwards-syndrome.jpg'], before: '<strong>Edwards syndrome</strong>',
    from: 'chicagotribune.com resizer …ct-parents-of-infant-with-edwards-syndrome-20160716, Internet Archive copy (29 Jun 2021)', note: REC },
  { quiz: '211120', k: 'use the examples to help you to match the terms', rec: ['REC-flowers-dominance.jpg'],
    after: 'codominant-traits-people" target="_blank" rel="noopener"></a></p>',
    from: 'genetics.thetech.org/sites/default/files/FlowersDRIDC.jpg, Internet Archive copy (28 Jan 2022)', note: REC },
  { quiz: '211120', k: 'mix and match a b o blood types', rec: ['REC-abo-genotype-table.jpg'],
    from: 'genetics.thetech.org/sites/default/files/ATtable1BloodType.jpg, Internet Archive copy (11 Dec 2017)', note: REC },
  { quiz: '211120', k: 'use the information in the charts above', rec: ['REC-autosomal-dominant-pedigree.png'], before: '<p><a href="https://commons.wikimedia.org',
    from: 'Wikimedia Commons, File:Autosomal_Dominant_Pedigree_Chart.svg (960 px render), live', note: REC },
  { quiz: '211120', k: 'sound vibrations hit the tympanic membrane', rec: ['REC-sound-waves-ear.gif'], top: true,
    from: 'cdn.britannica.com/99/14299-004-D2B5BCF9/Sound-waves-mechanism-hearing-ear-canal-membrane.jpg, Internet Archive copy (27 May 2025)', note: REC },
  { quiz: '211121', k: 'fill the spaces using words from the drop down menu the lens in the eye', rec: ['REC-inverted-image-lens.jpg'], top: true,
    from: 'i.stack.imgur.com/cX9dc.jpg, live', note: REC },
  /* her organ of Corti and tonotopic-map figures sat in a text-only panel above questions 9-13 of this quiz; a panel is not a
     question, so they never shipped. Each goes with the question it illustrates. */
  { quiz: '211022', k: 'transduction of mechanical sound waves', rec: ['HS2DATA-5f235790fe30a59e.png'],
    from: 'her panel above questions 9-13 (in the capture all along)', note: '🖼 Her figure from the panel above these questions on Canvas.' },
  { quiz: '211022', k: 'sounds with low frequencies', rec: ['HS2DATA-61d6764eae1ca6bb.png'],
    from: 'her panel above questions 9-13 (in the capture all along)', note: '🖼 Her figure from the panel above these questions on Canvas.' },
  /* gone: her own slide stands in */
  { quiz: '211071', k: 'in the diagram the place where a vasectomy', slide: ['2026-Male-Repro-3', 8], top: true,
    note: '📖 Her slide (Male Repro, slide 8). The lettered picture on her quiz is gone, so the letters A–E are not on it: each letter’s part is described in its own sentence.' },
  { quiz: '211120', k: 'mitochondria are cell organelles', slide: ['2026-BN2-Intro-to-genetics', 39], after: 'affected by the faulty mtDNA.</p>',
    note: '📖 Her slide (Intro to Genetics, slide 39). The pedigree chart on her quiz is gone; the family in the question is the one it showed.' },
  { quiz: '211120', k: 'study the images and choose the correct answer noise induced hearing loss', slide: ['2026-Hearing-Equilibrium', 6],
    note: '📖 Her slide (Hearing & Equilibrium, slide 6). The images on her quiz are gone, so this stands in for them.' },
  { quiz: '211121', k: 'mix and match the conditions with the cause of the defect', slide: [['2026-LIGHT-AND-SEEING', 14], ['2026-LIGHT-AND-SEEING', 16]],
    note: '📖 Her slides (Light & Seeing, slides 14 and 16). The picture on her quiz is gone, so these stand in for it.' },
  /* gone, but her own words for it are in her other quiz */
  { quiz: '211091', k: 'blood types are inherited by different combinations', tableFrom: '211041', after: 'six different genetic combinations. They are:</p>',
    note: '📋 Her table from the same question in her Genotypes & Phenotypes quiz: the picture here never loaded.' },
];
