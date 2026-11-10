# Mizana — V1

Application mobile (Expo / React Native) pour suivre la perte de poids : pesée du dimanche, séance de sport du jour à heure fixe, rappels (eau, séance, dîner, coucher). Données stockées localement avec **AsyncStorage**. Aucun serveur, aucun compte.

## Installation

```bash
cd mizana
npm install
npx expo install --fix     # aligne les versions des paquets Expo
npx expo start
```

Scannez le QR code avec Expo Go (Android / iOS).

> Notifications : sur Android, Expo Go peut limiter les notifications depuis SDK 53. Si les rappels n'apparaissent pas, utilisez un « development build » :
> `npx expo run:android` (ou `eas build --profile development --platform android`).

## Fonctions

- **Aujourd'hui** : séance du jour, bouton « Commencer », ressenti (facile / correct / trop dur), semaine en un coup d'œil, poids, sommeil, conseil du jour.
- **Pesée** : date, poids, tour de taille ; IMC, écart depuis la dernière pesée et depuis le début, kilos restants, rythme par semaine, date estimée de l'objectif, alertes (perte trop rapide, stagnation), courbe, historique.
- **Programme** : semaine complète, niveau (1 à 4) qui monte avec les semaines et s'adapte à vos retours.
- **Séance guidée** : échauffement, effort, repos, retour au calme avec minuteur, vibration, écran maintenu allumé.
- **Homme / Femme** : choisi au démarrage (modifiable dans Réglages) ; sert aux repères du tour de taille (homme : moins de 94 cm, femme : moins de 80 cm) et au rapport taille/hauteur.
- **Réglages** : profil, rappels activables, heures par pas de 15 min, test de notification, effacement des données.

## Rappels programmés (par défaut)

| Rappel | Heure |
|---|---|
| Eau | 06:00, 09:30, 11:00, 14:30, 16:30 |
| Marche après déjeuner | 12:45 |
| Séance du jour | 18:30 |
| Dîner léger | 19:30 |
| Coucher (2 rappels) | 22:00 et 22:30 |
| Pesée (dimanche) | 07:30 |

## Structure

```
App.js                      navigation par onglets + reprogrammation des rappels
src/theme.js                couleurs
src/storage.js              AsyncStorage + réglages par défaut
src/notifications.js        rappels locaux (expo-notifications)
src/context/AppContext.js   état global + sauvegarde automatique
src/data/program.js         exercices, programme, niveau, conseils
src/utils/dates.js          dates et heures
src/utils/calc.js           IMC, écarts, rythme, estimation, alertes
src/utils/useToday.js       date du jour (mise à jour à minuit)
src/components/UI.js        composants d'interface
src/components/LineChart.js courbe sans bibliothèque
src/screens/*               écrans
```

## Pour la V2 (IA)

Le niveau est calculé dans `computeLevel()` et le plan dans `getDayPlan()` (`src/data/program.js`). La V2 pourra remplacer ces deux fonctions par un appel à un endpoint Laravel qui renvoie le plan du jour en JSON, en gardant ces fonctions comme solution de secours si l'appel échoue.

## Avertissement

Mizana donne des repères généraux, pas un avis médical. Arrêtez en cas de douleur vive et consultez un médecin en cas de maladie ou de traitement.
