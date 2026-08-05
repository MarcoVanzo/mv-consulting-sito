#!/usr/bin/env bash
# Fotografa il sito in locale, così una modifica visibile si può controllare
# (e mostrare a chi legge dal telefono) senza avere un browser davanti.
#
#   .claude/scripts/anteprima.sh                      home, telefono + schermo
#   .claude/scripts/anteprima.sh privacy-policy.html  un'altra pagina
#   .claude/scripts/anteprima.sh index.html --intera  tutta la pagina, non solo l'inizio
#
# Le immagini finiscono in .anteprima/ (fuori dal repository). I percorsi stampati
# alla fine vanno passati a SendUserFile con display "render".

set -euo pipefail
cd "$(dirname "$0")/../.."
radice=$(pwd)

pagina="index.html"
intera=""
for arg in "$@"; do
  case "$arg" in
    --intera) intera="--intera" ;;
    -*) echo "opzione sconosciuta: $arg" >&2; exit 2 ;;
    *) pagina="${arg#/}" ;;
  esac
done

uscita="$radice/.anteprima"
mkdir -p "$uscita"
rm -f "$uscita"/*.png

# Si serve la cartella con php invece di aprire file:// così i percorsi assoluti
# (/assets/…) e contatti.php si comportano come in produzione.
porta=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')
php -S "127.0.0.1:$porta" -t "$radice" >/dev/null 2>&1 &
server=$!
trap 'kill $server 2>/dev/null || true' EXIT

for _ in $(seq 25); do
  curl -sf -o /dev/null "http://127.0.0.1:$porta/$pagina" && break
  sleep 0.2
done

echo "Anteprima di /$pagina:"
node "$radice/.claude/scripts/anteprima.mjs" "http://127.0.0.1:$porta/$pagina" "$uscita" $intera
