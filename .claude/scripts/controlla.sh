#!/usr/bin/env bash
# Controlli che stanno in pochi secondi e prendono gli errori più comuni di un
# sito fatto a mano: PHP che non compila, link o immagini che puntano a file
# inesistenti, risorse esterne vietate dalla Content-Security-Policy.
#
#   .claude/scripts/controlla.sh            solo i file del repository
#   .claude/scripts/controlla.sh --online   controlla anche il sito pubblicato

set -uo pipefail
cd "$(dirname "$0")/../.."
errori=0
segnala() { echo "  ✗ $*"; errori=$((errori + 1)); }

echo "PHP"
for f in *.php; do
  [ -e "$f" ] || continue
  if out=$(php -l "$f" 2>&1); then echo "  ✓ $f"; else segnala "$out"; fi
done

echo "Riferimenti locali"
riferimenti=$(grep -rhoE '(href|src)="[^"#:]+"' -- *.html 2>/dev/null \
  | sed -E 's/.*="([^"]+)".*/\1/' | sort -u)
visti=0
for r in $riferimenti; do
  percorso="${r#/}"; percorso="${percorso%%\?*}"
  [ -n "$percorso" ] || continue
  visti=$((visti + 1))
  [ -e "$percorso" ] || segnala "manca il file richiamato: $r"
done
echo "  ✓ $visti riferimenti verificati"

echo "Risorse esterne (vietate dalla CSP)"
# facebook.com e garanteprivacy.it sono link di navigazione, non risorse
# caricate: la CSP non tocca i link, e senza `navigate-to` non c'è direttiva che
# li limiti. Quello al Garante, poi, l'informativa lo deve avere.
# consent.cookiebot.com e googletagmanager.com sono le uniche risorse di terzi
# ammesse: banner di consenso e Google Analytics, entrambi in CSP.
if esterne=$(grep -rnoE '(href|src)="https?://[^"]+"' -- *.html 2>/dev/null \
  | grep -vE 'mv-consulting\.it|schema\.org|www\.w3\.org|www\.facebook\.com|www\.garanteprivacy\.it|consent\.cookiebot\.com|www\.googletagmanager\.com'); then
  # niente pipe verso il while: nella sotto-shell l'incremento di $errori
  # andrebbe perso e il controllo passerebbe pur avendo stampato le righe.
  while read -r riga; do segnala "$riga"; done <<< "$esterne"
else
  echo "  ✓ nessuna"
fi

echo "File attesi"
for f in index.html privacy-policy.html 404.html contatti.php .htaccess robots.txt sitemap.xml; do
  [ -e "$f" ] || segnala "manca $f"
done

if [ "${1:-}" = "--online" ]; then
  echo "Sito pubblicato"
  base="https://www.mv-consulting.it"

  # Le sessioni remote escono da un proxy che può avere il sito fuori dalla
  # rete consentita: risponde 403 al CONNECT per qualunque indirizzo. Senza
  # questo controllo il sito risulterebbe rotto quando è solo irraggiungibile
  # da qui, e l'esito vero resta quello del passo di controllo del workflow.
  sonda=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base/?c=$$")
  if [ "$sonda" = "000" ] || [ "$sonda" = "403" ]; then
    echo "  — non verificabile da questa sessione: la rete in uscita risponde $sonda."
    echo "    L'esito vero è il passo «Controllo del sito pubblicato» del workflow di deploy."
    echo
    if [ "$errori" -eq 0 ]; then echo "Repository a posto."; exit 0; else echo "$errori problemi."; exit 1; fi
  fi

  for p in / /assets/css/style.css /assets/js/main.js /privacy-policy.html; do
    c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base$p?c=$$")
    if [ "$c" = "200" ]; then echo "  ✓ $p"; else segnala "$p risponde $c"; fi
  done
  for vecchio in /chi-siamo/ /privacy-policy/; do
    c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$base$vecchio")
    case "$c" in 30*) echo "  ✓ $vecchio reindirizza ($c)" ;; *) segnala "$vecchio risponde $c invece di un redirect" ;; esac
  done
fi

echo
if [ "$errori" -eq 0 ]; then echo "Tutto a posto."; else echo "$errori problemi."; exit 1; fi
