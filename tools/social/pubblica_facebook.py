#!/usr/bin/env python3
"""
Crea come BOZZE SCHEDULATE (published=false) i soli post Facebook del blocco 1.

Non pubblica nulla immediatamente: ogni post resta nella coda "Post programmati"
della pagina e va approvato a mano da Meta Business Suite.

Uso:
    export FB_PAGE_ID=...            # id numerico della pagina
    export FB_PAGE_TOKEN=...         # Page Access Token, permessi pages_manage_posts
    python3 pubblica_facebook.py --file blocco-1-post.json --dry-run
    python3 pubblica_facebook.py --file blocco-1-post.json

Note operative:
  - scheduled_publish_time deve stare fra 10 minuti e 6 mesi dalla creazione:
    i post fuori finestra vengono saltati e segnati nel log.
  - i post con un media (immagine o video) NON vengono creati: Graph vuole il file
    caricato: quelli restano da caricare a mano, e il log li elenca.
    Con --photos-dir <cartella> i post con immagine gia' pronta (file <id>.jpg/.png)
    vengono creati su /photos.
  - ogni tentativo finisce in log_facebook.csv.
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import requests

GRAPH = "https://graph.facebook.com/v21.0"
TZ = ZoneInfo("Europe/Rome")
LOG = "log_facebook.csv"
LOG_COLS = ["timestamp_utc", "id", "esito", "post_id", "scheduled_utc", "tentativi", "dettaglio"]

# Codici Graph che vale la pena riprovare: rate limit applicativo, rate limit
# per utente, errore temporaneo del servizio.
CODICI_RITENTABILI = {1, 2, 4, 17, 32, 341, 368, 613}
MAX_TENTATIVI = 5


def testo_completo(post: dict) -> str:
    parti = [post["testo"], post["cta"]]
    if post.get("hashtag"):
        parti.append(" ".join(post["hashtag"]))
    if post.get("link_utm"):
        parti.append(post["link_utm"])
    return "\n\n".join(p for p in parti if p)


def istante_unix(post: dict) -> int:
    naive = datetime.strptime(f"{post['data']} {post['ora']}", "%Y-%m-%d %H:%M")
    return int(naive.replace(tzinfo=TZ).astimezone(timezone.utc).timestamp())


def finestra_valida(quando: int, adesso: datetime) -> str | None:
    minimo = int((adesso + timedelta(minutes=10)).timestamp())
    massimo = int((adesso + timedelta(days=180)).timestamp())
    if quando < minimo:
        return "scheduled_publish_time a meno di 10 minuti da adesso"
    if quando > massimo:
        return "scheduled_publish_time a piu' di 6 mesi da adesso"
    return None


def scrivi_log(riga: dict) -> None:
    nuovo = not Path(LOG).exists()
    with open(LOG, "a", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=LOG_COLS)
        if nuovo:
            w.writeheader()
        w.writerow(riga)


def gia_creati() -> set[str]:
    """Rilettura del log: rende lo script rilanciabile senza duplicare i post."""
    if not Path(LOG).exists():
        return set()
    with open(LOG, encoding="utf-8", newline="") as f:
        return {r["id"] for r in csv.DictReader(f) if r["esito"] == "creato"}


def chiama_graph(endpoint: str, dati: dict, file_immagine: Path | None) -> tuple[bool, dict, int]:
    """Ritorna (ok, payload, tentativi). Riprova solo sugli errori ritentabili."""
    attesa = 5.0
    for tentativo in range(1, MAX_TENTATIVI + 1):
        try:
            if file_immagine:
                with open(file_immagine, "rb") as fh:
                    r = requests.post(endpoint, data=dati, files={"source": fh}, timeout=90)
            else:
                r = requests.post(endpoint, data=dati, timeout=60)
        except requests.RequestException as e:
            if tentativo == MAX_TENTATIVI:
                return False, {"errore": f"rete: {e}"}, tentativo
            time.sleep(attesa + random.uniform(0, 2))
            attesa *= 2
            continue

        try:
            corpo = r.json()
        except ValueError:
            corpo = {"errore": f"risposta non JSON, HTTP {r.status_code}"}

        if r.ok and "id" in corpo:
            return True, corpo, tentativo

        err = corpo.get("error", {})
        codice = err.get("code")
        ritentabile = codice in CODICI_RITENTABILI or r.status_code in (429, 500, 502, 503)

        # Meta espone il consumo di quota qui: se siamo vicini al limite, rallenta.
        quota = r.headers.get("X-App-Usage") or r.headers.get("X-Business-Use-Case-Usage")
        if quota:
            print(f"    quota Graph: {quota}", file=sys.stderr)

        if not ritentabile or tentativo == MAX_TENTATIVI:
            return False, corpo, tentativo

        print(f"    errore {codice} ritentabile, riprovo fra {attesa:.0f}s", file=sys.stderr)
        time.sleep(attesa + random.uniform(0, 2))
        attesa *= 2

    return False, {"errore": "tentativi esauriti"}, MAX_TENTATIVI


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--file", default="blocco-1-post.json")
    ap.add_argument("--photos-dir", help="cartella con le immagini gia' pronte, una per id")
    ap.add_argument("--dry-run", action="store_true", help="stampa e basta, non chiama Graph")
    ap.add_argument("--pausa", type=float, default=3.0, help="secondi fra una chiamata e l'altra")
    args = ap.parse_args()

    page_id = os.environ.get("FB_PAGE_ID")
    token = os.environ.get("FB_PAGE_TOKEN")
    if not args.dry_run and not (page_id and token):
        print("Servono FB_PAGE_ID e FB_PAGE_TOKEN nell'ambiente.", file=sys.stderr)
        return 2

    posts = [p for p in json.loads(Path(args.file).read_text(encoding="utf-8"))
             if p["canale"] == "facebook"]
    fatti = gia_creati()
    adesso = datetime.now(timezone.utc)
    photos = Path(args.photos_dir) if args.photos_dir else None

    creati = saltati = falliti = 0

    for post in posts:
        pid = post["id"]
        stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")

        if "⟨" in post["testo"]:
            print(f"[salto]  {pid}: contiene segnaposto da compilare")
            scrivi_log({"timestamp_utc": stamp, "id": pid, "esito": "saltato", "post_id": "",
                        "scheduled_utc": "", "tentativi": 0, "dettaglio": "segnaposto non compilato"})
            saltati += 1
            continue

        if pid in fatti:
            print(f"[salto]  {pid}: gia' creato in una esecuzione precedente")
            saltati += 1
            continue

        quando = istante_unix(post)
        problema = finestra_valida(quando, adesso)
        if problema:
            print(f"[salto]  {pid}: {problema}")
            scrivi_log({"timestamp_utc": stamp, "id": pid, "esito": "saltato", "post_id": "",
                        "scheduled_utc": str(quando), "tentativi": 0, "dettaglio": problema})
            saltati += 1
            continue

        immagine = None
        if photos:
            for ext in (".jpg", ".jpeg", ".png"):
                cand = photos / f"{pid}{ext}"
                if cand.exists():
                    immagine = cand
                    break

        serve_media = post["media_richiesto"] != "nessuno"
        if serve_media and immagine is None:
            motivo = f"media da caricare a mano: {post['media_richiesto']}"
            print(f"[salto]  {pid}: {motivo}")
            scrivi_log({"timestamp_utc": stamp, "id": pid, "esito": "saltato", "post_id": "",
                        "scheduled_utc": str(quando), "tentativi": 0, "dettaglio": motivo})
            saltati += 1
            continue

        testo = testo_completo(post)
        if immagine:
            endpoint = f"{GRAPH}/{page_id}/photos"
            dati = {"caption": testo, "published": "false",
                    "scheduled_publish_time": quando, "access_token": token}
        else:
            endpoint = f"{GRAPH}/{page_id}/feed"
            dati = {"message": testo, "published": "false",
                    "scheduled_publish_time": quando, "access_token": token}

        quando_locale = datetime.fromtimestamp(quando, TZ).strftime("%d/%m %H:%M")
        if args.dry_run:
            print(f"[prova]  {pid} -> {endpoint.rsplit('/', 1)[-1]} per il {quando_locale} "
                  f"({len(testo)} caratteri{', con immagine' if immagine else ''})")
            continue

        ok, corpo, tentativi = chiama_graph(endpoint, dati, immagine)
        if ok:
            print(f"[creato] {pid} programmato per il {quando_locale} — {corpo['id']}")
            scrivi_log({"timestamp_utc": stamp, "id": pid, "esito": "creato",
                        "post_id": corpo["id"], "scheduled_utc": str(quando),
                        "tentativi": tentativi, "dettaglio": ""})
            creati += 1
        else:
            err = corpo.get("error", corpo)
            print(f"[errore] {pid}: {err}", file=sys.stderr)
            scrivi_log({"timestamp_utc": stamp, "id": pid, "esito": "errore", "post_id": "",
                        "scheduled_utc": str(quando), "tentativi": tentativi,
                        "dettaglio": json.dumps(err, ensure_ascii=False)[:500]})
            falliti += 1

        time.sleep(args.pausa)

    print(f"\ncreati {creati}, saltati {saltati}, falliti {falliti}. Log in {LOG}.")
    print("Nessun post e' stato pubblicato: sono tutti in coda come programmati, "
          "da approvare in Meta Business Suite.")
    return 1 if falliti else 0


if __name__ == "__main__":
    sys.exit(main())
