---
description: Porta le modifiche su main e pubblica il sito, seguendo il deploy fino alla fine
---

Pubblicazione del sito. In ordine:

1. `.claude/scripts/controlla.sh` — se fallisce, fermati e riferisci.
2. Se ci sono modifiche non committate, committale con un messaggio in italiano e
   spingile sul ramo di lavoro corrente.
3. Riepiloga in due righe che cosa sta per andare online e **chiedi conferma con
   `AskUserQuestion`** (pubblicare adesso / non ancora), a meno che l'utente non abbia
   già detto esplicitamente di pubblicare.
4. Porta le modifiche su `main`: se sei su un ramo di lavoro, apri la pull request con
   `mcp__github__create_pull_request` e, dopo il via libera, uniscila con
   `mcp__github__merge_pull_request`. Il push su `main` avvia il deploy da solo.
5. Segui il workflow "Deploy su Aruba" con `mcp__github__actions_list` e `actions_get`;
   se fallisce, leggi i log con `get_job_logs` e riferisci l'errore vero, non "il deploy
   è fallito".
6. A deploy riuscito lancia `.claude/scripts/controlla.sh --online` e chiudi con l'esito.
   Se dice che il sito non è raggiungibile da questa sessione, va bene così: riporta il
   risultato del passo «Controllo del sito pubblicato» del workflow e dì chiaramente
   che cosa resta non verificato, senza dare per riuscito quello che non hai visto.

`gh` non esiste in questo ambiente: usa gli strumenti GitHub MCP. Non attivare mai
l'opzione `pulizia_totale` di tua iniziativa: cancella la cartella remota.
