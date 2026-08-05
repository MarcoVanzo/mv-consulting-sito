---
description: Screenshot del sito in locale, mostrati subito nella chat
argument-hint: "[pagina] [--intera]"
allowed-tools: Bash(.claude/scripts/anteprima.sh:*), SendUserFile
---

Esegui `.claude/scripts/anteprima.sh $ARGUMENTS` (senza argomenti fotografa la home,
telefono e schermo grande).

Poi passa **tutte** le immagini prodotte a `SendUserFile` con `display: "render"` e una
didascalia di una riga. Se qualcosa nell'impaginato è visibilmente rotto, dillo in una
frase; altrimenti non commentare le immagini: si vedono da sole.
