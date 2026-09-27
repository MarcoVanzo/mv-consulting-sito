#!/usr/bin/env python3
"""Rete dei riferimenti fra i file del repository.

Legge ogni file tracciato da git e registra quali altri file nomina (per
percorso o per nome). Ne ricava due cose:

  - la rete 3D in .anteprima/rete.html, da aprire nel browser;
  - l'elenco dei file che nessuno cita. Un file orfano è quasi sempre un
    residuo: `diagnostica-ftp.yml` è rimasto nel repository settimane dopo
    aver finito il suo lavoro, e l'ha rivelato proprio la rete.

    .claude/scripts/rete.py            rete + orfani
    .claude/scripts/rete.py --orfani   solo l'elenco, senza generare la pagina

Esce sempre con 0: un orfano è un indizio da guardare, non un errore.
"""
import json
import os
import re
import subprocess
import sys

RADICE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
os.chdir(RADICE)

TESTO = ('.html', '.php', '.js', '.mjs', '.py', '.css', '.md', '.sh', '.yml',
         '.json', '.htaccess', '.xml', '.txt', '.gitignore', '.svg', '.csv')

# File che nessuno deve citare perché li usa direttamente qualcun altro: il
# server web, il browser, git, Claude Code. Tutto il resto, se non è nominato
# da nessuna parte, finisce fra gli orfani.
PUNTI_DI_INGRESSO = re.compile(
    r'^(index\.html|404\.html|\.htaccess|robots\.txt|sitemap\.xml'
    r'|favicon\.(ico|svg)|apple-touch-icon\.png'
    r'|README\.md|CLAUDE\.md|\.gitignore'
    r'|\.claude/settings\.json|\.claude/commands/[^/]+\.md'
    r'|tools/.*)$'
)


def leggibile(f):
    return f.endswith(TESTO) or os.path.basename(f).startswith('.')


def rete():
    files = [f for f in subprocess.check_output(['git', 'ls-files']).decode().split('\n') if f]
    nodi, archi = [], set()
    for f in files:
        righe = 0
        if leggibile(f):
            with open(f, encoding='utf-8', errors='ignore') as h:
                righe = h.read().count('\n')
        nodi.append({'id': f, 'size': os.path.getsize(f), 'lines': righe})
    for f in files:
        # gli svg degli strumenti sono disegni, non testo che cita altri file
        if not leggibile(f) or (f.endswith('.svg') and f.startswith('tools/')):
            continue
        with open(f, encoding='utf-8', errors='ignore') as h:
            t = h.read()
        for g in files:
            b = os.path.basename(g)
            # nomi troppo corti ("a.js") darebbero falsi collegamenti
            if g == f or len(b) < 5:
                continue
            if g in t or re.search(r'(?<![\w.-])' + re.escape(b) + r'(?![\w-])', t):
                archi.add((f, g))
    return nodi, sorted(archi)


def main():
    nodi, archi = rete()
    citati = {b for a, b in archi}
    orfani = [n['id'] for n in nodi if n['id'] not in citati and not PUNTI_DI_INGRESSO.match(n['id'])]

    if '--orfani' not in sys.argv:
        with open(os.path.join(os.path.dirname(__file__), 'rete.html'), encoding='utf-8') as h:
            modello = h.read()
        uscita = os.path.join(RADICE, '.anteprima')
        os.makedirs(uscita, exist_ok=True)
        pagina = os.path.join(uscita, 'rete.html')
        with open(pagina, 'w', encoding='utf-8') as h:
            h.write(modello.replace('__DATA__', json.dumps({'nodes': nodi, 'edges': archi})))
        print(f'{len(nodi)} file, {len(archi)} riferimenti -> {pagina}')

    if orfani:
        print('File che nessuno cita:')
        for f in orfani:
            print(f'  ? {f}')
    else:
        print('Nessun file orfano.')


if __name__ == '__main__':
    main()
