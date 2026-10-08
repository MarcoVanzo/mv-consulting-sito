# MV Consulting — design system (stato reale)

Questo file descrive lo stile **che il sito ha già**, ricavato da `assets/css/style.css`,
`index.html`, `404.html` e `privacy-policy.html` (ottobre 2026). Non è una proposta:
chi tocca la grafica parte da qui e resta dentro queste regole. Valgono anche i vincoli
del `CLAUDE.md`: niente font esterni, niente CDN, niente librerie, niente build.

## Principi

- **Scuro, carbone quasi neutro.** Il fondo non è blu: il blu del marchio è un accento
  e deve restare raro per farsi notare (`style.css:4-8`).
- **Calore dal testo e dall'ambra.** Testo bianco appena avorio; l'ambra `--warm` segna
  solo il «prima», il lato del problema.
- **Materia, non piatto.** Grana SVG al 5% su tutta la pagina (`body::after`), filo di
  luce sul bordo alto delle schede, ombre lunghe e morbide.
- **Ogni effetto è un di più.** Senza JS o con movimento ridotto la pagina resta intera.
- **Ritmo fra sezioni:** scuro → fascia chiara color carta (`.handover`) → blu notte
  (`.voci`) → scuro.

## Colori

### Token globali (`:root`, `style.css:15-39`)

| Token | Valore | Uso |
|---|---|---|
| `--bg` | `#101315` | fondo pagina |
| `--bg2` | `#14181B` | fondo sezioni alternate (founder, FAQ, footer), lato «prima» |
| `--panel` | `#191E22` | schede, modulo, demo, viz |
| `--panel2` | `#232A2F` | binario dello slider, tessere dei passaggi |
| `--edge` | `#2E363C` | bordi e filetti |
| `--edge2` | `#3F484F` | bordi in hover |
| `--field-edge` | `#6B757C` | bordi dei campi del modulo (3.2:1 sul loro fondo) |
| `--text` | `#E9E7E3` | titoli e testo forte (avorio) |
| `--body` | `#C3C8CB` | testo corrente |
| `--dim` | `#98A1A6` | didascalie, etichette, testo secondario |
| `--brand` | `#429DDA` | blu del marchio: CTA, occhielli, focus, accenti |
| `--brand-d` | `#2E7BB0` | inizio del gradiente della barra di avanzamento |
| `--ink` | `#08131B` | testo sopra il blu (pulsanti) |
| `--ard` | `#7E888F` | ardesia del marchio: logotipi testuali nel nastro |
| `--warm` | `#D8A46A` | ambra: «Prima», alone caldo della hero |
| `--ok` | `#4FBFA0` | messaggio di invio riuscito |
| `--ko` | `#FF8A8A` | errori del modulo: sotto il campo, bordo del campo, esito |
| (letterale) | `#7FD0F2` | fine del gradiente di «sai fare» e della barra |

Marchio: `#429DDA` blu, `#66879E` ardesia (`style.css:2`).

### Fascia chiara `.handover` (`style.css:817-825`)

Ridefinisce i token dentro la sezione, così i componenti seguono da soli:
`--bg2 #F5F3EF`, `--panel #FFFFFF`, `--panel2 #E4E0D9`, `--edge #DAD5CC`,
`--edge2 #C5BFB4`, `--text #15191C`, `--body #3D454A`, `--dim #5A6268`,
`--brand #1A6599` (blu scurito per stare sopra la carta), fondo `#ECE9E3`.

### Blu notte `.voci` (`style.css:828-842`)

Fondo `#0C1824` con due aloni: blu `rgba(66,157,218,.26)` in alto a sinistra, viola
`rgba(139,92,246,.14)` in basso a destra. Schede vetro `rgba(255,255,255,.035)`.

### Colori delle schede progetto `.case`

Ogni `<article class="case">` porta i colori del cliente nell'attributo `style`:

