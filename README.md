# mv-consulting.it

Sito vetrina di MV Consulting S.r.l. **HTML statico + un file PHP**
per il modulo di contatto: nessun database, nessun CMS, nessuna dipendenza esterna.

Sostituisce il precedente sito WordPress (tema `marcovanzo`, Contact Form 7).

## Struttura

```
index.html              home, pagina unica con ancore (#aree #progetti #insegniamo #studio #domande #contatti)
privacy-policy.html     informativa, testo ripreso integralmente dal sito precedente
404.html                pagina di errore
contatti.php            ricezione del modulo, invia via mail() a info@mv-consulting.it
                        (campo esca contro i robot, cinque invii l'ora per indirizzo)
.htaccess               HTTPS, redirect dai vecchi indirizzi, cache, intestazioni di sicurezza
robots.txt sitemap.xml  indicizzazione
assets/css/style.css    tutto lo stile
assets/js/main.js       animazione della hero, menu del telefono, rivelazioni allo scroll,
                        provenienza della visita, avvio degli strumenti su consenso,
                        invio del modulo
assets/js/consenso.js   riapertura del banner Cookiebot (serve anche alle pagine interne)
assets/img/             logo (SVG), ritratto (JPG + WebP), og.jpg per le condivisioni
tools/                  materiale di lavoro: modelli delle grafiche, immagini già
                        esportate per i post, marchi originali — non viene pubblicato
favicon.svg .ico apple-touch-icon.png
```

`tools/` sta nel repository ma resta fuori dal server: il deploy lo esclude. Sono file
che servono a chi pubblica i post, non a chi visita il sito, e online sarebbero solo
pagine e immagini raggiungibili da chiunque.

Quello che va davvero online pesa circa 250 KB, la pagina in sé un centinaio. Nessun
font esterno, nessuna libreria: si apre completa alla prima richiesta.

## Modificare i contenuti

I testi stanno direttamente in `index.html`. Le tre schede progetto ereditano i colori
del rispettivo brand dall'attributo `style` dell'elemento `<article class="case">`:

```html
<article class="case" style="--p:#C9A84C; --p2:#ED028C; --p3:#003063; --tint:rgba(201,168,76,.10)">
```

`--p` è il colore che compare su numero, etichette e grafico; `--tint` è l'alone di
sfondo della fascia. Per aggiungere un progetto basta duplicare un `<article>` e
cambiare i colori.

## Pubblicazione

Il deploy gira su **GitHub Actions** (`.github/workflows/deploy.yml`) e carica via FTP
sull'hosting Aruba, che supporta PHP: `contatti.php` funziona senza configurazione.
Ogni push su `main` pubblica; il workflow si può anche lanciare a mano.

Il repository è **pubblico** di proposito: contiene solo il sito, che è già pubblico, e
sui repo pubblici i minuti di Actions non si consumano — quelli del piano sono già
impegnati dagli altri progetti.

### Configurazione, una volta sola

Segreti da impostare in *Settings → Secrets and variables → Actions*, oppure da
terminale:

```bash
gh secret set FTP_SERVER   --repo MarcoVanzo/mv-consulting-sito
gh secret set FTP_USERNAME --repo MarcoVanzo/mv-consulting-sito
gh secret set FTP_PASSWORD --repo MarcoVanzo/mv-consulting-sito
```

Se la cartella pubblica su Aruba non è la radice della connessione FTP ma `/www`,
aggiungere anche la variabile (non segreta) `FTP_DIR` con valore `/www/`.

### Prima del primo deploy

1. **Backup**: scaricare una copia completa della cartella pubblica attuale (WordPress)
   ed esportare il database dal pannello Aruba. È l'unico modo per tornare indietro.
2. Verificare che `info@mv-consulting.it` sia **presidiata**: è l'unico recapito del sito.
   Ci arrivano i messaggi del modulo di contatto ed è anche la casella da cui partono
   (`DESTINATARIO` e `MITTENTE` in `contatti.php` sono lo stesso indirizzo: Aruba rifiuta
   le mail con mittente esterno al dominio, e un `no-reply@` che non esiste le farebbe
   scartare in silenzio). È inoltre l'indirizzo indicato nell'informativa per l'esercizio
   dei diritti degli interessati — dove i termini di risposta corrono comunque, anche se
   nessuno apre la casella.

### Deploy

```bash
gh workflow run "Deploy su Aruba" --repo MarcoVanzo/mv-consulting-sito
gh run watch --repo MarcoVanzo/mv-consulting-sito
```

Il workflow, alla fine, controlla da solo che `https://www.mv-consulting.it/` risponda
200 e serva davvero il sito nuovo; se così non è, fallisce con l'errore esplicito.

