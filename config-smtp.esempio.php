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
    // L'indirizzo completo, non la sola parte prima della chiocciola.
    'utente'   => 'info@mv-consulting.it',
    'password' => 'QUI-LA-PASSWORD-DELLA-CASELLA',
];
