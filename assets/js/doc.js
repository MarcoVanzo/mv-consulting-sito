/* Documenti legali: barra di navigazione che si stacca e sommario che segue la
   lettura. Sta in un file a parte perché main.js dà per scontati elementi che
   qui non esistono (la demo animata della home). */
(function(){
  "use strict";

  var nav = document.getElementById("nav");
  if(nav){
    var stuck = function(){ nav.classList.toggle("stuck", window.scrollY > 8); };
    stuck();
    window.addEventListener("scroll", stuck, {passive:true});
  }

  var links = document.querySelectorAll(".toc a");
  if(!links.length || !("IntersectionObserver" in window)) return;

  var mappa = {};
  links.forEach(function(a){
    var s = document.querySelector(a.getAttribute("href"));
    if(s) mappa[s.id] = a;
  });

  /* La sezione «attiva» è quella più in alto fra quelle visibili: la fascia di
     osservazione parte sotto la barra fissa e si ferma a metà schermo, così la
     voce cambia quando il titolo arriva in lettura, non quando esce di sotto. */
  var visibili = {};
  var io = new IntersectionObserver(function(voci){
    voci.forEach(function(v){ visibili[v.target.id] = v.isIntersecting; });
    var attiva = null;
    Object.keys(mappa).forEach(function(id){
      if(!attiva && visibili[id]) attiva = id;
    });
    links.forEach(function(a){ a.classList.remove("on"); });
    if(attiva) mappa[attiva].classList.add("on");
  }, {rootMargin:"-96px 0px -50% 0px", threshold:0});

  Object.keys(mappa).forEach(function(id){ io.observe(document.getElementById(id)); });
})();
