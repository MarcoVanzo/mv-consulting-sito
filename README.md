# mv-consulting.it

Sito vetrina di MV Consulting S.r.l.s. Socio Unico. **HTML statico + un file PHP**
per il modulo di contatto: nessun database, nessun CMS, nessuna dipendenza esterna.

Sostituisce il precedente sito WordPress (tema `marcovanzo`, Contact Form 7).

## Struttura

```
index.html              home, pagina unica con ancore (#aree #progetti #insegniamo #studio #domande #contatti)
privacy-policy.html     informativa, testo ripreso integralmente dal sito precedente
404.html                pagina di errore
contatti.php            ricezione del modulo, invia via mail() a marco@mv-consulting.it
.htaccess               HTTPS, redirect dai vecchi indirizzi, cache, intestazioni di sicurezza
robots.txt sitemap.xml  indicizzazione
assets/css/style.css    tutto lo stile
assets/js/main.js       animazione della hero, menu del telefono, rivelazioni allo scroll,
                        provenienza della visita, consenso, invio del modulo
assets/img/             logo (SVG), ritratto (JPG + WebP), immagini per le condivisioni
tools/social.html       modelli delle grafiche per i post e le inserzioni
favicon.svg .ico apple-touch-icon.png
```

Peso complessivo: ~500 KB, di cui metà sono le immagini per i social (che il sito non
carica: servono a chi pubblica). La pagina in sé pesa circa 100 KB. Nessun font esterno,
nessuna libreria: si apre completa alla prima richiesta.

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
2. Verificare che esista la casella o l'alias `no-reply@mv-consulting.it`: è il mittente
   usato da `contatti.php` e Aruba rifiuta le mail con mittente esterno al dominio.

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

In `assets/img/` ci sono tre immagini nello stesso linguaggio del sito:

| file | misure | dove si usa |
|---|---|---|
| `og.jpg` | 1200×630 | anteprima dei link (Facebook, LinkedIn, WhatsApp, X) |
| `social-quadrata.jpg` | 1200×1200 | post nel feed di Instagram, Facebook, LinkedIn |
| `social-storia.jpg` | 1080×1920 | storie e reel |

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

### 3. Pixel e statistiche, se e quando servono

L'infrastruttura c'è ma è spenta. In cima ad `assets/js/main.js`:

```js
var MISURAZIONE = {
  ga4:       "",   // es. "G-XXXXXXXXXX"
  metaPixel: "",   // es. "123456789012345"
  linkedin:  ""    // es. "1234567"
};
```

Finché i tre campi sono vuoti il sito non carica niente da domini terzi e il banner del
consenso **non compare affatto**. Appena si compila un identificativo:

1. il banner appare e nessuno script parte prima di una scelta esplicita (blocco
   preventivo, come chiede il Garante);
2. va tolto il commento alla riga di `Content-Security-Policy` corrispondente in
   `.htaccess`, altrimenti la policy blocca lo script;
3. va verificato che il testo dell'informativa sia ancora allineato (la sezione
   «Cookie» di `privacy-policy.html` descrive già il meccanismo).

Due eventi sono già cablati e partono solo dopo il consenso: `contatto_cta` (clic su un
richiamo al contatto, con la posizione) e `richiesta_inviata` (modulo spedito).

## Accessibilità e privacy

- Nessun cookie e nessuna richiesta a domini terzi finché la misurazione resta spenta.
  L'unica cosa che il sito può scrivere sul dispositivo è la memoria della scelta sul
  banner (`localStorage`, chiave `mv-consenso`), e solo se il banner esiste.
- Le animazioni si disattivano da sole con `prefers-reduced-motion`.
- La `Content-Security-Policy` in `.htaccess` vieta ogni risorsa esterna: aggiungendo
  script di terze parti va aggiornata, altrimenti verranno bloccati. Le righe pronte per
  GA4, Meta Pixel e LinkedIn sono già nel file, commentate.
- Menu del telefono, collegamento «Vai al contenuto», aree toccabili da 44px, ancore che
  si fermano sotto la barra fissa.

## Dati strutturati

`index.html` contiene un unico blocco JSON-LD con cinque nodi collegati fra loro:
`ProfessionalService`/`Organization` (con l'elenco dei servizi), `Person` (il founder),
`WebSite`, `WebPage` e `FAQPage`. Le domande del JSON-LD **devono restare identiche** a
quelle della sezione «Domande frequenti» della pagina: se si cambia un testo lì, va
cambiato anche nel JSON-LD, altrimenti Google scarta il rich result.
