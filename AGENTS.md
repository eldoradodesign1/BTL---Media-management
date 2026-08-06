# Consignes de développement & Règles d'UI du projet

## Interdiction des Webtoolkits / Widgets Natifs Navgateurs
Ne JAMAIS utiliser ni afficher de composants natifs du navigateur bruts :
- **Scrollbars** : Utiliser exclusivement la scrollbar personnalisée définie dans `src/index.css` (`::-webkit-scrollbar`, `scrollbar-width: thin`).
- **Inputs Chiffres / Numbers** : Les flèches de variation de valeur (`spin-button`) sont strictement masquées via CSS (`appearance: textfield`).
- **Inputs Date & Time** : Les sélecteurs de calendrier natifs doivent être surchargés ou remplacés par des composants sur-mesure stylisés.
- **Sliders / Ranges** : Utiliser la piste et le curseur personnalisés (`::-webkit-slider-thumb`, `::-webkit-slider-runnable-track`).

## Synchronisation Supabase & Utilisateurs
- Tous les utilisateurs affichés dans l'application doivent provenir exclusivement de la table `users` de Supabase.
- Ne pas utiliser de listes fictives / statiques d'utilisateurs (`mockData`).

## Pricing & Clients
- La grille tarifaire doit obligatoirement afficher les tarifs catalogue et négociés pour tous les médias et clients rattachés dans la base.