I file WordPress non vengono rimossi: restano sul server sotto il sito nuovo, che ha
comunque la precedenza grazie a `DirectoryIndex index.html index.php` nel `.htaccess`.
È voluto — così il primo deploy è reversibile. Quando il sito nuovo è verificato, si
lancia il workflow con l'opzione **pulizia_totale** attiva, che svuota la cartella
remota prima di caricare:

```bash
gh workflow run "Deploy su Aruba" --repo MarcoVanzo/mv-consulting-sito -f pulizia_totale=true
```

Da fare **solo dopo il backup**: cancella tutto ciò che c'è sul server.

### Verifica dopo la pubblicazione

- `https://www.mv-consulting.it/` — la home
- `https://mv-consulting.it/` — deve reindirizzare a `www`
- `https://www.mv-consulting.it/chi-siamo/` — deve reindirizzare a `/#studio`
- `https://www.mv-consulting.it/privacy-policy/` — deve reindirizzare alla nuova pagina
- un invio di prova del modulo di contatto

**Rollback:** ricaricare la copia scaricata al punto 1 e ripristinare il database.

## Dopo la pubblicazione

- Aggiornare la sitemap in Google Search Console.
- Far puntare `marcovanzo.com` (oggi un sito Flash inservibile) in redirect 301 su
  `https://www.mv-consulting.it/`.
- Il modulo di contatto sostituisce Contact Form 7: i messaggi arrivano solo per email,
  non restano archiviati da nessuna parte. Se serve uno storico, va aggiunto.

## Promozione sui social

Il sito è predisposto per essere usato come pagina di atterraggio di una campagna a
pagamento su Meta, LinkedIn o Google. Ci sono tre pezzi.

### 1. Grafiche pronte

Tre immagini nello stesso linguaggio del sito:

| file | misure | dove si usa |
|---|---|---|
| `assets/img/og.jpg` | 1200×630 | anteprima dei link (Facebook, LinkedIn, WhatsApp, X) |
| `tools/social-quadrata.jpg` | 1200×1200 | post nel feed di Instagram, Facebook, LinkedIn |
| `tools/social-storia.jpg` | 1080×1920 | storie e reel |

Solo la prima va online, perché è quella che i social vanno a leggere dai meta della
pagina. Le altre due si caricano a mano al momento del post: stanno in `tools/`, che
il deploy non pubblica.

Si rigenerano da `tools/social.html`: si apre il file nel browser, si cambia il testo e
si esporta il riquadro con «Capture node screenshot» negli strumenti per sviluppatori.
Nessuna dipendenza da installare.

### 2. Da dove arriva chi scrive

Gli indirizzi delle inserzioni vanno costruiti con i parametri di campagna, per esempio:

```
https://www.mv-consulting.it/?utm_source=facebook&utm_medium=cpc&utm_campaign=gestionali-autunno
```

La pagina li legge e li accoda al messaggio del modulo: la mail che arriva contiene una
riga `Origine:` con la campagna che ha prodotto la richiesta. **Senza cookie e senza
salvare niente sul dispositivo di chi visita** — i valori restano in memoria per il
tempo della visita. Funziona anche con `gclid` e `fbclid`.

Le ancore utili come destinazione di un annuncio: `/#contatti` (il modulo),
`/#progetti` (i casi), `/#domande` (le obiezioni frequenti), `/#klubia` (il prodotto).

### 3. Pixel e statistiche

Sono attivi e configurati direttamente in testa alle pagine, non da JavaScript:

| strumento | identificativo | categoria Cookiebot |
|---|---|---|
| Google Analytics 4 | `G-XJX17YKC6D` | `statistics` |
| Meta Pixel | `2091002778460176` | `marketing` |
| LinkedIn Insight Tag | `9453514` | `marketing` |

Ogni tag e' marcato `type="text/plain" data-cookieconsent="..."`: Cookiebot lo accende
solo per le categorie accettate. **Il blocco e' dichiarativo di proposito**, non affidato
al solo `data-blockingmode="auto"`: se `consent.cookiebot.com` non risponde — capita con
un adblocker — l'auto-blocking non entra in funzione, e un tag non marcato partirebbe
comunque. Aggiungendone altri, vanno marcati allo stesso modo e i loro domini aggiunti
alla CSP nel `.htaccess`.

Due eventi sono cablati in `main.js` e partono solo se lo strumento e' gia' stato
avviato da Cookiebot: `contatto_cta` (clic su un richiamo al contatto, con la posizione)
e `richiesta_inviata` (modulo spedito).

## Cookie e consenso: Cookiebot

Il consenso è gestito da **Cookiebot**. Lo script sta in testa a `index.html`,
`privacy-policy.html` e `404.html` e deve restare **il primo script della pagina**.

### L'identificativo

Il CBID è `abf0bc57-ae54-458d-bb39-ae97f9323b72`, cioè l'ID del gruppo di domini che si
legge nell'indirizzo del pannello Cookiebot. Compare in quattro punti:

