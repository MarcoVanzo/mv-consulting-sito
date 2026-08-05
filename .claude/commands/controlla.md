---
description: Verifica il repository (PHP, link, CSP) e, con --online, il sito pubblicato
argument-hint: "[--online]"
allowed-tools: Bash(.claude/scripts/controlla.sh:*)
---

Esegui `.claude/scripts/controlla.sh $ARGUMENTS`.

Riporta solo l'esito: se è tutto a posto bastano poche parole, se ci sono problemi
elencali con il file e la riga, e proponi la correzione senza applicarla di tua
iniziativa se tocca i contenuti.
