<?php
/**
 * Modello del file di accesso alla casella di posta.
 *
 * Il file vero, `config-smtp.php`, lo scrive il deploy a ogni pubblicazione
 * leggendo i secret `SMTP_UTENTE` e `SMTP_PASSWORD`: non si carica e non si
 * modifica a mano. **Non entra nel repository**: `.gitignore` lo tiene fuori.
 * Questo modello resta come riferimento del formato, utile se un giorno si
 * volesse tornare a mettere il file sul server a mano.
 *
 * Finché PHP funziona, un file `.php` non viene mostrato come sorgente: chi lo
 * chiede dal browser riceve una pagina vuota. Per il giorno in cui l'hosting
 * perdesse il gestore PHP, `.htaccess` risponde comunque 404 a chi chiede
 * `config-smtp.php` dal browser.
 */
declare(strict_types=1);

return [
    'host'     => 'smtps.aruba.it',
    'porta'    => 465,
    // La casella **vera**, quella con cui si entra in webmail, con l'indirizzo
    // completo e non la sola parte prima della chiocciola.
    //
    // `info@mv-consulting.it` è un alias: riceve, ma non ha una password, e
    // l'SMTP l'autenticazione la pretende. Si entra quindi con la casella che
    // sta dietro l'alias. Questo indirizzo diventa anche il mittente delle
    // mail del modulo — Aruba rifiuta un mittente diverso dall'account
    // autenticato — mentre il destinatario resta `info@`, come prima.
    'utente'   => 'la-casella-vera@mv-consulting.it',
    'password' => 'QUI-LA-PASSWORD-DELLA-CASELLA',
];
