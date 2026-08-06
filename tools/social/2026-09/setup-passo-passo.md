# Set-up, passo per passo

Da fare in agosto, prima del 31. Totale stimato: **45 minuti**, in tre sedute da un
quarto d'ora. Non serve decidere niente: i testi sono già scritti, si incollano.

---

## 1 — Verifica preliminare (5 minuti)

- [ ] Apri la visura camerale e leggi la denominazione esatta.
      Sul sito compare **MV Consulting S.r.l.**, tu hai scritto **S.R.L.S.**
      Quella che va su LinkedIn è **la denominazione della visura**, identica.
      Se il sito è sbagliato, dimmelo: correggo `index.html` e il footer.
- [ ] Controlla di avere accesso a una casella `@mv-consulting.it` funzionante:
      serve per la verifica della pagina.

## 2 — Creazione della pagina LinkedIn (20 minuti)

Da desktop: `linkedin.com/company/setup/new` → *Azienda*.

| Campo | Cosa incollare |
|---|---|
| Nome | *(la denominazione della visura, esatta)* |
| URL pubblico | `linkedin.com/company/mv-consulting-srl` |
| Sito web | `https://www.mv-consulting.it/?utm_source=linkedin&utm_medium=page&utm_campaign=profilo` |
| Settore | Servizi e consulenza IT |
| Dimensioni | 1-10 dipendenti |
| Tipo | Società di capitali |
| Logo | il logo del sito, quadrato, minimo 300x300 |

**Slogan** (110 caratteri):

> Software su misura, processi e privacy per le PMI. Un solo interlocutore, dalla mappa del processo al registro.

**Descrizione** — incolla tutto, i primi tre righi sono quelli che si vedono senza
cliccare «altro»:

> Non esistono cose facili o difficili. Solo cose che sai fare, e cose che non sai ancora fare.
> Progettiamo software gestionale su misura per PMI e seguiamo la protezione dei dati come DPO esterno.
> Chi progetta il database è lo stesso che firma il registro dei trattamenti.
>
> Quattro mestieri, un interlocutore solo: analisi dei processi, software su misura, privacy e DPO, formazione. Sono quattro cose che si tengono insieme, e tenerle separate è il motivo per cui in tante aziende il registro dei trattamenti descrive un'azienda che non esiste.
>
> Vent'anni sui processi d'impresa. Gestionali in esercizio tutti i giorni, fra cui il sito ufficiale di una squadra di pallavolo di Serie A1 e un ERP con la gestione dell'IVA 74-ter. Incarichi di DPO per aziende di ogni dimensione, incluse multinazionali.
>
> Il nostro lavoro è finito quando non serviamo più: in costruzione l'88% del lavoro è nostro, nell'uso quotidiano deve diventare il 12%. Consegniamo la documentazione dello schema dati e formiamo le persone mentre il sistema si sta ancora scrivendo.
>
> Sede a Zero Branco (TV). Lavoriamo prevalentemente con PMI del Nordest.

**Sede**: Via Manzoni 5 — 31059 Zero Branco (TV) — Italia

**Specialità** — sono chiavi di ricerca, vanno messe tutte e venti:

```
software gestionale su misura
ERP su misura
digitalizzazione dei processi
analisi dei processi aziendali
DPO esterno
responsabile della protezione dei dati
consulenza GDPR
registro dei trattamenti
valutazione d'impatto DPIA
privacy by design
formazione aziendale
formazione GDPR
sviluppo software PHP
applicazioni web gestionali
integrazione di sistemi
migrazione dati
automazione dei processi
consulenza informatica per PMI
gestione IVA 74-ter
siti web per società sportive
```

**Pulsante d'azione**: *Visita il sito web* →
`https://www.mv-consulting.it/?utm_source=linkedin&utm_medium=organic&utm_campaign=pagina-li#contatti`

**Copertina 1128x191** — la preparo io, il testo è:
> Quattro mestieri, un solo interlocutore.
> processi · software su misura · privacy e DPO · formazione

## 3 — Verifica della pagina (5 minuti, poi si aspetta)

- [ ] Nel pannello di amministrazione: *Impostazioni → Verifica pagina*.
- [ ] Verifica via email sul dominio `@mv-consulting.it`.
      È gratis, dà il segno di spunta e alza la distribuzione. La risposta arriva in
      qualche giorno: per questo si fa in agosto e non il 30.

## 4 — Primi follower, senza comprarne (5 minuti)

- [ ] *Inviti* → invita i contatti di primo grado del tuo profilo, per gruppi
      ragionati: prima clienti attuali e passati, poi commercialisti e consulenti,
      poi il resto. I crediti sono limitati e si ricaricano: non bruciarli tutti
      il primo giorno.
- [ ] Nel tuo profilo personale, sezione *Esperienza*, collega la posizione attuale
      alla pagina appena creata: è il collegamento che porta più visite nei primi mesi.
- [ ] Aggiungi al profilo personale il pulsante *Sito web* con lo stesso link UTM.

## 5 — Scheduler (10 minuti)

Uno qualsiasi fra Metricool, Publer e Buffer. Serve solo perché LinkedIn non ha una
programmazione decente per il profilo personale.

- [ ] Collega: profilo LinkedIn personale, pagina LinkedIn, pagina Facebook.
- [ ] Importa `blocco-1-scheduler.csv`.
- [ ] Fuso orario del calendario: **Europe/Rome**.
- [ ] Controlla che i post con `primo_commento` compilato abbiano il commento
      programmato insieme al post: se lo scheduler non lo supporta, quel commento
      lo incolli a mano subito dopo la pubblicazione (sono 8 post in tutto il mese).

## 6 — Tracciamento (0 minuti, di proposito)

Niente Meta Pixel, niente LinkedIn Insight Tag. Il sito oggi non usa cookie e non ha
banner: quei due tag lo cambierebbero in un sito che traccia, con obbligo di consenso
preventivo e informativa aggiornata, per misurare qualche decina di visite al mese.

Misuriamo con quello che c'è già:
- i parametri `utm_content` nei link, leggibili nei log del server;
- gli invii del modulo `contatti.php`, che chiedono già da dove arriva il contatto;
- le statistiche native di LinkedIn e Meta, che non richiedono nulla sul sito.

Se a gennaio parte la campagna Meta da 300 €, il Pixel si rivaluta allora: lì avrebbe
un motivo vero, e comunque servirebbe prima sistemare banner e informativa.

---

## Cosa resta a me

- immagini M1 e M5, copertina, PDF di sei pagine: li produco e te li mando in bozza;
- testi dei 28 post: già scritti, sono nel JSON;
- riscrittura del piano di ottobre sui numeri di settembre.

## Cosa resta a te, oltre a questi 45 minuti

- **10 minuti** per la foto della mappa di processo su carta (M4);
- **10 minuti** per la registrazione schermo con dati fittizi (M3), se non mi dai
  accesso a un ambiente con dati finti da cui registrarla io;
- **15 minuti** per approvare il blocco, una volta sola;
- **circa 5 minuti a settimana** per rispondere ai commenti sul tuo profilo.

Totale del mese: **55 minuti** oltre al set-up. Sotto questa soglia il piano non esiste.
