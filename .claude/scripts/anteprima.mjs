// Fotografa una pagina servita in locale pilotando il Chromium dell'ambiente con
// il DevTools Protocol. Node basta a sé stesso: WebSocket è nel runtime dal 22,
// quindi niente npm, niente Playwright, coerente con un sito senza build.
//
//   node .claude/scripts/anteprima.mjs <url> <cartella> [--intera]
//
// Rispetto a `chrome --screenshot` questo emula davvero il telefono (larghezza
// CSS, densità dei pixel, evento touch): senza emulazione la home veniva
// fotografata con l'impaginato del desktop ritagliato a 390 pixel.

import { spawn } from 'node:child_process'
import { mkdir, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const [url, cartella, ...opzioni] = process.argv.slice(2)
if (!url || !cartella) {
  console.error('uso: anteprima.mjs <url> <cartella> [--intera]')
  process.exit(2)
}
const intera = opzioni.includes('--intera')

const dispositivi = [
  { nome: 'telefono', width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  { nome: 'schermo', width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
]

// Il Chromium sta in posti diversi a seconda di dove gira lo script: nella
// sandbox Linux in /opt/pw-browsers, sul Mac nella cache di Playwright o, in
// ultima istanza, nel Chrome installato a mano.
const candidati = [
  ['/opt/pw-browsers', (d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`],
  [`${process.env.HOME}/Library/Caches/ms-playwright`, (d) =>
    `${process.env.HOME}/Library/Caches/ms-playwright/${d}/chrome-mac/Chromium.app/Contents/MacOS/Chromium`],
]
let chromium = ''
for (const [dir, percorso] of candidati) {
  const trovato = await readdir(dir).catch(() => []).then((l) => l.find((d) => d.startsWith('chromium-')))
  if (trovato && existsSync(percorso(trovato))) { chromium = percorso(trovato); break }
}
if (!chromium && existsSync('/Applications/Google Chrome.app')) {
  chromium = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
}
if (!chromium) throw new Error('Chromium non trovato: né in /opt/pw-browsers, né nella cache di Playwright, né in /Applications')

const browser = spawn(chromium, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  '--force-color-profile=srgb',
  '--remote-debugging-port=0',
  'about:blank',
])

const wsUrl = await new Promise((risolvi, rifiuta) => {
  const scadenza = setTimeout(() => rifiuta(new Error('Chromium non si è avviato in 20 s')), 20000)
  let buffer = ''
  browser.stderr.on('data', (d) => {
    buffer += d
    const m = buffer.match(/DevTools listening on (ws:\/\/\S+)/)
    if (m) {
      clearTimeout(scadenza)
      risolvi(m[1])
    }
  })
  browser.on('exit', (c) => rifiuta(new Error(`Chromium è uscito con codice ${c}`)))
})

const ws = new WebSocket(wsUrl)
await new Promise((r, e) => {
  ws.addEventListener('open', r, { once: true })
  ws.addEventListener('error', e, { once: true })
})

let contatore = 0
const attese = new Map()
const ascoltatori = []
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data)
  if (msg.id && attese.has(msg.id)) {
    const { risolvi, rifiuta } = attese.get(msg.id)
    attese.delete(msg.id)
    msg.error ? rifiuta(new Error(msg.error.message)) : risolvi(msg.result)
  } else if (msg.method) {
    for (const a of ascoltatori) a(msg)
  }
})

const invia = (method, params = {}, sessionId) =>
  new Promise((risolvi, rifiuta) => {
    const id = ++contatore
    attese.set(id, { risolvi, rifiuta })
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })

const attendi = (method, timeout = 15000) =>
  new Promise((risolvi, rifiuta) => {
    const scadenza = setTimeout(() => rifiuta(new Error(`nessun ${method} entro ${timeout} ms`)), timeout)
    const a = (msg) => {
      if (msg.method !== method) return
      clearTimeout(scadenza)
      ascoltatori.splice(ascoltatori.indexOf(a), 1)
      risolvi(msg.params)
    }
    ascoltatori.push(a)
  })

const pausa = (ms) => new Promise((r) => setTimeout(r, ms))

await mkdir(cartella, { recursive: true })
const scatti = []
const avvisi = []

for (const d of dispositivi) {
  const { targetId } = await invia('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await invia('Target.attachToTarget', { targetId, flatten: true })

  await invia('Page.enable', {}, sessionId)
  await invia('Emulation.setDeviceMetricsOverride', {
    width: d.width,
    height: d.height,
    // A pagina intera il telefono darebbe un'immagine di 25 000 pixel: alla
    // densità doppia diventerebbe un file da qualche megabyte, scomodo proprio
    // dove serve — sul telefono. La pagina intera si scatta a densità 1.
    deviceScaleFactor: intera ? 1 : d.deviceScaleFactor,
    mobile: d.mobile,
    screenOrientation: { type: 'portraitPrimary', angle: 0 },
  }, sessionId)
  // maxTouchPoints deve stare fra 1 e 16 anche quando il tocco è disattivato.
  await invia('Emulation.setTouchEmulationEnabled', { enabled: d.mobile, maxTouchPoints: 5 }, sessionId)

  const caricata = attendi('Page.loadEventFired')
  await invia('Page.navigate', { url }, sessionId)
  await caricata

  // Le rivelazioni allo scroll sono legate a IntersectionObserver: senza una
  // passata fino in fondo la pagina intera verrebbe fotografata mezza invisibile.
  const valuta = async (expression) =>
    (await invia('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sessionId)).result.value

  // La passata si fa sempre, non solo a pagina intera: appena sotto la piega la
  // pagina è tutta da rivelare, e una foto scattata prima mostrerebbe il vuoto.
  // Alla fine si torna dove serve — sull'ancora se l'indirizzo ne ha una.
  await valuta(`(async () => {
    const passo = innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += passo) {
      scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    const ancora = location.hash && document.querySelector(location.hash)
    if (ancora) ancora.scrollIntoView()
    else scrollTo(0, 0)
    await new Promise((r) => setTimeout(r, 400))
  })()`)
  await pausa(600)

  // Lo sbordamento si misura provando a scorrere, non confrontando scrollWidth
  // con la finestra: con `overflow-x:hidden` sul body scrollWidth resta più
  // largo della finestra anche quando la pagina è perfettamente a posto.
  const misure = await valuta(`(() => {
    const y = scrollY
    scrollTo(200, y)
    const scorre = Math.round(scrollX)
    scrollTo(0, y)   // si rimette com'era: la prova non deve spostare l'inquadratura
    return JSON.stringify({ scorre, altezza: document.body.scrollHeight, viewport: innerWidth })
  })()`)
  const { scorre, altezza, viewport } = JSON.parse(misure)
  if (scorre > 0) {
    avvisi.push(`${d.nome}: la pagina scorre in orizzontale di ${scorre} px su ${viewport} di larghezza`)
  }

  const { data } = await invia('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: intera,
    ...(intera ? { clip: { x: 0, y: 0, width: d.width, height: Math.min(altezza, 20000), scale: 1 } } : {}),
  }, sessionId)

  const file = join(cartella, `${d.nome}${intera ? '-intera' : ''}.png`)
  await writeFile(file, Buffer.from(data, 'base64'))
  scatti.push(file)

  await invia('Target.closeTarget', { targetId })
}

ws.close()
browser.kill()

for (const f of scatti) console.log(f)
for (const a of avvisi) console.log(`AVVISO ${a}`)
