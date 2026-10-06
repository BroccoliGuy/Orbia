# Orbia

Orbia est un globe 3D pour parcourir le relief de la Terre, de jour comme de nuit.

## Lancer

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) ouvre l’explorateur.

`npm test` vérifie la recherche et les fiches océan, fleuve et lac.

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