| Variabile | Ruolo | Dove si vede |
|---|---|---|
| `--p` | colore principale | barretta verticale del titolo `h3::before`, «Dopo» `.ba .after h4` e suo filetto, secondo testo di `.viz-head`, ultimo passaggio di `.flow`, pallini dei moduli accesi, alone del bordo dello screenshot |
| `--p2` | secondo colore | pallino del 3° modulo acceso, scansione NIS 2 (`.scan-it`) |
| `--p3` | terzo colore (facoltativo, ricade su `--p`) | pallino del 5° modulo acceso |
| `--p-text` | `--p` schiarito per i **testi piccoli** (ricade su `--p`); va dichiarato quando `--p` sta sotto 4.5:1 su `--panel2` | «Dopo», secondo testo di `.viz-head`, ultimo passaggio di `.flow` |
| `--tint` | alone trasparente (~.10–.13) | gradiente in testa alla fascia, fondo di «Dopo», testata della viz, moduli accesi |

Default (`style.css:280`): tutto `--brand`, `--tint rgba(66,157,218,.07)`.

| Progetto | `--p` | `--p2` | `--p3` | `--tint` | Eccezioni |
|---|---|---|---|---|---|
| Savino Del Bene Volley | `#C9A84C` | `#ED028C` | `#003063` | `rgba(201,168,76,.10)` | — |
| MV Sport Travel | `#E8006A` | `#34D399` | `#E8006A` | `rgba(232,0,106,.10)` | `--p-text:#FF4A9D` (4.65:1 su `--panel2`) |
| Klubia (`.klubia`) | `#00E5FF` | `#8B5CF6` | `#EC4899` | `rgba(139,92,246,.13)` | barretta e testata con gradiente rosa→viola→ciano, filetto «Dopo» `#8B5CF6` |
| Zanutta NIS 2 (`.nis`) | `#E04552` | `#5B86D6` | `#E04552` | `rgba(173,34,48,.12)` | `--p-text:#E76C77` (4.72:1), barretta `#AD2230→#1E3A72`, logo su lastra chiara `#F4F2EE` |

I campioni `.pal .sw i` mostrano invece la palette originale del cliente (colori
letterali, possono differire da `--p`: sono i colori veri, `--p` è quello leggibile sul
fondo scuro).

## Tipografia

Font **locali** in `assets/fonts/` (licenza OFL in `OFL.txt`), `font-display:swap`,
asse dei pesi 100–900, `geist.woff2` precaricato in ogni pagina:

- `--font`: `"Geist", "Avenir Next", Avenir, "Segoe UI", system-ui, sans-serif`
- `--mono`: `"Geist Mono", Menlo, "SF Mono", ui-monospace, monospace` — percentuale
  della demo, dati societari nel footer (`.mono`)
- Virgolette in filigrana delle testimonianze: Georgia (unico serif, decorativo)

Base: `body` 16px / 1.55, antialiased. Titoli peso 600, `letter-spacing:-.025em`,
`text-wrap:balance`. Numeri `tabular-nums` in stats, spec, percentuali.

| Ruolo | Dimensione | Interlinea / tracking |
|---|---|---|
| H1 hero | `clamp(31px, 3.9vw, 48px)` | 1.06 / -.035em |
| H1 documenti | `clamp(30px, 4.4vw, 46px)`; 404 `clamp(28px, 4vw, 40px)` | 1.06–1.12 |
| H2 chiusura | `clamp(27px, 3.8vw, 46px)` | 1.1 |
| H2 sezione | `clamp(26px, 3.3vw, 38px)` | 1.12, max 19–22ch |
| H3 progetto | `clamp(25px, 3vw, 33px)` | 1.1 |
| Numeri grandi `.hand b` | `clamp(40px, 5vw, 60px)` | 1 / -.04em |
| Stat hero | 29px (24px sotto 620) | 1.1 / -.03em |
| Citazione grande | 22px; citazione founder 20px | 1.5 |
| H2 documento legale | 21px | 1.25 |
| Lede hero | 18.5px | 1.6, max 47ch |
| H3 schede | 17.5–18px | — |
| Testo lungo (progetti, founder, FAQ, legale) | 15–15.5px | 1.7–1.74, max 56–78ch |
| Testo schede | 13.5–14px | 1.6 |
| Didascalie | 12–13px | — |
| Etichette della hero e della demo, didascalie dei numeri | 13px (minimo) | tracking .04–.1em |
| Etichette maiuscole (occhielli, label, testate) | 10–11px | tracking .12–.16em, `uppercase` |

