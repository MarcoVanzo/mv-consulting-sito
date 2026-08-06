# Social — materiale di lavoro

Questa cartella è esclusa dal deploy: quello che c'è qui non finisce sul sito.
Ci sta il materiale dei post, mese per mese, perché le sessioni di lavoro
ripartono da un clone pulito e ciò che non è nel repository non esiste.

```
2026-09/            il blocco del mese: fonte, media, CSV pronti
modelli/            gli HTML da cui si esportano le grafiche
genera-publer.py    dal JSON dei post ai tre CSV di Publer
pubblica_facebook.py  piano B: programma i soli post Facebook via Graph API
```

La procedura per preparare un mese è il comando `/social-mese`.

## L'import in Publer, in tre righe

Publer assegna a tutti i post di un import gli account selezionati in quel
momento: per questo i CSV sono tre, uno per account.

1. *Bulk* → *Import CSV* → scegli l'account → carica `publer-<canale>.csv`.
2. Fuso orario dell'area di lavoro: **Europe/Rome**.
3. Scorri l'anteprima e conferma.

Le immagini non si caricano a mano: il CSV porta l'indirizzo del file dentro
questo repository, che GitHub serve grezzo. Vale però solo dopo che il ramo è
stato unito in `main` — prima quell'indirizzo non esiste ancora.
