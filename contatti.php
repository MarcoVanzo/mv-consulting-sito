<?php
/**
 * Ricezione del modulo di contatto di mv-consulting.it.
 * Risponde JSON al fetch della pagina; con JavaScript disattivato
 * rimanda alla home con un parametro di esito.
 */
declare(strict_types=1);

const DESTINATARIO = 'info@mv-consulting.it';
const MITTENTE     = 'no-reply@mv-consulting.it';   // deve essere una casella del dominio
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

$intestazioni = [
    'From: MV Consulting <' . MITTENTE . '>',
    'Reply-To: ' . $nome . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: mv-consulting.it',
];

// si conta solo ciò che sarebbe partito davvero: i tentativi respinti perché
// incompleti non devono consumare il credito di chi sta ancora scrivendo
if (troppiInvii()) {
    esci(false, 'avete già inviato più messaggi di seguito: riprovate fra un\'ora, oppure scriveteci a ' . DESTINATARIO);
}

$inviata = mail(
    DESTINATARIO,
    '=?UTF-8?B?' . base64_encode('Sito: messaggio da ' . $nome) . '?=',
    $corpo,
    implode("\r\n", $intestazioni)
);

esci($inviata, $inviata ? '' : 'invio non riuscito');
