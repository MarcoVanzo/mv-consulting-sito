<?php
/**
 * Ricezione del modulo di contatto di mv-consulting.it.
 * Risponde JSON al fetch della pagina; con JavaScript disattivato
 * rimanda alla home con un parametro di esito.
 */
declare(strict_types=1);

const DESTINATARIO = 'marco@mv-consulting.it';
const MITTENTE     = 'no-reply@mv-consulting.it';   // deve essere una casella del dominio
const MAX_LUNGHEZZA = 5000;

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
$consenso  = ($_POST['consenso'] ?? '') === '1';

if ($nome === '' || $messaggio === '') {
    esci(false, 'nome e messaggio sono obbligatori');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    esci(false, 'indirizzo email non valido');
}
if (!$consenso) {
    esci(false, 'serve il consenso al trattamento dei dati');
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
    . "Data:      " . date('d/m/Y H:i') . "\n"
    . "IP:        " . ($_SERVER['REMOTE_ADDR'] ?? '-') . "\n\n"
    . "Messaggio:\n{$messaggio}\n";

$intestazioni = [
    'From: MV Consulting <' . MITTENTE . '>',
    'Reply-To: ' . $nome . ' <' . $email . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: mv-consulting.it',
];

$inviata = mail(
    DESTINATARIO,
    '=?UTF-8?B?' . base64_encode('Sito: messaggio da ' . $nome) . '?=',
    $corpo,
    implode("\r\n", $intestazioni)
);

esci($inviata, $inviata ? '' : 'invio non riuscito');
