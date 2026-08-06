<?php
/**
 * Invio di un messaggio di testo via SMTP autenticato.
 *
 * Esiste perché su questo hosting `mail()` non torna indietro: consegna il
 * messaggio a /usr/sbin/sendmail e resta appesa finché il proxy non chiude la
 * connessione dopo cinque minuti. Una funzione di libreria non si può
 * interrompere; un socket sì, e il timeout qui sotto è la ragione principale
 * di questo file — più ancora della consegna. Qualunque cosa vada storta, chi
 * ha scritto riceve una risposta entro pochi secondi.
 *
 * Il server di posta di Aruba (`smtps.aruba.it:465`) risponde in trenta
 * millisecondi e dichiara `AUTH LOGIN PLAIN`: si apre il canale in SSL, ci si
 * autentica con la casella del dominio e si consegna. Niente librerie: sono
 * sei comandi in fila, e il protocollo non è cambiato dal 1982.
 */
declare(strict_types=1);

const SMTP_TIMEOUT = 10;

/**
 * Legge una risposta del server, anche su più righe.
 * Nel protocollo le righe intermedie hanno un trattino dopo il codice
 * (`250-AUTH`), l'ultima uno spazio (`250 OK`): si legge finché non arriva
 * quella con lo spazio.
 */
function smtpLeggi($canale): array
{
    $testo = '';
    while (($riga = fgets($canale, 2048)) !== false) {
        $testo .= $riga;
        if (preg_match('/^(\d{3}) /', $riga, $m)) {
            return [(int)$m[1], trim($testo)];
        }
    }
    return [0, trim($testo) !== '' ? trim($testo) : 'il server ha chiuso senza rispondere'];
}

/**
 * Manda un comando e pretende un codice di risposta preciso.
 * Se arriva altro, si ferma qui: proseguire su un canale che ha già detto no
 * significa solo scoprirlo più tardi e con un errore meno chiaro.
 */
function smtpComando($canale, string $comando, int $atteso, string $passo): void
{
    if ($comando !== '') {
        fwrite($canale, $comando . "\r\n");
    }
    [$codice, $testo] = smtpLeggi($canale);
    if ($codice !== $atteso) {
        // la password non finisce mai nel messaggio: il comando che la porta
        // viene riferito per nome, non per contenuto
        throw new RuntimeException("$passo: il server ha risposto « " . $testo . " »");
    }
}

/**
 * Spedisce e dice come è andata: [riuscito, motivo].
 * Il motivo è per chi legge i log, non per chi ha compilato il modulo: può
 * contenere il nome del server e il codice di errore.
 *
 * @param array{host:string,porta:int,utente:string,password:string} $accesso
 * @param array<string> $intestazioni righe già formate, senza a capo finale
 */
function spedisciSmtp(array $accesso, string $da, string $a, string $oggetto, string $corpo, array $intestazioni = []): array
{
    $errno = 0;
    $errstr = '';
    $canale = @stream_socket_client(
        'ssl://' . $accesso['host'] . ':' . $accesso['porta'],
        $errno,
        $errstr,
        SMTP_TIMEOUT
    );

    if ($canale === false) {
        return [false, 'connessione non riuscita: ' . ($errstr !== '' ? $errstr : "errno $errno")];
    }

    // Vale per ogni lettura: senza, una risposta che non arriva riporterebbe
    // il modulo esattamente al problema che questo file esiste per risolvere.
    stream_set_timeout($canale, SMTP_TIMEOUT);

    try {
        smtpComando($canale, '', 220, 'saluto');
        smtpComando($canale, 'EHLO ' . ($_SERVER['SERVER_NAME'] ?? 'localhost'), 250, 'presentazione');

        smtpComando($canale, 'AUTH LOGIN', 334, 'richiesta di accesso');
        smtpComando($canale, base64_encode($accesso['utente']), 334, 'nome utente');
        smtpComando($canale, base64_encode($accesso['password']), 235, 'accesso');

        smtpComando($canale, 'MAIL FROM:<' . $da . '>', 250, 'mittente');
        smtpComando($canale, 'RCPT TO:<' . $a . '>', 250, 'destinatario');
        smtpComando($canale, 'DATA', 354, 'apertura del messaggio');

        $righe = array_merge(
            [
                'Date: ' . date('r'),
                'To: ' . $a,
                'Subject: ' . $oggetto,
                'MIME-Version: 1.0',
            ],
            $intestazioni
        );

        // Un punto da solo a inizio riga chiude il messaggio: nel corpo va
        // raddoppiato, o un messaggio che contiene una riga «.» arriverebbe
        // troncato lì.
        $testo = implode("\r\n", $righe) . "\r\n\r\n"
            . preg_replace('/^\./m', '..', str_replace(["\r\n", "\n"], "\r\n", $corpo));

        fwrite($canale, $testo . "\r\n.\r\n");
        smtpComando($canale, '', 250, 'consegna');

        fwrite($canale, "QUIT\r\n");
        fclose($canale);
        return [true, ''];
    } catch (RuntimeException $e) {
        @fclose($canale);
        return [false, $e->getMessage()];
    }
}
