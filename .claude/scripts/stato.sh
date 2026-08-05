#!/usr/bin/env bash
# Riepilogo all'avvio della sessione: da telefono si riprende un lavoro lasciato
# a metà senza avere sott'occhio il terminale. Solo informazioni locali: niente
# rete, la sessione deve partire subito.
set -uo pipefail
cd "$(dirname "$0")/../.." || exit 0

ramo=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
ultimo=$(git log -1 --format='%h %s (%cr)' 2>/dev/null || echo "-")
sporchi=$(git status --porcelain 2>/dev/null | wc -l)

echo "Sito mv-consulting.it — HTML statico + contatti.php, nessun build."
echo "Ramo: $ramo | ultimo commit: $ultimo"
if [ "$sporchi" -gt 0 ]; then
  echo "Modifiche non committate ($sporchi):"
  git status --porcelain | head -10 | sed 's/^/  /'
fi
echo "Verifiche: .claude/scripts/anteprima.sh (screenshot) — .claude/scripts/controlla.sh (link e PHP)."