## Spaziature

Non c'è una scala a token: i valori ricorrono per convenzione.

- Contenitore `.w`: `--maxw` 1180px (1320px da 1600px in su), gutter 32px → 20px
  sotto 820px.
- Sezioni: 88px verticali → 58px sotto 820px. Hero 74/84 → 36/56. Fascia progetto
  `.case` 64px → 44px.
- Intestazione di sezione → contenuto: 40px (30px su telefono).
- Gap griglie: 16px (aree, testimonianze), 18px (passaggi), 48–56px (colonne hero,
  progetti, founder, chiusura), 8px (tessere spec, moduli, scan).
- Padding schede: 22–26px; modulo 26px; campi 11×13px; pulsanti 11×20px.
- Ancore: `scroll-margin-top` = `--navh` (76px, 66px su telefono) + 14px.

## Raggi

| Raggio | Dove |
|---|---|
| 999px | eyebrow, pulsante social |
| 26px / 16px | cornice del telefono negli screenshot |
| 14px | demo, modulo, finestra browser, banner cookie |
| 12px | schede aree/passaggi/testimonianze, `.ba`, viz, ritratto, note e tabelle legali |
| 9–10px | tessere spec, icona area, burger, diritti |
| 7–8px | pulsanti, campi, tessere flow/moduli/scan, link del sommario |
| 4–5px | etichette demo, campioni palette |

## Ombre ed elevazione

- Scheda standard (`style.css:760`): `inset 0 1px 0 rgba(255,255,255,.05), 0 14px 34px -18px rgba(0,0,0,.85)`.
- Demo / ritratto: `0 40px 90px -50px rgba(0,0,0,.9)` + filo interno .06.
- Screenshot: `0 50px 110px -50px rgba(0,0,0,.95)` + anello `color-mix(--p 14%)`.
- Fascia chiara: `0 1px 2px rgba(20,25,28,.06), 0 22px 44px -28px rgba(20,25,28,.35)`.
- Pulsante in hover: `0 8px 26px -10px rgba(66,157,218,.85)`.
- Focus campi: anello `0 0 0 4px rgba(66,157,218,.16)`.
- Z-index: menu 45, cta-bar 44, header 50, barra avanzamento 60, skip link 80, grana 100.

## Componenti

- **Barra di navigazione** `header.nav`: sticky, `rgba(16,19,21,.85)` + blur 14px;
  da `.stuck` compare il filetto e si stringe (padding 20→13px, logo 176→150px). Logo
  come `background-image` (`--img-logo-neg`). Voce attiva `.on` con sottolineatura
  blu. Sotto 900px: burger 44×44 e menu a pieno schermo con frecce blu.
- **Hero**: due aloni (blu dietro il titolo, ambra diluita in alto a destra) che
  derivano in 22s, griglia tecnica 56px mascherata, luce che segue il puntatore.
  Eyebrow a pillola; H1 con parole che salgono e «sai fare» in gradiente blu→ciano;
  due CTA (piena + ghost); tre stats con la didascalia sotto la cifra, sempre su tre
  colonne. Le aree della griglia (`testo`, `demo`, `numeri`) tengono i numeri sotto il
  testo su schermo e li portano **dopo la demo** sotto 820px. A destra la **demo**: scheda con canvas, due etichette «prima» (ambra) / «dopo» (blu), slider,
  inclinazione 3D verso il puntatore.
- **Nastro clienti** `.marquee`: loghi in scala di grigi a .55, colore in hover;
  scorre in 40s dentro la colonna con dissolvenze ai bordi; pulsante di pausa.
