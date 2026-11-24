// Catalogue des exercices du soir : pompes et planche, avec leurs variantes.
// L'IA choisit parmi ces identifiants.
// motion : animation de l'illustration (updown = répétitions, hold = position tenue)
export const EXERCISES = {
  pushupKnee: {
    name: 'Pompes sur les genoux', icon: 'dumbbell', motion: 'updown', lvl: 1, muscles: 'Poitrine, bras, épaules',
    hint: 'Mains un peu plus larges que les épaules, corps droit des genoux à la tête.',
    steps: [
      'Mains au sol, plus larges que les épaules, genoux au sol.',
      'Descendez la poitrine vers le sol en gardant le dos droit.',
      'Poussez pour remonter en expirant.',
    ],
    mistake: 'Ne laissez pas les fesses monter ni le ventre tomber.',
  },
  pushup: {
    name: 'Pompes', icon: 'dumbbell', motion: 'updown', lvl: 2, muscles: 'Poitrine, bras, épaules',
    hint: 'Corps bien droit. Si c’est trop dur, passez sur les genoux sans vous arrêter.',
    steps: [
      'Position de planche haute, mains sous les épaules.',
      'Descendez en gardant le corps en ligne, coudes à 45°.',
      'Poussez jusqu’à tendre les bras.',
    ],
    mistake: 'Les coudes ne partent pas largement sur les côtés.',
  },
  pushupWide: {
    name: 'Pompes mains écartées', icon: 'dumbbell', motion: 'updown', lvl: 2, muscles: 'Poitrine, épaules',
    hint: 'Mains bien plus larges que les épaules : la poitrine travaille davantage.',
    steps: [
      'Position de planche haute, mains à environ une fois et demie la largeur des épaules.',
      'Descendez la poitrine vers le sol, corps bien aligné.',
      'Poussez jusqu’à tendre les bras, sans cambrer le dos.',
    ],
    mistake: 'Regardez le sol : ne descendez pas en avançant la tête.',
  },
  pushupDiamond: {
    name: 'Pompes diamant', icon: 'dumbbell', motion: 'updown', lvl: 3, muscles: 'Triceps, poitrine',
    hint: 'Mains rapprochées sous la poitrine, pouces et index qui se touchent.',
    steps: [
      'Position de planche haute, mains rapprochées pour former un losange.',
      'Descendez en gardant les coudes près du corps.',
      'Poussez pour remonter en expirant.',
    ],
    mistake: 'Si c’est trop dur, passez sur les genoux plutôt que de cambrer le dos.',
  },
  plankKnee: {
    name: 'Planche sur les genoux', icon: 'minus', motion: 'hold', lvl: 1, muscles: 'Ventre, dos, épaules',
    hint: 'Avant-bras au sol, genoux au sol, corps aligné des genoux à la tête.',
    steps: [
      'Coudes sous les épaules, avant-bras au sol, genoux au sol.',
      'Alignez épaules, hanches et genoux.',
      'Serrez le ventre et les fessiers, respirez normalement.',
    ],
    mistake: 'Ne laissez pas le bassin descendre ni monter trop haut.',
  },
  plank: {
    name: 'Planche', icon: 'minus', motion: 'hold', lvl: 2, muscles: 'Ventre, dos, épaules',
    hint: 'Sur les avant-bras, corps aligné de la tête aux talons, ventre serré.',
    steps: [
      'Coudes sous les épaules, avant-bras au sol.',
      'Corps bien droit de la tête aux talons.',
      'Serrez ventre et fessiers, respirez normalement.',
    ],
    mistake: 'Ne laissez pas le bassin descendre ni monter trop haut.',
  },
  sidePlank: {
    name: 'Planche latérale', icon: 'minus', motion: 'hold', lvl: 3, muscles: 'Obliques, épaules',
    hint: 'Sur un avant-bras, hanches hautes, corps en ligne. Changez de côté à mi-temps.',
    steps: [
      'Allongé sur le côté, coude sous l’épaule.',
      'Soulevez les hanches pour former une ligne droite.',
      'Tenez en respirant calmement, changez de côté à la moitié du temps.',
    ],
    mistake: 'Les hanches ne doivent pas s’affaisser vers le sol.',
  },
};