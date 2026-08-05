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

## Pubblicazione su Aruba

L'hosting risponde `server: aruba-proxy` e supporta PHP, quindi `contatti.php` funziona
senza configurazione. Il caricamento avviene via FTP/SFTP nella cartella pubblica
(di norma `/www` o `/htdocs`).

**Prima di sostituire il sito attuale:**

1. Scaricare una copia completa della cartella pubblica esistente (WordPress) e
   **esportare il database** dal pannello Aruba. È l'unico modo per tornare indietro.
2. Annotare gli indirizzi email configurati sul dominio: `contatti.php` invia
   *da* `no-reply@mv-consulting.it`, che deve esistere come casella o alias del
   dominio — Aruba rifiuta le mail con mittente esterno.

**Caricamento:**

1. Caricare il contenuto di questa cartella nella radice pubblica (compreso `.htaccess`,
   che i client FTP nascondono di default: attivare "mostra file nascosti").
2. Rimuovere i file WordPress residui (`wp-admin/`, `wp-includes/`, `wp-content/`,
   `wp-config.php`, `index.php`, `xmlrpc.php`). Finché restano, `index.php` può avere
   la precedenza su `index.html` e continuare a servire il vecchio sito.
3. Verificare, nell'ordine:
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

- Nessun cookie, nessun tracciamento, nessuna richiesta a domini terzi: non serve il
  banner dei cookie. Se in futuro si aggiungono statistiche, va rivalutato.
- Le animazioni si disattivano da sole con `prefers-reduced-motion`.
- La `Content-Security-Policy` in `.htaccess` vieta ogni risorsa esterna: aggiungendo
  script di terze parti va aggiornata, altrimenti verranno bloccati.
