<?php
/**
 * Ricezione del modulo di contatto di mv-consulting.it.
 * Risponde JSON al fetch della pagina; con JavaScript disattivato
 * rimanda alla home con un parametro di esito.
 */
declare(strict_types=1);

require __DIR__ . '/invio-smtp.php';

// Dove arrivano i messaggi. È un alias, e va benissimo: la posta in entrata
// non chiede credenziali a nessuno.
const DESTINATARIO = 'info@mv-consulting.it';
// Il mittente invece non può essere un alias: l'SMTP vuole l'autenticazione, e
// un alias non ha una password. Ci si presenta con la casella vera che sta
// dietro — quella con cui si entra in webmail — e si spedisce da quella. Aruba
// rifiuta comunque un mittente diverso dall'account autenticato, quindi le due
// cose coincidono per forza: l'indirizzo sta in config-smtp.php, accanto alla
// password. A rispondere ci pensa il Reply-To, che porta a chi ha scritto.
// Le credenziali stanno fuori dal repository: vedi config-smtp.esempio.php.
const CONFIG_SMTP  = __DIR__ . '/config-smtp.php';
const MAX_LUNGHEZZA = 5000;
// Freno agli invii a raffica: l'esca qui sotto ferma i robot che compilano ogni
// campo, questo ferma chi la evita e ripete. Cinque messaggi in un'ora bastano
// a chiunque scriva davvero, anche correggendosi due o tre volte.
const MAX_INVII = 5;
const FINESTRA  = 3600;

$vuoleJson = str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');

function esci(bool $ok, string $errore = ''): never
{
    global $vuoleJson;
    if ($vuoleJson) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'error' => $errore], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: /' . ($ok ? '?inviato=1' : '?errore=1') . '#contatti', true, 303);
    }
    exit;
}

/**
 * Registra l'invio e dice se questo indirizzo ne ha già fatti troppi.
 * Il conteggio sta in un file temporaneo, con l'indirizzo ridotto a impronta:
 * non serve conservarlo in chiaro, e le righe scadono da sole dopo un'ora.
 * Se la cartella temporanea non è scrivibile non si blocca nessuno — meglio un
 * messaggio di troppo che una richiesta vera buttata via.
 */
function troppiInvii(): bool
{
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    if ($ip === '') {
        return false;
    }
    $file = sys_get_temp_dir() . '/mvc-modulo-' . hash('sha256', $ip) . '.txt';
    $ora  = time();

    $invii = [];
    if (is_readable($file)) {
        $invii = array_filter(
            array_map('intval', explode(',', (string)@file_get_contents($file))),
            static fn(int $quando): bool => $quando > $ora - FINESTRA
        );
    }
    if (count($invii) >= MAX_INVII) {
        return true;
    }
    $invii[] = $ora;
    @file_put_contents($file, implode(',', $invii), LOCK_EX);
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    esci(false, 'metodo non ammesso');
}

// campo esca: i robot lo compilano, le persone no
if (trim((string)($_POST['sito'] ?? '')) !== '') {
    esci(true);                                   // fingiamo successo, non inviamo nulla
}

$campo = static fn(string $k): string => trim(mb_substr((string)($_POST[$k] ?? ''), 0, MAX_LUNGHEZZA));

$nome      = $campo('nome');
$azienda   = $campo('azienda');
$email     = $campo('email');
$telefono  = $campo('telefono');
$messaggio = $campo('messaggio');
$origine   = $campo('origine');                   // campagna di provenienza, riempita dalla pagina
// Non è un consenso al trattamento (la base giuridica è la richiesta stessa,
// art. 6.1.b GDPR): è la conferma di aver potuto leggere l'informativa.
$presaVisione = ($_POST['consenso'] ?? '') === '1';

if ($nome === '' || $messaggio === '') {
    esci(false, 'nome e messaggio sono obbligatori');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    esci(false, 'indirizzo email non valido');
}
if (!$presaVisione) {
    esci(false, 'conferma di aver letto l\'informativa privacy');
}
// niente a capo nei campi che finiscono nelle intestazioni: evita header injection
if (preg_match('/[\r\n]/', $nome . $email)) {
    esci(false, 'dati non validi');
}

$corpo = "Nuovo messaggio dal sito mv-consulting.it\n\n"
    . "Nome:      {$nome}\n"
    . "Azienda:   " . ($azienda !== '' ? $azienda : '-') . "\n"
    . "Email:     {$email}\n"
    . "Telefono:  " . ($telefono !== '' ? $telefono : '-') . "\n"
    . "Origine:   " . ($origine !== '' ? $origine : 'diretta') . "\n"
    . "Data:      " . date('d/m/Y H:i') . "\n"
    . "IP:        " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n\n"
    . "Messaggio:\n{$messaggio}\n";

// si conta solo ciò che sarebbe partito davvero: i tentativi respinti perché
// incompleti non devono consumare il credito di chi sta ancora scrivendo
if (troppiInvii()) {
    esci(false, 'avete già inviato più messaggi di seguito: riprovate fra un\'ora, oppure scriveteci a ' . DESTINATARIO);
}

// Non si usa `mail()`: su questo hosting consegna a /usr/sbin/sendmail e non
// torna più indietro — la richiesta resta appesa fino al 504 del proxy dopo
// cinque minuti, e chi ha scritto guarda «Invio in corso...» per tutto il
// tempo. Si parla direttamente col server di posta di Aruba, che risponde in
// trenta millisecondi e, soprattutto, si può mettere sotto timeout.
if (!is_readable(CONFIG_SMTP)) {
    error_log('contatti.php: manca ' . CONFIG_SMTP . ', il modulo non può spedire');
    esci(false, 'non siamo riusciti a spedire il messaggio. Scriveteci a ' . DESTINATARIO);
}

$accesso = require CONFIG_SMTP;
// Il mittente è la casella autenticata: è l'unico che il server accetti.
$mittente = (string)($accesso['utente'] ?? '');

$intestazioni = [
    'From: MV Consulting <' . $mittente . '>',
    // Il nome va codificato come l'oggetto: un cognome accentato in chiaro
    // dentro un'intestazione rende la mail malformata.
    'Reply-To: =?UTF-8?B?' . base64_encode($nome) . '?= <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: mv-consulting.it',
];

[$inviata, $motivo] = spedisciSmtp(
    $accesso,
    $mittente,
    DESTINATARIO,
    '=?UTF-8?B?' . base64_encode('Sito: messaggio da ' . $nome) . '?=',
    $corpo,
    $intestazioni
);

if (!$inviata) {
    // il motivo vero nel log del server: a chi ha compilato il modulo non
    // servono i codici SMTP, e il nome del server di posta non lo riguarda
    error_log('contatti.php: invio non riuscito — ' . $motivo);
}

esci($inviata, $inviata ? '' : 'non siamo riusciti a spedire il messaggio. Scriveteci a ' . DESTINATARIO);
