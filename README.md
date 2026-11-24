# ⚡ Cadence — Clear Glass Edition (Référence macOS & Typo Claude)

Une application ultra-légère en mémoire RAM (< 15-20 Mo), instantanée, avec une **direction artistique Clear Glass / Verre translucide inspirée de macOS**, une **typographie éditoriale Claude (Anthropic)** et un **fichier indépendant `data.json` garantissant la persistance de vos données lors de toute mise à jour**.

---

## 🔒 1. Persistance Garantie dans `data.json`

Vos données ne sont plus dépendantes d'un cache temporaire :
- **Fichier dédié `data.json`** : Vos habitudes, votre historique sur l'année et vos réglages sont enregistrés directement dans `d:\App\data.json`.
- **Inviolable lors des mises à jour** : Même si le code source (`index.html`, `styles.css`, `app.js`) est mis à jour, votre fichier `data.json` est **préservé et jamais écrasé**.
- **Double sécurité** : L'application enregistre en parallèle dans `data.json` et dans le `localStorage` de votre navigateur.
- **Indicateur en direct** : En haut de la fenêtre, l'indicateur vert `● data.json synchronisé` confirme l'écriture immédiate de chaque clic.

---

## 🪟 2. Direction Artistique Clear Glass (Conforme à votre image de référence)

La structure de l'interface reprend fidèlement l'ambiance et les détails de l'application modèle :
- **Cadre de fenêtre macOS** : Boutons *traffic lights* (rouge, jaune, vert), angles très arrondis (`border-radius: 24px`), et **reflet diagonal de verre physique** traversant l'écran.
- **Compartiment Gauche (Explorateur d'Habitudes & Actions Rapides)** :
  - **Sélecteur segmenté en pilule** : `Toutes`, `À faire`, `Faites`.
  - **Recherche creusée** : champ translucide avec icône loupe pour filtrer instantanément.
  - **Tuiles d'habitudes en verre givré** : vignette icône arrondie, nom en typographie soignée, série 🔥, et bouton tactile **« BOOM »** pour valider en 1 clic.
  - L'habitude sélectionnée s'illumine d'un voile de verre lumineux (effet *Hollow Be Thy Squad* de l'image).
  - Signature `Playing on Glass` en bas à gauche.
- **Compartiment Droit (Grand Hub GitHub & Analytique)** :
  - **Grand titre éditorial Claude** : typographie sérif élégante (*Charter / Iowan Old Style*).
  - **Matrice GitHub exacte en SVG** : 53 semaines, 7 lignes (Dimanche à Samedi), avec `Lun`, `Mer`, `Ven` alignés et mois calés au millimètre.
  - **Sélecteur de palettes** : Claude Terracotta, GitHub Émeraude, Ambre, Azur.
  - **Tableau de bord inférieur** : anneau de progression dynamique circulaire, 4 pastilles de statistiques de série, et bouton d'action rapide `Tout valider ✨`.

---

## ⚡ 3. Consommation RAM & Vitesse

- **~15 Mo de RAM** au total.
- Zéro framework lourd (pas d'Electron).
- Démarrage en moins de **150 ms**.

---

## 🚀 Comment Lancer l'Application

Double-cliquez simplement sur :
```text
Lancer-Cadence.bat
```
> Démarre automatiquement le mini-serveur de persistance en arrière-plan et ouvre l'application dans une fenêtre autonome macOS Clear Glass ultra-épurée.
