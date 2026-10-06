# Orbia

Globe terrestre. Chercher un lieu, l’ouvrir, lire le relief.

## Lancer

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) ouvre l’explorateur.

`npm test` vérifie la recherche et les fiches océan, fleuve et lac.

## Explorer

La recherche, en haut à gauche, trouve un relief, un océan, un lac ou un fleuve. Choisir un résultat vole jusqu’au lieu sans changer le niveau de zoom.

Un clic sur le globe pose une fiche : nom, genre, altitude. Un océan s’affiche sur une seule ligne, par exemple « Océan Pacifique ». Un fleuve ou un lac garde son nom et son genre.

Le curseur **Relief**, en bas à droite, passe de Plat à Réel puis à Exagéré. Le curseur **Horizon** incline la vue de près, pour lire les pentes. Sur un petit écran les deux restent dans le coin. Un doigt fait tourner le globe. Deux doigts le rapprochent ou l’éloignent, avec la même douceur que la molette. La page ne défile pas sous le doigt.

Plus près qu’un pays, un morceau plus fin de NASA GIBS se pose sur la photo 8K, de jour et de nuit. Si l’image n’arrive pas, ou si la projection est plate, la photo 8K reste seule. Le relief ne change pas.

La touche Espace passe en cinéma. La croix blanche, en haut à droite, en sort.

## Raccourcis

| Touche | Action |
| --- | --- |
| T | Relief |
| I | Horizon |
| H | Survol |
| R | Réinitialiser |
| F | Plein écran |
| Espace | Mode cinéma |
| Échap | Fermer |

## Pile

Next.js, React, React Three Fiber, Three.js, Drei, Zustand, Tailwind CSS. Les contours des pays viennent de d3-geo et de TopoJSON.

## Crédits

- Jour : NASA Visible Earth, Blue Marble, 8192×4096. [Whole world - land and oceans](https://commons.wikimedia.org/wiki/File:Whole_world_-_land_and_oceans.jpg). Domaine public, NASA.
- Nuit : NASA Black Marble 2016, ramené à 8192×4096. [BlackMarble_2016_3km.jpg](https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_3km.jpg). Domaine public, NASA.
- Zoom proche : NASA GIBS, Blue Marble Next Generation et VIIRS Black Marble, sans clé.
- Relief : élévation NASA. Bathymétrie GEBCO / NASA Earth Observatory.
- Pays : Natural Earth 110 m, via world-atlas.
- Nuages : shader procédural, sans texture externe.

Le détail des fichiers est dans `public/textures/SOURCES.txt`.
