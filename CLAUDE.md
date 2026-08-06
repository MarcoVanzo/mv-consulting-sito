# mv-consulting.it — istruzioni per Claude

Sito vetrina di MV Consulting S.r.l. **HTML statico + un file PHP** (`contatti.php`).
Nessun database, nessun CMS, nessuna libreria, nessun passaggio di build: i file del
repository *sono* il sito. Si modifica un file, si fa push, il workflow pubblica.

Il `README.md` resta il documento per le persone: struttura dei file, procedura di
deploy, verifiche dopo la pubblicazione. Questo file dice come lavorare nel repository.

## Regole che non si violano

- **Solo quattro domini esterni.** La `Content-Security-Policy` in `.htaccess` ammette
  Cookiebot, Google Analytics, il pixel di Meta e l'Insight Tag di LinkedIn, e blocca
  tutto il resto: niente font Google, niente CDN, nessun altro script. Se una modifica
  ne introduce uno, o si cambia la CSP consapevolmente o la risorsa viene bloccata dal
  browser.
- **I cookie non tecnici partono solo col consenso.** Il banner Cookiebot è il primo
  script di ogni pagina e blocca Google Analytics finché il visitatore non accetta.
  I due pixel sono marcati `type="text/plain" data-cookieconsent="marketing"`: restano
  inerti finché non arriva il consenso della categoria marketing, che è separata da
  quella statistica. I frammenti `<noscript>` con l'immagine, che Meta e LinkedIn
  includono nei loro snippet, sono volutamente omessi: partirebbero senza consenso.
  Aggiungendo altri strumenti vanno aggiornati la CSP, la cookie policy e il banner.
- **Nessun passaggio di build.** Niente npm, niente bundler, niente preprocessori: lo
  stile sta tutto in `assets/css/style.css`, gli script in `assets/js/main.js`.
- **Le animazioni rispettano `prefers-reduced-motion`.** Ogni nuova animazione va messa
  dentro la stessa media query delle altre.
- **Testi in italiano**, tono del sito: sobrio, in seconda persona, senza superlativi.
  Anche i messaggi di commit sono in italiano, minuscoli, con prefisso convenzionale
  (`feat:`, `fix:`, `docs:`, `chore:`).

## Dove stanno le cose

I contenuti sono direttamente in `index.html`; non esistono template né parziali. Le
schede progetto (`<article class="case">`) prendono i colori del brand dall'attributo
`style` (`--p`, `--p2`, `--p3`, `--tint`): per aggiungerne una si duplica l'articolo e
si cambiano i colori. I redirect dai vecchi indirizzi WordPress stanno in `.htaccess`.

## Come si verifica una modifica

Prima di dire che una modifica funziona:

```bash
.claude/scripts/anteprima.sh          # screenshot mobile + desktop della home
.claude/scripts/controlla.sh          # sintassi PHP, link interni, file mancanti
```

`anteprima.sh` avvia `php -S` sulla cartella e fotografa la pagina con il Chromium già
presente nell'ambiente: è l'unico modo per accorgersi di un impaginato rotto senza
avere il sito davanti. Le immagini finiscono in `.anteprima/` (fuori dal repository) e
vanno **mostrate all'utente con SendUserFile** (`display: "render"`), non solo citate.

## Pubblicazione

Il deploy parte da solo a ogni push su `main` (`.github/workflows/deploy.yml`) e alla
fine controlla che il sito online risponda 200 e serva davvero la versione nuova.

In questo ambiente **`gh` non esiste**: il workflow si lancia a mano con gli strumenti
GitHub MCP — `mcp__github__actions_run_trigger` per avviarlo, `actions_list` /
`actions_get` / `get_job_logs` per seguirlo. Il repository è `MarcoVanzo/mv-consulting-sito`.

Il deploy è un'azione visibile all'esterno: **si chiede conferma prima di lanciarlo**,
salvo che sia stata la richiesta esplicita dell'utente.

**Il sito pubblicato non si vede da qui.** La rete in uscita della sessione può avere
`www.mv-consulting.it` fuori dagli indirizzi consentiti: le richieste tornano 403 o
non partono affatto. Non è un guasto del sito e non va riferito come tale — la verifica
che conta è il passo «Controllo del sito pubblicato» dentro il workflow, che gira sui
runner di GitHub. `controlla.sh --online` se ne accorge da solo e lo dice.

## Lavorare dal telefono

Le sessioni partono spesso dall'app o dal browser del telefono, dove leggere è
faticoso e ogni richiesta di conferma è un ostacolo. Quindi:

- **Rispondi corto.** Due o tre frasi e il risultato. Niente riepiloghi lunghi, niente
  elenchi di file toccati se il commit li racconta già.
- **Fai vedere, non descrivere.** Per qualunque modifica visibile, allega lo screenshot
  con `SendUserFile`. Una foto vale più di un paragrafo su uno schermo da 6 pollici.
- **Chiedi con `AskUserQuestion`,** non con domande aperte: sul telefono si tocca
  un'opzione, non si scrive un paragrafo.
- **Porta il lavoro fino in fondo:** modifica, verifica, commit e push sul ramo di
  lavoro, senza fermarti a chiedere se puoi committare. Sul telefono l'utente non è
  davanti alla tastiera per sbloccarti.
- **Non incollare file interi** nella risposta: cita `file:riga`.
- Le sessioni remote girano in un container effimero e ripartono da un clone pulito:
  quello che non è committato è perso. Per questo la configurazione in `.claude/` sta
  nel repository.
