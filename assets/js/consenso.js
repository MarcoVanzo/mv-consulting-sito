/* Riapertura del banner Cookiebot.
   Sta in un file a parte perché serve anche nelle pagine che non caricano
   main.js (informativa, errore). La documentazione di Cookiebot suggerisce
   href="javascript: Cookiebot.renew()", ma un indirizzo javascript: viene
   bloccato dalla Content-Security-Policy del sito: si aggancia da qui.

   Funziona su qualunque elemento con l'attributo data-cookie-renew. */
(function(){
  "use strict";
  var voci = document.querySelectorAll("[data-cookie-renew]");
  if(!voci.length) return;

  function pronto(){
    return window.Cookiebot && typeof window.Cookiebot.renew === "function";
  }
  function aggancia(){
    for(var i=0;i<voci.length;i++){
      voci[i].hidden = false;
      voci[i].addEventListener("click", function(e){
        e.preventDefault();
        if(pronto()) window.Cookiebot.renew();
      });
    }
  }

  if(pronto()){
    aggancia();
  } else {
    // identificativo non ancora inserito, o Cookiebot non raggiungibile:
    // la voce resta nascosta invece di non fare niente quando la si tocca
    for(var i=0;i<voci.length;i++) voci[i].hidden = true;
    window.addEventListener("CookiebotOnLoad", aggancia, {once:true});
  }
})();
