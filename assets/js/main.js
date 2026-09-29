(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Divide un testo in parole avvolte in <span class="cls">, lasciando gli
     spazi fra una e l'altra: così vanno a capo come prima. Gli elementi figli
     (lo <span class="grad"> del titolo) vengono aperti e le loro parole
     prendono anche la classe `extra`. */
  function parole(el, cls, extra){
    var n = 0;
    (function giu(nodo, piu){
      Array.prototype.slice.call(nodo.childNodes).forEach(function(c){
        if(c.nodeType === 1){ giu(c, extra); return; }
        if(c.nodeType !== 3) return;
        var fr = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(function(p){
          if(!p) return;
          if(/^\s+$/.test(p)){ fr.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement("span");
          s.className = cls + (piu ? " " + piu : "");
          s.style.setProperty("--i", n++);
          s.textContent = p;
          fr.appendChild(s);
        });
        nodo.replaceChild(fr, c);
      });
    })(el, "");
    return n;
  }

  /* titolo della hero: parola per parola. Resta .rv, quindi la rete di
     sicurezza in testa alla pagina vale anche qui. */
  var h1 = document.querySelector(".hero h1");
  if(h1 && !reduce){ parole(h1, "wd", "g"); h1.classList.add("split"); }


  /* ---- rivelazione allo scroll ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target;
      el.classList.add("in");
      io.unobserve(el);
      // il ritardo a scalare serve solo alla comparsa: lasciato lì, rallenterebbe
      // anche le reazioni al passaggio del mouse
      setTimeout(function(){ el.style.transitionDelay = ""; }, 1200);
    });
  }, {rootMargin:"0px 0px -12% 0px", threshold:.15});

  var rvs = document.querySelectorAll(".rv");
  for(var i=0;i<rvs.length;i++){
    rvs[i].style.transitionDelay = ((i % 4) * 70) + "ms";
    io.observe(rvs[i]);
  }
  document.querySelectorAll("[data-viz]").forEach(function(v){ io.observe(v); });

  /* Se la pagina si carica mentre la scheda è in secondo piano — link aperto in
     un'altra scheda, telefono con lo schermo spento — IntersectionObserver non
     emette niente e al ritorno non recupera: il contenuto resterebbe invisibile.
     Al primo momento in cui la pagina si vede si rivela a mano quel che è già
     dentro lo schermo. */
  document.addEventListener("visibilitychange", function(){
    if(document.visibilityState !== "visible") return;
    for(var j=0;j<rvs.length;j++){
      var r = rvs[j].getBoundingClientRect();
      if(r.top < window.innerHeight && r.bottom > 0){
        rvs[j].classList.add("in");
        io.unobserve(rvs[j]);
      }
    }
  });

  /* ---- conteggio numeri ---- */
  var cio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, txt = el.getAttribute("data-text");
      if(txt){ el.textContent = txt; return; }
      var to = parseInt(el.getAttribute("data-count"),10), t0 = null;
      if(reduce){ el.textContent = to; return; }
      requestAnimationFrame(function step(ts){
        if(!t0) t0 = ts;
        var p = Math.min(1,(ts-t0)/900);
        el.textContent = Math.round(to * (1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(step);
      });
    });
  },{threshold:.6});
  document.querySelectorAll("[data-count],[data-text]").forEach(function(e){ cio.observe(e); });

  /* ---- barra di avanzamento + nav ---- */
  var prog = document.getElementById("prog"), nav = document.getElementById("nav");
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h>0 ? (window.scrollY/h)*100 : 0) + "%";
    nav.classList.toggle("stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, {passive:true}); onScroll();

  /* ---- altezza reale della barra fissa ----
     Serve a due cose: far fermare le ancore sotto la barra invece che dietro,
     e far partire il menu del telefono esattamente dal suo bordo inferiore.
     La barra si restringe allo scroll, quindi va rimisurata. */
  function misuraNav(){
    document.documentElement.style.setProperty("--navh", Math.round(nav.getBoundingClientRect().height) + "px");
  }
  misuraNav();
  window.addEventListener("resize", misuraNav);
  window.addEventListener("scroll", misuraNav, {passive:true});

  /* ---- menu del telefono ---- */
  var burger = document.getElementById("burger"), menu = document.getElementById("menu");
  if(burger && menu){
    var apri = function(){
      menu.hidden = false;
      requestAnimationFrame(function(){ menu.classList.add("open"); });
      burger.setAttribute("aria-expanded","true");
      burger.setAttribute("aria-label","Chiudi il menu");
      document.body.classList.add("locked");
    };
    var chiudi = function(torna){
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded","false");
      burger.setAttribute("aria-label","Apri il menu");
      document.body.classList.remove("locked");
      setTimeout(function(){ menu.hidden = true; }, reduce ? 0 : 250);
      if(torna) burger.focus();
    };
    burger.addEventListener("click", function(){
      burger.getAttribute("aria-expanded") === "true" ? chiudi(false) : apri();
    });
    menu.addEventListener("click", function(e){
      if(e.target.closest("a")) chiudi(false);      // scelta una voce, il menu se ne va
    });
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") chiudi(true);
    });
    // tornando al desktop il menu non deve restare aperto sopra la pagina
    window.matchMedia("(min-width:901px)").addEventListener("change", function(e){
      if(e.matches && burger.getAttribute("aria-expanded") === "true") chiudi(false);
    });
  }

  /* ---- richiamo fisso in basso sul telefono ----
     Compare quando la hero è passata e si toglie di mezzo sul modulo. */
  var ctaBar = document.getElementById("ctaBar");
  if(ctaBar){
    var oltreHero = false, suModulo = false;
    var aggiornaBarra = function(){
      var mostra = oltreHero && !suModulo;
      ctaBar.hidden = false;
      ctaBar.classList.toggle("show", mostra);
    };
    new IntersectionObserver(function(es){
      oltreHero = !es[0].isIntersecting; aggiornaBarra();
    }, {threshold:0}).observe(document.querySelector(".hero"));
    new IntersectionObserver(function(es){
      suModulo = es[0].isIntersecting; aggiornaBarra();
    }, {threshold:0}).observe(document.getElementById("contatti"));
  }

  /* ---- anno nel piè di pagina ---- */
  var anno = document.getElementById("anno");
  if(anno) anno.textContent = String(new Date().getFullYear());

  /* ---- voce del menu della sezione in vista ----
     Una sezione è «in vista» quando attraversa la fascia al 40% dell'altezza
     dello schermo: è dove l'occhio legge, non il bordo in alto. */
  var voci = {};
  document.querySelectorAll(".nav-links.desktop a[href^='#']:not(.btn)").forEach(function(a){
    voci[a.getAttribute("href").slice(1)] = a;
  });
  var spia = new IntersectionObserver(function(es){
    es.forEach(function(e){
      var a = voci[e.target.id];
      if(!a) return;
      if(e.isIntersecting){
        Object.keys(voci).forEach(function(k){ voci[k].classList.remove("on"); });
        a.classList.add("on");
      } else a.classList.remove("on");
    });
  }, {rootMargin:"-40% 0px -59% 0px"});
  Object.keys(voci).forEach(function(id){
    var sez = document.getElementById(id);
    if(sez) spia.observe(sez);
  });

  /* ---- nastro dei clienti ----
     La riga si copia finché due copie coprono lo schermo, poi scorre di una
     copia: il punto d'arrivo coincide con quello di partenza e non si vede
     lo stacco. Le copie sono nascoste ai lettori di schermo. */
  var nastro = document.querySelector(".marquee");
  if(nastro && !reduce){
    var set = nastro.querySelector(".marquee-set");
    nastro.classList.add("run");   // prima di misurare: in fila, non a capo
    var giri = 0;
    while(set.children.length < 24 && set.scrollWidth < window.innerWidth * 1.1 && giri++ < 4){
      Array.prototype.slice.call(set.children, 0, 6).forEach(function(li){
        var c = li.cloneNode(true); c.setAttribute("aria-hidden","true"); set.appendChild(c);
      });
    }
    var copia = set.cloneNode(true);
    copia.setAttribute("aria-hidden","true");
    nastro.appendChild(copia);
    nastro.style.setProperty("--dur", Math.max(24, Math.round(set.scrollWidth / 45)) + "s");
  }

  /* ---- citazione del founder: le parole si accendono leggendo ---- */
  var cit = document.querySelector(".founder blockquote");
  if(cit && !reduce){
    var tot = parole(cit, "wq"), accese = -1;
    var wq = cit.querySelectorAll(".wq");
    var leggi = function(){
      var r = cit.getBoundingClientRect(), vh = window.innerHeight;
      // da quando il blocco entra dal basso a quando arriva a un terzo dello schermo
      var p = (vh * 0.9 - r.top) / (vh * 0.9 - vh * 0.3 + r.height * 0.5);
      var n = Math.round(Math.max(0, Math.min(1, p)) * tot);
      if(n === accese) return;
      accese = n;
      for(var k=0;k<tot;k++) wq[k].classList.toggle("lit", k < n);
    };
    window.addEventListener("scroll", leggi, {passive:true});
    window.addEventListener("resize", leggi);
    leggi();
  }

  /* ---- luci che seguono il puntatore (solo con un mouse) ---- */
  if(mouse && !reduce){
    // schede: la posizione del puntatore diventa --mx / --my
    document.querySelectorAll(".area, .step, .quote").forEach(function(el){
      el.addEventListener("pointermove", function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
    // hero: una luce morbida sotto il cursore
    var hero = document.querySelector(".hero"), bg = hero && hero.querySelector(".hero-bg");
    if(hero && bg){
      hero.addEventListener("pointermove", function(e){
        var r = hero.getBoundingClientRect();
        bg.style.setProperty("--hx", (e.clientX - r.left) + "px");
        bg.style.setProperty("--hy", (e.clientY - r.top) + "px");
        hero.classList.add("lit");
      });
      hero.addEventListener("pointerleave", function(){ hero.classList.remove("lit"); });
    }
    // scheda dimostrativa: inclinazione di qualche grado verso il puntatore.
    // Mentre si trascina il cursore dell'avanzamento resta ferma.
    var demo = document.getElementById("demo"), trascina = false;
    if(demo){
      demo.addEventListener("pointerdown", function(){ trascina = true; });
      window.addEventListener("pointerup", function(){ trascina = false; });
      demo.addEventListener("pointermove", function(e){
        if(trascina) return;
        var r = demo.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        demo.classList.add("tilt");
        demo.style.transform = "perspective(1100px) rotateX(" + (-y * 5).toFixed(2) + "deg) rotateY(" + (x * 6).toFixed(2) + "deg)";
      });
      demo.addEventListener("pointerleave", function(){
        demo.classList.remove("tilt");
        demo.style.transform = "";
      });
    }
  }

  /* ---- demo: documenti che diventano dati ---- */
  var cv = document.getElementById("cv"), ctx = cv.getContext("2d");
  var scrub = document.getElementById("sc"), pct = document.getElementById("demoPct");
  var tagA = document.getElementById("tagA"), tagB = document.getElementById("tagB");
  var W=0, H=0, DPR = Math.min(window.devicePixelRatio||1, 2);
  var N = 108, items = [], t = 0, target = 0, auto = false, rnd = 1;

  function rand(){ rnd = (rnd*16807) % 2147483647; return rnd/2147483647; }

  function build(){
    var box = cv.parentNode.getBoundingClientRect();
    W = box.width; H = box.height;
    cv.width = W*DPR; cv.height = H*DPR;
    ctx.setTransform(DPR,0,0,DPR,0,0);
    items.length = 0; rnd = 1;
    var cols = 4, rows = Math.ceil(N/cols);
    var gw = Math.min(W*0.52, 300), gh = Math.min(H*0.78, 250);
    var ox = W*0.5 - gw/2, oy = H/2 - gh/2;
    var cw = gw/cols, ch = gh/rows;
    for(var i=0;i<N;i++){
      var c = i % cols, r = (i/cols)|0;
      items.push({
        x0: W*0.12 + rand()*W*0.76,
        y0: H*0.1 + rand()*H*0.8,
        a0: (rand()-0.5)*1.5,
        w0: 13 + rand()*8,
        x1: ox + c*cw + cw*0.5,
        y1: oy + r*ch + ch*0.5,
        w1: cw*0.78,
        h1: Math.max(2.5, ch*0.34),
        d: rand()*0.42,
        lit: rand() > 0.55
      });
    }
  }

  function ease(p){ return p<0 ? 0 : p>1 ? 1 : 1-Math.pow(1-p,3); }

  function draw(){
    ctx.clearRect(0,0,W,H);
    for(var i=0;i<items.length;i++){
      var it = items[i];
      var p = ease((t - it.d) / (1 - it.d + 0.001));
      var x = it.x0 + (it.x1-it.x0)*p;
      var y = it.y0 + (it.y1-it.y0)*p;
      var ang = it.a0*(1-p);
      var w = it.w0 + (it.w1-it.w0)*p;
      var h = (it.w0*1.38) + (it.h1 - it.w0*1.38)*p;
      ctx.save();
      ctx.translate(x,y); ctx.rotate(ang);
      var al = 0.30 + 0.62*p;
      // il disordine di partenza è ambra spenta, l'ordine di arrivo è blu: il
      // colore racconta il passaggio da solo, senza bisogno di leggere le targhe
      if(p < 0.5){
        ctx.fillStyle = "rgba(168,146,120," + (0.26 + 0.3*p) + ")";
        ctx.strokeStyle = "rgba(168,146,120,0.45)";
      } else {
        var q = (p-0.5)*2;
        ctx.fillStyle = it.lit
          ? "rgba(66,157,218," + (0.28 + 0.55*q) + ")"
          : "rgba(146,152,156," + (0.30 + 0.14*q) + ")";
        ctx.strokeStyle = "rgba(66,157,218," + (0.18*q) + ")";
      }
      ctx.globalAlpha = al;
      var rr = Math.min(2, h/3);
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(-w/2,-h/2,w,h,rr);
      else ctx.rect(-w/2,-h/2,w,h);
      ctx.fill();
      if(p < 0.55){ ctx.lineWidth = 0.7; ctx.stroke(); }
      ctx.restore();
    }
    // riga guida della struttura finale
    if(t > 0.55){
      var g = (t-0.55)/0.45;
      ctx.strokeStyle = "rgba(66,157,218," + (0.16*g) + ")";
      ctx.lineWidth = 1;
      var gw2 = Math.min(W*0.52,300), ox2 = W*0.5 - gw2/2;
      ctx.beginPath();
      ctx.moveTo(ox2 - 14, H*0.11); ctx.lineTo(ox2 - 14, H*0.89);
      ctx.moveTo(ox2 + gw2 + 14, H*0.11); ctx.lineTo(ox2 + gw2 + 14, H*0.89);
      ctx.stroke();
    }
  }

  function paint(){
    pct.textContent = Math.round(t*100) + "%";
    tagA.style.opacity = String(Math.max(0.25, 1 - t*1.5));
    tagB.style.opacity = String(Math.max(0.25, t*1.5 - 0.2));
    tagB.style.transform = "translateX(" + (10 - t*10).toFixed(1) + "px)";
    draw();
  }

  function loop(){
    if(auto){
      t += (target - t) * 0.055;
      if(Math.abs(target-t) < 0.002){ t = target; auto = false; }
      scrub.value = String(Math.round(t*1000));
      paint();
      requestAnimationFrame(loop);
    }
  }

  scrub.addEventListener("input", function(){
    auto = false; t = parseInt(scrub.value,10)/1000; paint();
  });

  var started = false;
  var dio = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting || started) return;
      started = true;
      if(reduce){ t = 1; scrub.value = "1000"; paint(); return; }
      setTimeout(function(){ target = 1; auto = true; loop(); }, 480);
    });
  },{threshold:.35});

  function init(){ build(); paint(); }
  init();
  dio.observe(document.getElementById("demo"));

  var rt;
  window.addEventListener("resize", function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ build(); paint(); }, 160);
  });

  /* =======================================================================
     Provenienza della visita, senza cookie.

     Chi arriva da un annuncio porta i parametri utm_* (o gclid/fbclid) nell'
     indirizzo. Li leggiamo una sola volta, li teniamo in una variabile — non
     sul dispositivo dell'utente — e li accodiamo al messaggio del modulo.
     Così si sa quale campagna ha prodotto la richiesta anche senza consenso
     e senza alcuno strumento di tracciamento.
     ======================================================================= */
  var origine = (function(){
    var q = new URLSearchParams(window.location.search), pezzi = [];
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gclid","fbclid","li_fat_id"]
      .forEach(function(k){ if(q.get(k)) pezzi.push(k.replace("utm_","") + "=" + q.get(k).slice(0,80)); });
    if(!pezzi.length && document.referrer){
      try{
        var host = new URL(document.referrer).hostname;
        if(host && host !== window.location.hostname) pezzi.push("da=" + host);
      }catch(_){}
    }
    return pezzi.join(" · ");
  })();
  var campoOrigine = document.getElementById("f-origine");
  if(campoOrigine) campoOrigine.value = origine;

  /* =======================================================================
     Consenso.

     Il permesso lo gestisce Cookiebot, e gli strumenti li carica direttamente
     l'HTML: i tag di Analytics, Meta e LinkedIn in testa alla pagina sono
     marcati "type=text/plain data-cookieconsent=..." e Cookiebot li accende
     solo per le categorie accettate. Qui non serve replicare quel meccanismo:
     serve solo poter mandare qualche evento a chi e' gia' partito.
     ======================================================================= */

  /* La voce «Preferenze cookie» del piè di pagina la gestisce consenso.js,
     che serve anche alle pagine senza questo file. */

  /* Un evento solo, con lo stesso nome per tutti i servizi avviati:
     i pulsanti del sito lo chiamano senza sapere che cosa c'è sotto. */
  function evento(nome, dati){
    if(window.gtag) window.gtag("event", nome, dati || {});
    if(window.fbq)  window.fbq("trackCustom", nome, dati || {});
  }

  /* i richiami al contatto segnalano l'intenzione, non l'identità */
  document.addEventListener("click", function(e){
    var el = e.target.closest("[data-cta]");
    if(el) evento("contatto_cta", {posizione: el.getAttribute("data-cta")});
  });

  /* ---- invio del modulo senza ricaricare la pagina ---- */
  var form = document.getElementById("contatto"), msg = document.getElementById("formMsg");
  if(form){
    form.addEventListener("submit", function(e){
      // Il modulo ha novalidate: il browser non mostra i suoi messaggi da solo e
      // senza questo blocco un campo mancante faceva partire l'invio classico,
      // che rimanda alla home con un parametro che nessuna pagina legge — la
      // pagina si ricaricava e basta. Si chiede al browser di dirlo lui.
      if(!form.checkValidity()){ e.preventDefault(); form.reportValidity(); return; }
      e.preventDefault();
      var btn = form.querySelector("button");
      btn.disabled = true; btn.textContent = "Invio in corso...";
      msg.className = "form-msg"; msg.textContent = "";
      fetch(form.action, {method:"POST", body:new FormData(form), headers:{"Accept":"application/json"}})
        .then(function(r){ return r.json().catch(function(){ throw new Error("risposta non valida"); }); })
        .then(function(j){
          if(!j.ok){
            // il motivo arriva dal server ed è rivolto a chi scrive ("indirizzo
            // email non valido"): va mostrato, non sostituito da un generico
            var er = new Error(j.error || "invio non riuscito"); er.dalServer = true; throw er;
          }
          form.reset();
          if(campoOrigine) campoOrigine.value = origine;   // reset() svuota anche i campi nascosti
          msg.className = "form-msg ok";
          msg.textContent = "Messaggio inviato. Vi rispondiamo entro un giorno lavorativo.";
          msg.focus && msg.focus();
          evento("richiesta_inviata", {origine: origine || "diretta"});
        })
        .catch(function(err){
          msg.className = "form-msg ko";
          if(err && err.dalServer){
            msg.textContent = "Messaggio non inviato: " + err.message + ".";
          } else {
            msg.innerHTML = 'Non siamo riusciti a inviare il messaggio. Scriveteci a <a href="mailto:info@mv-consulting.it">info@mv-consulting.it</a>.';
          }
        })
        .then(function(){ btn.disabled = false; btn.textContent = "Invia il messaggio"; });
    });
  }
})();