- **Sezioni**: `.sec-head` (titolo a sinistra e testo a destra) o `.sec-head.stack`
  (impilati). Occhiello `.kicker` 10.5px blu con lineetta.
- **Aree** `.area`: quattro schede (2 sotto 960, 1 sotto 820), icona SVG lineare
  1.6px blu in un quadrato 42px, filetto blu in cima che si allunga in hover,
  sollevamento -3px, luce che segue il puntatore; `.hi` evidenzia la scheda privacy.
  Subgrid per allineare titoli ed elenchi.
- **Schede progetto** `.case`: tipo, logo (`.stemma` 56px, `.lastra` su fondo chiaro),
  H3 con barretta colorata, ruolo, tessere spec 2 colonne, campioni palette; a destra
  il blocco **Prima / Dopo** (`.ba`, ambra contro `--p`), testo e una **viz**
  (`.flow`, `.mods`, `.scan`) che si anima entrando. Sotto, lo **screenshot** in
  finestra browser con telefono appoggiato. Le schede pari invertono le colonne.
- **Passaggio di competenza** `.handover`: fascia chiara, tre passaggi con numero in
  filigrana a contorno, riquadro `.transfer` con tre percentuali che crescono.
- **Founder**: ritratto quadrato `<picture>` WebP/JPG, citazione con filetto blu
  le cui parole si accendono leggendo, firma maiuscola blu.
- **Testimonianze** `.voci`: blu notte, virgolette Georgia in filigrana; da 961px la
  prima occupa due righe in grande.
- **FAQ**: `<details>` con freccia a chevron blu che ruota; da 961px il titolo resta
  fermo a sinistra (sticky).
