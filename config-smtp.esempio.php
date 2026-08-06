<?php
/**
 * Modello del file di accesso alla casella di posta.
 *
 * Sul server va copiato accanto a `contatti.php` con il nome
 * `config-smtp.php` e la password vera dentro. **Non entra nel repository**:
 * `.gitignore` lo tiene fuori, e il deploy carica solo ciò che è versionato.
 * Si carica a mano via FTP una volta sola e resta lì — il deploy non cancella
 * i file che sul server trova in più.
 *
 * Unica eccezione: l'opzione `pulizia_totale` del workflow svuota la cartella
 * remota, e porterebbe via anche questo. Dopo una pulizia totale va ricaricato.
 *
 * Un file `.php` non viene mai mostrato come sorgente da Apache — chi lo chiede
 * dal browser riceve una pagina vuota, non la password. Per questo può stare
 * dentro la cartella pubblica senza rischi.
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
