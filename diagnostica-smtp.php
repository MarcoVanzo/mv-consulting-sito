<?php
/**
 * File temporaneo. Serve a capire perché mail() resta appesa su questo hosting
 * e se il PHP di Aruba può parlare col loro server di posta. Non spedisce
 * niente, non chiede credenziali, non tocca il modulo di contatto: apre una
 * connessione, legge il saluto del server e chiude.
 *
 * Va rimosso appena letta la risposta.
 */
declare(strict_types=1);

const CHIAVE = 'dae5f405cc0e2eb4';

if (($_GET['chiave'] ?? '') !== CHIAVE) {
    http_response_code(404);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

/**
 * Apre il canale, legge il saluto, si presenta e riporta cosa ha risposto.
 * Il timeout è la ragione stessa della prova: qualunque esito, si torna
 * indietro in pochi secondi invece di restare appesi come mail().
 */
function prova(string $indirizzo, int $timeout = 10): array
{
    $inizio = microtime(true);
    $errno = 0;
    $errstr = '';
    $canale = @stream_socket_client($indirizzo, $errno, $errstr, $timeout);

    if ($canale === false) {
        return [
            'aperto'  => false,
            'errore'  => $errstr !== '' ? $errstr : "errno $errno",
            'secondi' => round(microtime(true) - $inizio, 2),
        ];
    }

    stream_set_timeout($canale, $timeout);
    $saluto = (string)fgets($canale, 1024);

    fwrite($canale, "EHLO www.mv-consulting.it\r\n");
    $risposta = '';
    while (($riga = fgets($canale, 1024)) !== false) {
        $risposta .= $riga;
        // le righe intermedie hanno un trattino dopo il codice: 250-AUTH, 250 OK
        if (preg_match('/^\d{3} /', $riga)) {
            break;
        }
    }

    fwrite($canale, "QUIT\r\n");
    fclose($canale);

    return [
        'aperto'  => true,
        'saluto'  => trim($saluto),
        'ehlo'    => array_values(array_filter(array_map('trim', explode("\n", $risposta)))),
        'secondi' => round(microtime(true) - $inizio, 2),
    ];
}

echo json_encode([
    'php'      => PHP_VERSION,
    'openssl'  => extension_loaded('openssl'),
    // Come è configurato l'invio di posta: se sendmail_path è vuoto e SMTP
    // punta a un host che non risponde, mail() non può che restare appesa.
    'mail_ini' => [
        'sendmail_path' => ini_get('sendmail_path'),
        'SMTP'          => ini_get('SMTP'),
        'smtp_port'     => ini_get('smtp_port'),
        'mail_esiste'   => function_exists('mail'),
    ],
    'canali'   => [
        'ssl://smtps.aruba.it:465'     => prova('ssl://smtps.aruba.it:465'),
        'tcp://smtp.aruba.it:587'      => prova('tcp://smtp.aruba.it:587'),
        'tcp://localhost:25'           => prova('tcp://localhost:25', 5),
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
