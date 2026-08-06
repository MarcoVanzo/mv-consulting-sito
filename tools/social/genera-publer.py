#!/usr/bin/env python3
"""
Trasforma il JSON dei post del mese nei CSV che Publer importa in blocco.

Publer assegna a tutti i post di un import gli account che selezioni in quel
momento: per questo esce un CSV per canale, non uno solo. Tre import da un
minuto invece di ventisette compilazioni a mano.

Uso:
    python3 tools/social/genera-publer.py tools/social/2026-09

Legge  <cartella>/blocco-1-post.json
Scrive <cartella>/publer-profilo-linkedin.csv
       <cartella>/publer-pagina-linkedin.csv
       <cartella>/publer-facebook.csv

Le immagini non si caricano: il CSV porta l'URL pubblico del file dentro il
repository, che GitHub serve grezzo. Perche' funzioni, il ramo indicato in
--ramo deve essere gia' su GitHub quando fai l'import (di norma: main, dopo il
merge). Con --ramo <nome> si punta a un ramo diverso, utile per provare prima.

Le dodici colonne sono quelle del modello ufficiale di Publer e vanno tenute
tutte, anche vuote:
    Date, Text, Link, Media URL, Title, Label, Alt text(s), Comment(s),
    Pin board/FB album/Google category, Post subtype, CTA, Reminder
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

REPO = "MarcoVanzo/mv-consulting-sito"
RAW = "https://raw.githubusercontent.com/{repo}/{ramo}/{percorso}"

COLONNE = [
    "Date",
    "Text",
    "Link",
    "Media URL",
    "Title",
    "Label",
    "Alt text(s)",
    "Comment(s)",
    "Pin board, FB album, or Google category",
    "Post subtype",
    "CTA",
    "Reminder",
]

# Un file per canale: l'import di Publer vale per gli account selezionati.
FILE_PER_CANALE = {
    "profilo-linkedin": "publer-profilo-linkedin.csv",
    "pagina-linkedin": "publer-pagina-linkedin.csv",
    "facebook": "publer-facebook.csv",
}


def file_media(post: dict) -> str:
    """Estrae il nome del file dal campo descrittivo `media_richiesto`.

    Il campo e' scritto per una persona («media/m1-claim.png — immagine
    1200x1200, pronta»), quindi si tiene solo il pezzo prima del trattino lungo.
    """
    grezzo = (post.get("media_richiesto") or "").strip()
    if not grezzo or grezzo.lower().startswith("nessuno"):
        return ""
    percorso = re.split(r"\s+—\s+|\s+-\s+", grezzo, maxsplit=1)[0].strip()
    return Path(percorso).name


def testo(post: dict) -> str:
    """Corpo del post: testo, chiamata all'azione, hashtag.

    Il link non entra qui su LinkedIn — ci va nel primo commento, perche' un
    link nel corpo del post abbassa la distribuzione. Su Facebook invece resta
    nel testo, dove genera l'anteprima che porta i click.
    """
    parti = [post["testo"], post.get("cta", "")]
    if post.get("hashtag"):
        parti.append(" ".join(post["hashtag"]))
    if post["canale"] == "facebook" and post.get("link_utm"):
        parti.append(post["link_utm"])
    return "\n\n".join(p for p in parti if p)


def commenti(post: dict) -> str:
    """Commenti da programmare insieme al post, separati da `||`."""
    elenco = []
    primo = (post.get("primo_commento") or "").strip()
    if primo:
        elenco.append(primo)
    link = (post.get("link_utm") or "").strip()
    if link and post["canale"] != "facebook" and not any(link in c for c in elenco):
        elenco.append(link)
    return " || ".join(elenco)


def titolo(post: dict) -> str:
    """Titolo del documento: Publer lo usa solo per i PDF e i video."""
    if not file_media(post).lower().endswith(".pdf"):
        return ""
    padre = post.get("asset_padre", "")
    return re.sub(r"^A\d+\s+—\s+", "", padre).strip()


def riga(post: dict, ramo: str, etichetta: str, cartella: str) -> dict:
    nome = file_media(post)
    url = ""
    if nome:
        url = RAW.format(repo=REPO, ramo=ramo, percorso=f"{cartella}/media/{nome}")
    return {
        "Date": f"{post['data'].replace('-', '/')} {post['ora']}",
        "Text": testo(post),
        "Link": "",
        "Media URL": url,
        "Title": titolo(post),
        "Label": f"{etichetta},{post['id']}",
        "Alt text(s)": post.get("alt_text", "") if nome else "",
        "Comment(s)": commenti(post),
        "Pin board, FB album, or Google category": "",
        "Post subtype": "PDF" if nome.lower().endswith(".pdf") else "",
        "CTA": "",
        "Reminder": "",
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("cartella", help="cartella del mese, es. tools/social/2026-09")
    ap.add_argument("--ramo", default="main", help="ramo da cui GitHub serve le immagini")
    ap.add_argument("--sorgente", default="blocco-1-post.json")
    args = ap.parse_args()

    cartella = Path(args.cartella)
    sorgente = cartella / args.sorgente
    if not sorgente.exists():
        print(f"manca {sorgente}", file=sys.stderr)
        return 1

    post = json.loads(sorgente.read_text(encoding="utf-8"))
    etichetta = f"mvc-{cartella.name}"

    mancanti = []
    for p in post:
        nome = file_media(p)
        if nome and not (cartella / "media" / nome).exists():
            mancanti.append(f"{p['id']}: {nome}")
    if mancanti:
        print("media dichiarati ma assenti:", file=sys.stderr)
        for m in mancanti:
            print(f"  {m}", file=sys.stderr)
        return 1

    for canale, nome_file in FILE_PER_CANALE.items():
        righe = [
            riga(p, args.ramo, etichetta, str(cartella))
            for p in post
            if p["canale"] == canale
        ]
        destinazione = cartella / nome_file
        with destinazione.open("w", newline="", encoding="utf-8") as f:
            scrittore = csv.DictWriter(f, fieldnames=COLONNE)
            scrittore.writeheader()
            scrittore.writerows(righe)
        con_media = sum(1 for r in righe if r["Media URL"])
        con_commento = sum(1 for r in righe if r["Comment(s)"])
        print(
            f"{destinazione}: {len(righe)} post, "
            f"{con_media} con media, {con_commento} con commento"
        )

    ignorati = [p["id"] for p in post if p["canale"] not in FILE_PER_CANALE]
    if ignorati:
        print(f"canale sconosciuto, saltati: {', '.join(ignorati)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
