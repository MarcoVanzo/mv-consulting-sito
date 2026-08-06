---
description: Prepara il pacchetto social del mese e i CSV da importare in Publer
argument-hint: "[AAAA-MM]"
---

Preparazione del blocco social di un mese. Il mese è `$ARGUMENTS`; se manca, è il mese
successivo a quello corrente.

Il senso di questa procedura: **Marco deve solo fare tre import in Publer**, dieci
minuti in tutto. Tutto il resto — testi, grafiche, calendario, alt text, commenti — si
prepara qui. Se una scelta richiede una sua decisione, chiedila con `AskUserQuestion`
in un colpo solo alla fine, non una per volta.

## Com'è fatto il pacchetto

Tutto sta in `tools/social/<AAAA-MM>/`, che il deploy esclude: non finisce sul sito.

- `blocco-1-post.json` — la fonte. Un oggetto per post, con i campi che usa il
  generatore: `id`, `canale`, `data`, `ora`, `testo`, `cta`, `hashtag`, `link_utm`,
  `media_richiesto`, `alt_text`, `primo_commento`, più i campi di strategia
  (`pillar`, `asset_padre`, `obiettivo`, `kpi`) che servono a te, non a Publer.
- `media/` — le immagini e i PDF già esportati.
- `publer-*.csv` — i tre file da importare, uno per account.

I modelli delle grafiche stanno in `tools/social/modelli/`: sono HTML più `base.css`,
si fotografano con Chromium headless come fa `.claude/scripts/anteprima.sh`. Le
dimensioni: 1200x1200 per il quadrato di LinkedIn, 1080x1350 per Facebook, 1128x191
per la copertina.

## I vincoli del calendario

- **Un post al giorno**, da lunedì a sabato. La domenica no.
- Profilo personale alle 08:15, pagina alle 09:15, Facebook alle 18:30 (10:00 il sabato).
- I post del **profilo personale non portano link**: il link abbassa la distribuzione e
  quel canale serve a farsi leggere. I link stanno sulla pagina, nel primo commento.
- Ogni `utm_content` è l'id del post: è così che si legge nei log del server chi ha
  portato le visite.
- **Zero minuti richiesti a Marco** per produrre materiale. Se un post ha bisogno di
  una foto che solo lui può scattare, quel post va riscritto.

## Come si genera

```
python3 tools/social/genera-publer.py tools/social/<AAAA-MM>
```

Lo script scrive i tre CSV nel formato a dodici colonne di Publer, mette nel campo
`Media URL` l'indirizzo grezzo del file su GitHub e si ferma se un media dichiarato nel
JSON non esiste su disco. Con `--ramo <nome>` punta a un ramo diverso da `main`.

Il file per canale non è un vezzo: l'import di Publer assegna tutti i post del CSV agli
account selezionati in quel momento, quindi tre account vogliono tre file.

## Prima di consegnare

1. Rileggi i CSV: date tutte nel futuro, nessun buco nel calendario, nessuna domenica.
2. Verifica che le immagini siano davvero nel repository e con il nome giusto — dopo il
   merge, Publer le scarica da `raw.githubusercontent.com`: un nome sbagliato è un post
   senza immagine.
3. Committa su un ramo di lavoro e apri la pull request. **Le immagini vanno su `main`
   prima dell'import**, altrimenti l'URL non esiste ancora.
4. Consegna a Marco: quali post, in che giorni, e le tre righe di istruzioni per
   l'import. Niente riepiloghi lunghi.

## Cosa non fare

- Non programmare i post dal browser un clic alla volta: è stato provato, sono ore.
- Non aggiungere pixel o script al sito per misurare i social: si misura con gli
  `utm_content` nei log, con il modulo contatti e con le statistiche native.
- Non usare `tools/social/pubblica_facebook.py` se Publer copre già Facebook: resta lì
  come piano B, e richiede un token della pagina.