- **Chiusura e modulo** `.end` + `.form`: alone blu, H2 grande; modulo in pannello
  14px, righe a due colonne (una sotto 820), etichette maiuscole sopra i campi,
  nota «I campi con * sono obbligatori», asterisco blu `.req` sugli obbligatori e
  «(facoltativo)» sugli altri; campi su `rgba(255,255,255,.035)` con bordo
  `--field-edge`, 16px sotto 820px; errore `.field-err` rosso sotto ogni campo,
  legato con `aria-describedby` e `aria-invalid`, controllato all'uscita dal campo e
  all'invio (fuoco sul primo errato); consenso con checkbox `accent-color` blu,
  pulsante `.btn` (stato `:disabled` durante l'invio), messaggio `role="status"` verde/rosso, honeypot
  `.hp` nascosto con `clip-path`.
- **Pulsanti** `.btn`: blu pieno, testo `--ink`, 600 14px, raggio 7, `min-height:44px`,
  freccia `.arw` che scorre in hover; `.ghost` trasparente con bordo `--edge`. Hover
  solo con `@media (hover:hover)`; `:active` scende di 1px.
- **Barra CTA del telefono** `.cta-bar`: fissa in basso sotto 820px, compare dopo la
  hero, sparisce sul modulo, rispetta `safe-area-inset-bottom`.
- **Footer**: `--bg2`, quattro colonne (2 sotto 960, 1 sotto 560): marchio + social a
  pillola, sede, dati societari in `<dl>` monospace, contatti; riga legale con
  «Preferenze cookie» come `.linkish`.
- **Documenti legali** (`privacy-policy.html`): `.doc-hero`, sommario sticky
  numerato (diventa blocco a 2/1 colonne sotto 900/560), sezioni numerate `01`,
  `.doc-note` con filetto blu o ambra, `.doc-table` scorrevole, `.rights` a due
  colonne, stile di stampa dedicato.
- **404**: barra con il solo pulsante «Vai alla home», `.doc` 780px con stile in
  `<style>` nella pagina, footer completo.
- **Banner Cookiebot**: riportato nei colori del sito; accetta, rifiuta e personalizza
  hanno **lo stesso peso visivo** di proposito (`style.css:514-549`).

## Breakpoint

`max-width`: **400** (logo e nav compatti) · **560** (CTA hero a tutta larghezza, scan
e footer a una colonna, etichette demo separate) · **620** (stats più compatti) · **820**
(il principale: una colonna, gutter 20px, cta-bar, `--navh` 66px) · **900** (burger e
menu; sommario legale in testa) · **960** (aree a 2, testimonianze a 1, footer a 2).
`min-width`: **821** (scacchiera dei progetti), **961** (FAQ sticky, testimonianza
grande), **1600** (`--maxw` 1320px). Hover: `@media (hover:hover)`.

## Animazioni

Curva unica `--ease: cubic-bezier(.22,.68,.24,1)`. Tutte rispettano
`prefers-reduced-motion` (`style.css:42, 91, 165, 495, 743, 844, 1093`) — ogni nuova
animazione va dentro la stessa media query.

| Animazione | Durata | Dettaglio |
|---|---|---|
| Rivelazione `.rv` | .7s | `opacity` + `translate` 18px; rete di sicurezza in `<head>` se lo script non parte |
| Parole dell'H1 | .6–.7s, +30ms per parola | `opacity` + `translateY(.45em)`, niente blur (LCP) |
| Deriva aloni hero `deriva` | 22s alternata | translate + scale 1.08 |
| Nastro clienti `nastro` | 40s lineare | pausa in hover e col pulsante |
| Hover schede | .3s | -3px, bordo `--edge2`, luce sotto il puntatore .35s |
| Viz `.flow` / `.mods` | .6s / .5s | i passaggi si raddrizzano, i moduli si accendono |
| Scansione NIS 2 `verifica` | 7.2s ciclo, +1.2s per voce | — |
| Screenshot `raddrizza` / `sale` | legata allo scroll (`animation-timeline:view()`) | solo dove supportata |
| Menu, burger, cta-bar | .25–.35s | — |
| Pulsanti | .2s transform, .3s ombra | freccia +3px |

---

## Regole che il sito oggi viola

Le voci segnate **✓ risolto** sono state sistemate; resta indicato il commit.

Dalle ricerche `--domain landing`, `--domain ux` e `--domain typography` su «sito
vetrina consulenza informatica B2B, PMI italiane, tono sobrio». Per `landing` e `ux`
la query non ha trovato corrispondenze né in italiano né riformulata in inglese
(«B2B consulting services lead»): le regole UX sotto vengono dalle ricerche mirate
(`contact form conversion`, `form error inline validation`, `color contrast text`,
`minimum font size`, `required field indicator`, `touch target`) e dalla checklist
della skill. Le proposte di `typography` (Plus Jakarta Sans, Poppins, Lexend…) sono
**scartate**: richiedono Google Fonts. Contrasti calcolati con la formula WCAG sui
valori reali dei token.

### 1. Accessibilità e contrasto

1. ✓ **risolto** in `fix(a11y)` con `--p-text` — **`--p` di MV Sport Travel e Zanutta sotto 4.5:1 su testo piccolo.** `#E8006A` su
   `--panel` = 3.71:1, `#E04552` = 4.11:1, usati per «Dopo» / «L'obiettivo» a 10px
   maiuscolo (`style.css:315`) e per la testata della viz (`style.css:322`). Valori in
   `index.html:491` e `index.html:591`. Serve un `--p` più chiaro per il testo,
   lasciando i colori originali ai campioni `.pal`.
2. ✓ **risolto** in `fix(form)` — **Bordi dei campi del modulo sotto 3:1** (contrasto non testuale, WCAG 1.4.11):
   `--edge2 #3F484F` sul fondo del campo ≈ 1.7:1 (`style.css:767`). Il campo si
   distingue solo dal fondo appena più chiaro.
3. **Testo sotto i 12px diffuso.** ✓ **risolto in parte** in `fix(ui)`: eyebrow, testata,
   etichette, «Trascina» e nota della demo, didascalie dei numeri ora a 13px; l'etichetta
   «sembra complicato» non scende più sotto l'opacità .75 (5:1, prima 1.6:1).
   Restano a 10–11px gli occhielli e le etichette delle schede (`style.css`: `.kicker`,
   `.pal .lab`, `.ba h4`, `.viz-head`, `.field label`, `.foot-col h4`, `.clients-lab`,
   `.spec span`). Il contrasto regge (≥5.5:1), la dimensione no.
4. **Salto di livello nei titoli**: nel footer `<h4>` segue direttamente l'`<h2>` della
   chiusura (`index.html:830`, `404.html:99`, `privacy-policy.html:316`).
5. **Canvas della demo con `aria-label` ma senza `role="img"`** (`index.html:370`): i
   lettori di schermo ignorano l'etichetta.
6. **La `.cta-bar` fissa può coprire l'elemento a fuoco** navigando da tastiera su
   telefono (WCAG 2.4.11): nessun `scroll-padding-bottom` che la compensi
   (`style.css:485-494`).
7. **Pagine interne senza skip link** e con `<nav>` senza `aria-label`
   (`404.html:79`, `privacy-policy.html:68`).

### 2. Conversione del modulo contatti

1. ✓ **risolto** in `fix(form)` — **Nessun errore accanto al campo.** Con `novalidate` lo script chiama solo
   `reportValidity()` (`assets/js/main.js:482`): una bolla del browser alla volta, che
   sparisce, nessun `aria-describedby`, nessun riepilogo. Gli errori del server finiscono
   solo in fondo, in `#formMsg` (`main.js:503-506`).
2. ✓ **risolto** in `fix(form)` — **Campi obbligatori non segnalati**: Nome, Email, messaggio e consenso sono
   `required` ma niente lo dice; solo «Telefono» porta «(facoltativo)», «Azienda» no
   (`index.html:780-800`). Chi compila scopre l'obbligo all'invio.
3. ✓ **risolto** in `fix(form)` — **Pulsante d'invio fuori dal sistema `.btn`** (`index.html:810`, `style.css:430-435`):
   niente `min-height:44px`, hover non chiuso in `@media (hover:hover)` (resta
   «appiccicato» sul touch), nessuno stile `:disabled` durante «Invio in corso...»,
   escluso dalle regole di movimento ridotto.
4. ✓ **risolto** in `fix(form)` — **Il messaggio di esito non riceve il fuoco**: `msg.focus()` (`main.js:498`) su un
   `<p>` senza `tabindex="-1"` non fa nulla; dopo l'invio da tastiera il fuoco resta sul
   pulsante e su telefono il messaggio può restare fuori schermo.
5. **Etichette dei campi a 10.5px maiuscole** (`style.css:420`): sono la parte che
   guida la compilazione, scritte più piccole del testo di consenso.

### 3. Resa su mobile

0. ✓ **risolto** in `fix(mobile)` — **Hero sul telefono**: la demo stava sotto i numeri,
   lontana dalla prima schermata, e i numeri avevano la didascalia a fianco in una
   colonna fissa (sembravano una tabella).

1. ✓ **risolto** in `fix(form)` — **Campi a 14.5px: iOS ingrandisce la pagina al tocco** (sotto i 16px,
   `style.css:423`). È il difetto più visibile su iPhone, proprio nel modulo.
2. **Testo corrente sotto i 16px sul telefono**: schede aree e passaggi 13.5px
   (`style.css:269, 358`), Prima/Dopo 13.5px (`style.css:316`), spec 12.5–13.5px
   (`style.css:1039`), testimonianze 14px (`style.css:382`): nessuna media query li
   alza sotto 820px.
3. **`theme-color` diverso dal fondo**: `#101A22` (`index.html:91`, `404.html:57`) contro
   `--bg #101315`: la barra del browser su Android ha una tinta che la pagina non ha.
4. ✓ **risolto** in `fix(form)` — **Hover del pulsante del modulo attivo anche su touch** (`style.css:435`), vedi 2.3.
