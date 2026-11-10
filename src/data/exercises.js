// Catalogue d'exercices : l'IA choisit parmi ces identifiants.
// motion : animation de l'illustration (updown, jump, side, hold, rotate)
export const EXERCISES = {
  squat: {
    name: 'Squats', icon: 'male', motion: 'updown', lvl: 1, muscles: 'Cuisses, fessiers',
    hint: 'Descendez comme pour vous asseoir sur une chaise, dos droit, puis remontez.',
    steps: [
      'Pieds écartés comme les épaules, pointes légèrement ouvertes.',
      'Poussez les fesses en arrière et descendez jusqu’à ce que les cuisses soient presque parallèles au sol.',
      'Poussez dans les talons pour remonter. Inspirez en descendant, expirez en montant.',
    ],
    mistake: 'Les genoux ne doivent pas rentrer vers l’intérieur ni le dos s’arrondir.',
  },
  sumoSquat: {
    name: 'Squat sumo', icon: 'male', motion: 'updown', lvl: 1, muscles: 'Intérieur des cuisses, fessiers',
    hint: 'Pieds très écartés, pointes vers l’extérieur, descendez bien droit.',
    steps: [
      'Écartez les pieds au double de la largeur des épaules, pointes vers l’extérieur.',
      'Descendez verticalement, genoux dans l’axe des pieds.',
      'Serrez les fessiers en remontant.',
    ],
    mistake: 'Ne penchez pas le buste vers l’avant.',
  },
  lunge: {
    name: 'Fentes alternées', icon: 'walking', motion: 'updown', lvl: 1, muscles: 'Cuisses, fessiers, équilibre',
    hint: 'Un grand pas en avant, genou arrière vers le sol, puis changez de jambe.',
    steps: [
      'Debout, faites un grand pas en avant.',
      'Descendez jusqu’à ce que les deux genoux soient à environ 90°.',
      'Poussez sur la jambe avant pour revenir, puis changez de jambe.',
    ],
    mistake: 'Le genou avant ne dépasse pas la pointe du pied et le buste reste droit.',
  },
  sideLunge: {
    name: 'Fentes latérales', icon: 'arrows-alt-h', motion: 'side', lvl: 2, muscles: 'Cuisses, fessiers, hanches',
    hint: 'Grand pas sur le côté, fléchissez une jambe, l’autre reste tendue.',
    steps: [
      'Faites un grand pas sur le côté.',
      'Poussez les fesses en arrière en fléchissant la jambe du pas.',
      'Revenez au centre en poussant dans le pied, puis changez de côté.',
    ],
    mistake: 'Gardez les deux pieds à plat et les pointes vers l’avant.',
  },
  bridge: {
    name: 'Pont fessier', icon: 'angle-double-up', motion: 'updown', lvl: 1, muscles: 'Fessiers, bas du dos',
    hint: 'Allongé, genoux pliés. Montez le bassin en serrant les fessiers.',
    steps: [
      'Allongé sur le dos, genoux pliés, pieds à plat près des fesses.',
      'Montez le bassin jusqu’à aligner épaules, hanches et genoux.',
      'Serrez les fessiers 1 seconde en haut, puis descendez doucement.',
    ],
    mistake: 'Ne cambrez pas le bas du dos : la poussée vient des fessiers.',
  },
  plank: {
    name: 'Planche', icon: 'minus', motion: 'hold', lvl: 1, muscles: 'Ventre, dos, épaules',
    hint: 'Sur les avant-bras (ou les genoux), corps aligné, ventre serré.',
    steps: [
      'Coudes sous les épaules, avant-bras au sol.',
      'Corps bien droit de la tête aux talons (ou aux genoux si trop dur).',
      'Serrez ventre et fessiers, respirez normalement.',
    ],
    mistake: 'Ne laissez pas le bassin descendre ni monter trop haut.',
  },
  sidePlank: {
    name: 'Planche latérale', icon: 'minus', motion: 'hold', lvl: 2, muscles: 'Obliques, épaules',
    hint: 'Sur un avant-bras, hanches hautes, corps en ligne. Changez de côté à mi-temps.',
    steps: [
      'Allongé sur le côté, coude sous l’épaule.',
      'Soulevez les hanches pour former une ligne droite.',
      'Tenez en respirant calmement, changez de côté à la moitié du temps.',
    ],
    mistake: 'Les hanches ne doivent pas s’affaisser vers le sol.',
  },
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
  tricepsDip: {
    name: 'Dips sur chaise', icon: 'dumbbell', motion: 'updown', lvl: 2, muscles: 'Triceps, épaules',
    hint: 'Mains sur le bord d’une chaise stable, fléchissez les coudes vers l’arrière.',
    steps: [
      'Mains sur le bord d’une chaise solide, jambes en avant.',
      'Fléchissez les coudes pour descendre les fesses près de la chaise.',
      'Poussez avec les bras pour remonter.',
    ],
    mistake: 'Les épaules restent basses, loin des oreilles.',
  },
  kneeraise: {
    name: 'Montées de genoux', icon: 'running', motion: 'jump', lvl: 1, muscles: 'Cardio, cuisses',
    hint: 'Sur place, genoux à hauteur de hanche, bras qui balancent.',
    steps: [
      'Debout, dos droit.',
      'Montez un genou vers la hanche, puis l’autre, en rythme régulier.',
      'Balancez les bras comme en courant.',
    ],
    mistake: 'Ne vous penchez pas en arrière.',
  },
  jacks: {
    name: 'Jumping jacks', icon: 'running', motion: 'jump', lvl: 1, muscles: 'Cardio, corps entier',
    hint: 'Sautez en écartant jambes et bras, puis revenez. Réceptions douces.',
    steps: [
      'Debout, pieds joints, bras le long du corps.',
      'Sautez en écartant jambes et en levant les bras.',
      'Revenez en position de départ, réception sur la pointe des pieds.',
    ],
    mistake: 'Évitez de faire claquer les talons : amortissez.',
  },
  climbers: {
    name: 'Mountain climbers', icon: 'bolt', motion: 'side', lvl: 2, muscles: 'Cardio, ventre, épaules',
    hint: 'En position de pompe, ramenez les genoux vers la poitrine l’un après l’autre.',
    steps: [
      'Position de planche haute, mains sous les épaules.',
      'Ramenez un genou vers la poitrine, puis changez rapidement.',
      'Gardez les hanches basses et le ventre serré.',
    ],
    mistake: 'Ne montez pas les fesses en l’air.',
  },
  legraise: {
    name: 'Relevés de jambes', icon: 'angle-double-up', motion: 'updown', lvl: 2, muscles: 'Bas du ventre',
    hint: 'Allongé, mains sous les fesses. Montez les jambes tendues, redescendez sans toucher.',
    steps: [
      'Allongé sur le dos, mains sous les fesses, bas du dos collé au sol.',
      'Montez les jambes tendues jusqu’à la verticale.',
      'Redescendez lentement sans toucher le sol.',
    ],
    mistake: 'Si le bas du dos se décolle, fléchissez un peu les genoux.',
  },
  crunch: {
    name: 'Crunch', icon: 'angle-double-up', motion: 'updown', lvl: 1, muscles: 'Ventre',
    hint: 'Allongé, genoux pliés. Décollez les épaules en expirant.',
    steps: [
      'Allongé sur le dos, genoux pliés, mains près des tempes.',
      'Décollez les épaules du sol en expirant, menton éloigné de la poitrine.',
      'Redescendez lentement.',
    ],
    mistake: 'Ne tirez pas sur la nuque avec les mains.',
  },
  bicycle: {
    name: 'Crunch vélo', icon: 'sync-alt', motion: 'rotate', lvl: 2, muscles: 'Ventre, obliques',
    hint: 'Coude vers le genou opposé, en alternant, comme un pédalage.',
    steps: [
      'Allongé, mains aux tempes, jambes en l’air.',
      'Amenez le coude droit vers le genou gauche, jambe droite tendue.',
      'Alternez en rythme contrôlé.',
    ],
    mistake: 'Tournez le buste, pas seulement les coudes.',
  },
  skater: {
    name: 'Patineur', icon: 'running', motion: 'side', lvl: 2, muscles: 'Cuisses, fessiers, cardio',
    hint: 'Bondissez d’un pied sur l’autre sur le côté, comme un patineur.',
    steps: [
      'Penchez légèrement le buste, genoux fléchis.',
      'Bondissez sur le côté et recevez-vous sur une jambe.',
      'Ramenez l’autre jambe derrière sans toucher le sol, puis alternez.',
    ],
    mistake: 'Réception souple : genou fléchi, pas verrouillé.',
  },
  superman: {
    name: 'Superman', icon: 'spa', motion: 'hold', lvl: 1, muscles: 'Bas du dos, fessiers',
    hint: 'Sur le ventre, soulevez bras et jambes en même temps.',
    steps: [
      'Allongé sur le ventre, bras tendus devant.',
      'Soulevez bras, poitrine et jambes de quelques centimètres.',
      'Tenez 2 secondes, relâchez doucement.',
    ],
    mistake: 'Regardez le sol pour garder la nuque alignée.',
  },
  wallsit: {
    name: 'Chaise contre le mur', icon: 'male', motion: 'hold', lvl: 2, muscles: 'Cuisses',
    hint: 'Dos au mur, cuisses à l’horizontale, tenez la position.',
    steps: [
      'Dos collé au mur, pieds avancés.',
      'Glissez jusqu’à avoir les genoux à 90°.',
      'Tenez, poids sur les talons, respirez.',
    ],
    mistake: 'Les genoux restent au-dessus des chevilles.',
  },
  burpee: {
    name: 'Burpee allégé', icon: 'fire', motion: 'jump', lvl: 3, muscles: 'Corps entier, cardio',
    hint: 'Mains au sol, pieds en arrière, retour, puis relevez-vous (sans saut au début).',
    steps: [
      'Accroupi, posez les mains au sol.',
      'Reculez les pieds en planche haute.',
      'Ramenez les pieds, puis relevez-vous en levant les bras.',
    ],
    mistake: 'Gardez le dos droit en planche.',
  },
};