```bash
grep -rn "abf0bc57-ae54-458d-bb39-ae97f9323b72" -- *.html
```

Sono i tre tag `<script id="Cookiebot">` nelle pagine e il tag `CookieDeclaration` dentro
`privacy-policy.html`, che disegna l'elenco dei cookie aggiornato in automatico.

### Quello che si fa solo dal pannello

Il codice qui dentro non basta: queste voci vivono su
[admin.cookiebot.com](https://admin.cookiebot.com/) e vanno controllate una volta.

| voce | come deve stare | perché |
|---|---|---|
| Modello del banner | con la scelta **per categoria**, non il solo «OK» | il consenso dev'essere specifico per finalità |
| Pulsante di rifiuto | presente nel primo livello, non nascosto dietro «Personalizza» | rifiutare dev'essere facile quanto accettare |
| Scadenza del consenso | **6 mesi**, non i 12 di default | per l'Italia è la lettura prudente |
| Lingua | italiano, o rilevamento automatico | il tag passa già `data-culture="IT"` |
| Scansione | eseguita almeno una volta | senza, la tabella dell'informativa resta vuota |
| Nomi delle categorie | quelli standard, niente etichette vaghe | il Garante ha contestato «cookie di esperienza» a un'altra azienda |

I **colori** del banner non serve impostarli dal pannello: `assets/css/style.css` lo veste
già con la palette del sito, in fondo al file. Quel blocco usa gli identificativi del DOM
interno di Cookiebot (`#CybotCookiebotDialog…`), che possono cambiare con i loro
aggiornamenti: se un giorno il banner torna chiaro, la causa è lì.

Accetta e rifiuta hanno di proposito lo **stesso peso visivo**. Un pulsante pieno accanto a
uno scarico è il modo classico di spingere verso il consenso, e le autorità lo contestano:
se dal pannello si sceglie un tema che li differenzia, il CSS lo riporta pari.

Resta fuori dal codice anche l'**accordo ex art. 28** con Usercentrics A/S, che è il
responsabile del trattamento per la raccolta del consenso. L'informativa lo cita già.

### Come sono bloccati gli strumenti

Due cinture, non una.

Il tag Cookiebot ha `data-blockingmode="auto"`: riscrive lui i tag `<script>` della
pagina prima che partano. Perché funzioni, `script-src` nella CSP ha `'unsafe-inline'` —
è il prezzo dell'auto-blocking, e la documentazione di Cookiebot avverte che i due non
convivono bene.

Per questo ogni tag di misurazione è **anche** marcato a mano:

```html
<script type="text/plain" data-cookieconsent="statistics" ...>
```

Non è ridondanza inutile. Se `consent.cookiebot.com` non risponde — un adblocker lo
blocca spesso, e il loro CDN può essere lento — l'auto-blocking non entra mai in
funzione, e un tag non marcato parte comunque, prima di qualunque consenso. Con la
marcatura, un tag che non viene esplicitamente acceso resta `text/plain`, cioè testo
inerte che il browser non esegue.

**Ogni script di terze parti che si aggiunge va marcato allo stesso modo**, e il suo
dominio aggiunto alla CSP nel `.htaccess`. Vale anche per quelli incollati da un
fornitore: il commento «basta l'auto-blocking» non regge alla prova dell'adblocker.

### La voce «Preferenze cookie»

Sta nel piè di pagina di tutte le pagine e riapre il banner. La documentazione di
Cookiebot suggerisce `href="javascript: Cookiebot.renew()"`, che però la CSP del sito
blocca: l'aggancio è in `assets/js/consenso.js`, che cerca gli elementi con l'attributo
`data-cookie-renew`. Se il CBID non è ancora stato inserito, la voce resta nascosta
invece di non fare niente quando la si tocca.

## Accessibilità e privacy

- Cookie tecnici del banner Cookiebot e, solo con il consenso, due categorie
  separate: **statistica** con Google Analytics 4 (proprietà `MV Consulting`, ID
  `G-XJX17YKC6D`) e **marketing** con il pixel di Meta (ID `2091002778460176`,
  portfolio `MV Consulting Srl`) e l'Insight Tag di LinkedIn (Partner ID `9453514`,
  account `550280115`). Il banner è il primo script di ogni pagina e blocca da solo
  gli script non consentiti.
- Le animazioni si disattivano da sole con `prefers-reduced-motion`.
- La `Content-Security-Policy` in `.htaccess` ammette solo Cookiebot, Google
  Analytics, Meta e LinkedIn: aggiungendo altri script di terze parti va aggiornata,
  altrimenti verranno bloccati.
- Aggiungendo o togliendo uno strumento vanno rifatti tre passaggi insieme: la CSP,
  l'informativa in `privacy-policy.html` e la riscansione del sito su Cookiebot, che
  rigenera la dichiarazione dei cookie e ripropone il banner a chi aveva già scelto.
