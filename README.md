# mv-consulting.it

Sito vetrina di MV Consulting S.r.l.s. Socio Unico. **HTML statico + un file PHP**
per il modulo di contatto: nessun database, nessun CMS, nessuna dipendenza esterna.

Sostituisce il precedente sito WordPress (tema `marcovanzo`, Contact Form 7).

## Struttura

```
index.html              home, pagina unica con ancore (#aree #progetti #insegniamo #studio #contatti)
privacy-policy.html     informativa, testo ripreso integralmente dal sito precedente
404.html                pagina di errore
contatti.php            ricezione del modulo, invia via mail() a marco@mv-consulting.it
.htaccess               HTTPS, redirect dai vecchi indirizzi, cache, intestazioni di sicurezza
robots.txt sitemap.xml  indicizzazione
assets/css/style.css    tutto lo stile
assets/js/main.js       animazione della hero, rivelazioni allo scroll, invio del modulo
assets/img/             logo (SVG), ritratto (JPG + WebP), immagine per le condivisioni
favicon.svg .ico apple-touch-icon.png
```

Peso complessivo: ~300 KB, di cui metà è il ritratto. Nessun font esterno, nessuna
libreria: la pagina si apre completa alla prima richiesta.

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
