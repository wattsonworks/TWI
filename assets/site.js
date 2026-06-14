/* ============================================================
   The Way Inn — shared site engine (all pages)
   i18n (EN default + HE toggle), Lenis, mega-menu, solar clock,
   reveals. Exposes window.TWI for per-page scene scripts.
   ============================================================ */
(function(){
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var desktop = window.matchMedia("(min-width: 1041px)").matches;
  var hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (reduced || !hasGSAP) document.documentElement.classList.add("no-motion");
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  var motion = hasGSAP && !reduced;

  /* ---------------- i18n (dual-attribute) ---------------- */
  var LANG_KEY = "twi-lang";
  var lang = "en";
  try { lang = localStorage.getItem(LANG_KEY) || "en"; } catch (e) {}
  if (lang !== "he" && lang !== "en") lang = "en";
  var langCbs = [];
  var ATTRS = ["alt", "aria-label", "placeholder", "title", "content"];

  function applyLang(l){
    lang = (l === "he") ? "he" : "en";
    var de = document.documentElement;
    de.setAttribute("lang", lang);
    de.setAttribute("dir", lang === "he" ? "rtl" : "ltr");
    document.querySelectorAll("[data-he]").forEach(function(el){
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === "he" ? el.dataset.he : el.dataset.en;
    });
    ATTRS.forEach(function(a){
      document.querySelectorAll("[data-he-" + a + "]").forEach(function(el){
        var enKey = "en-" + a;
        if (el.dataset[camel(enKey)] === undefined) el.dataset[camel(enKey)] = el.getAttribute(a) || "";
        el.setAttribute(a, lang === "he" ? el.getAttribute("data-he-" + a) : el.dataset[camel(enKey)]);
      });
    });
    document.querySelectorAll("[data-lang-btn]").forEach(function(b){
      b.querySelectorAll("[data-l]").forEach(function(s){ s.classList.toggle("off", s.getAttribute("data-l") !== lang); });
      b.setAttribute("aria-label", lang === "he" ? "Switch to English" : "החלפה לעברית");
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    langCbs.forEach(function(fn){ try { fn(lang); } catch (e) {} });
  }
  function camel(s){ return s.replace(/-([a-z])/g, function(m, c){ return c.toUpperCase(); }); }
  function t(en, he){ return lang === "he" ? he : en; }
  function toggleLang(){ applyLang(lang === "he" ? "en" : "he"); }

  /* ---------------- Safed solar time ---------------- */
  var SAFED_LAT = 32.9655 * Math.PI / 180;
  function safedNow(){
    var parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jerusalem", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", hour12: false }).formatToParts(new Date());
    var get = function(t){ var p = parts.find(function(x){ return x.type === t; }); return p ? p.value : ""; };
    var h = parseInt(get("hour"), 10) % 24, m = parseInt(get("minute"), 10);
    var day = parseInt(get("day"), 10), mon = parseInt(get("month"), 10), yr = parseInt(get("year"), 10);
    var N = Math.floor((Date.UTC(yr, mon - 1, day) - Date.UTC(yr, 0, 1)) / 864e5) + 1;
    var decl = 23.45 * Math.PI / 180 * Math.sin(2 * Math.PI * (284 + N) / 365);
    var u = new Date();
    var solarH = u.getUTCHours() + u.getUTCMinutes() / 60 + 35.494 / 15;
    var ha = (solarH - 12) * 15 * Math.PI / 180;
    var elev = Math.asin(Math.sin(SAFED_LAT) * Math.sin(decl) + Math.cos(SAFED_LAT) * Math.cos(decl) * Math.cos(ha)) * 180 / Math.PI;
    return { h: h, m: m, yr: yr, mon: mon, day: day, elev: elev, hhmm: (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m) };
  }
  function startDarkness(e){ if (e > 15) return 0; if (e > 0) return (15 - e) / 15 * 0.45; if (e > -10) return 0.45 + (-e) / 10 * 0.40; return 0.85; }
  var now, startD = 0.85;
  try { now = safedNow(); startD = startDarkness(now.elev); }
  catch (e) { var lf = new Date(); now = { h: lf.getHours(), m: lf.getMinutes(), yr: lf.getFullYear(), mon: lf.getMonth() + 1, day: lf.getDate(), elev: -20, hhmm: "—:—" }; }
  function clockState(e, h){
    if (e > 15) return t("high sun over the Galilee", "השמש גבוהה מעל ההרים");
    if (e > 0)  return t("low sun over the hills", "השמש נמוכה מעל הגליל");
    if (h < 4 || h >= 21) return t("a quiet Safed night", "לילה שקט בצפת");
    if (h < 8) return t("almost morning", "עוד מעט בוקר");
    return t("the sun has set", "השמש שקעה מעבר לרכס");
  }
  function tickClock(){
    if (document.hidden) return;
    try {
      var n = safedNow();
      document.querySelectorAll("[data-clock-text]").forEach(function(el){ el.textContent = t("Now in Safed", "עכשיו בצפת") + " · " + n.hhmm; });
    } catch (e) {}
  }

  /* ---------------- Lenis + smooth anchors ---------------- */
  var lenis = null, ready = false;
  if (motion && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function(t){ lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollTo(target){
    if (lenis) lenis.scrollTo(target, { offset: -64, duration: 1.3 });
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click", function(e){
      var href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      var tg = document.querySelector(href); if (!tg) return;
      e.preventDefault(); closeMobile();
      scrollTo(tg); tg.setAttribute("tabindex", "-1"); tg.focus({ preventScroll: true });
    });
  });

  /* ---------------- header state ---------------- */
  var head = document.querySelector("[data-head]");
  var solidFromTop = head && head.hasAttribute("data-solid");
  function headState(){ if (head && !solidFromTop) head.classList.toggle("is-solid", window.scrollY > window.innerHeight * 0.7); }
  if (head && !solidFromTop) { window.addEventListener("scroll", headState, { passive: true }); headState(); }

  /* ---------------- desktop dropdowns ---------------- */
  document.querySelectorAll(".nav-item .nav-link[aria-haspopup]").forEach(function(btn){
    var dd = btn.parentNode.querySelector(".dropdown");
    if (!dd) return;
    btn.addEventListener("click", function(e){
      e.preventDefault();
      var open = dd.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      document.querySelectorAll(".dropdown.is-open").forEach(function(o){ if (o !== dd){ o.classList.remove("is-open"); var b = o.parentNode.querySelector(".nav-link"); if (b) b.setAttribute("aria-expanded","false"); } });
    });
  });
  document.addEventListener("click", function(e){
    if (!e.target.closest(".nav-item")) document.querySelectorAll(".dropdown.is-open").forEach(function(o){ o.classList.remove("is-open"); var b = o.parentNode.querySelector(".nav-link"); if (b) b.setAttribute("aria-expanded","false"); });
  });

  /* ---------------- mobile menu ---------------- */
  var burger = document.querySelector("[data-burger]");
  var mmenu = document.querySelector("[data-menu]");
  var inertEls = [document.querySelector("main"), document.querySelector(".site-foot")];
  function setInert(on){ inertEls.forEach(function(el){ if (!el) return; if (on){ el.setAttribute("aria-hidden","true"); el.setAttribute("inert",""); } else { el.removeAttribute("aria-hidden"); el.removeAttribute("inert"); } }); }
  function closeMobile(){
    if (!mmenu || !mmenu.classList.contains("is-open")) return;
    burger.classList.remove("is-open"); mmenu.classList.remove("is-open");
    if (head) head.classList.remove("is-menu");
    burger.setAttribute("aria-expanded","false"); setInert(false);
    if (lenis && ready) lenis.start(); burger.focus();
  }
  if (burger && mmenu) {
    burger.addEventListener("click", function(){
      var open = !mmenu.classList.contains("is-open");
      if (!open) { closeMobile(); return; }
      burger.classList.add("is-open"); mmenu.classList.add("is-open");
      if (head) head.classList.add("is-menu"); burger.setAttribute("aria-expanded","true");
      setInert(true); if (lenis) lenis.stop();
      var f = mmenu.querySelector("a,button"); if (f) f.focus();
    });
    mmenu.querySelectorAll(".m-row[data-acc]").forEach(function(row){
      row.addEventListener("click", function(){ row.parentNode.classList.toggle("open"); });
    });
    mmenu.querySelectorAll(".m-sub a, .m-go").forEach(function(a){ a.addEventListener("click", closeMobile); });
    mmenu.addEventListener("keydown", function(e){
      if (e.key !== "Tab" || !mmenu.classList.contains("is-open")) return;
      var f = mmenu.querySelectorAll("a[href],button"); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMobile(); });

  /* ---------------- language toggle buttons ---------------- */
  document.querySelectorAll("[data-lang-btn]").forEach(function(b){ b.addEventListener("click", toggleLang); });

  /* ---------------- reveals / motion ---------------- */
  function maskWords(el){
    var frag = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function(node){
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function(w){
          if (!w.trim()) { frag.appendChild(document.createTextNode(" ")); return; }
          var m = document.createElement("span"); m.className = "w-mask";
          var i = document.createElement("span"); i.className = "w-in"; i.textContent = w;
          m.appendChild(i); frag.appendChild(m);
        });
      } else { var m2 = document.createElement("span"); m2.className = "w-mask"; var i2 = document.createElement("span"); i2.className = "w-in"; i2.appendChild(node); m2.appendChild(i2); frag.appendChild(m2); }
    });
    el.textContent = ""; el.appendChild(frag); el.classList.add("js-split");
  }
  function initReveals(){
    if (!motion) { document.querySelectorAll("[data-hero-fade]").forEach(function(el){ el.style.opacity = 1; el.style.transform = "none"; }); return; }
    document.querySelectorAll("[data-split]").forEach(function(el){
      maskWords(el);
      gsap.to(el.querySelectorAll(".w-in"), { y: 0, duration: 1.05, ease: "power4.out", stagger: 0.05, scrollTrigger: { trigger: el, start: "top 86%" } });
    });
    document.querySelectorAll("[data-reveal]").forEach(function(el){
      if (el.matches(".vcard, .cta-card, .ta-quote")) return;
      gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    if (typeof ScrollTrigger.batch === "function") ScrollTrigger.batch(".vcard, .cta-card, .ta-quote", { start: "top 88%", onEnter: function(els){ gsap.to(els, { opacity: 1, y: 0, duration: 1.05, ease: "power4.out", stagger: 0.08, overwrite: true }); } });
    document.querySelectorAll("[data-clip]").forEach(function(el){
      gsap.fromTo(el, { clipPath: "inset(12% 8% 12% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: el, start: "top 86%" } });
    });
    if (desktop) document.querySelectorAll("[data-plx]").forEach(function(img){
      gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, { yPercent: 6, scale: 1.12, ease: "none", scrollTrigger: { trigger: img.closest(".ph") || img, start: "top bottom", end: "bottom top", scrub: true } });
    });
    document.querySelectorAll(".heb-ghost").forEach(function(el){
      gsap.fromTo(el, { yPercent: 14 }, { yPercent: -14, ease: "none", scrollTrigger: { trigger: el.closest(".sec-head"), start: "top bottom", end: "bottom top", scrub: true } });
    });
    var hl = document.querySelector(".head-line");
    if (hl) gsap.to(hl, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } });
    var fm = document.querySelector("[data-foot-mark]");
    if (fm) gsap.from(fm, { yPercent: 35, opacity: 0, ease: "none", scrollTrigger: { trigger: ".site-foot", start: "top 96%", end: "top 55%", scrub: true } });
  }
  function initMagnetic(){
    if (!(motion && finePointer)) return;
    var mag = function(el, ax, ay){
      var qx = gsap.quickTo(el, "x", { duration: 0.45, ease: "power3" }), qy = gsap.quickTo(el, "y", { duration: 0.45, ease: "power3" });
      el.addEventListener("mousemove", function(e){ var r = el.getBoundingClientRect(); qx((e.clientX - r.left - r.width / 2) * ax); qy((e.clientY - r.top - r.height / 2) * ay); });
      el.addEventListener("mouseleave", function(){ qx(0); qy(0); });
    };
    document.querySelectorAll(".btn, .head-cta").forEach(function(b){ mag(b, 0.2, 0.32); });
    document.querySelectorAll(".cta-card").forEach(function(c){ mag(c, 0.1, 0.12); });
  }
  function initGallery(){
    var gal = document.querySelector("[data-gal]"); if (!gal) return;
    var bar = document.querySelector("[data-gal-bar]");
    var imgs = gal.querySelectorAll(".gal-item img"); var tick = false;
    function upd(){ tick = false;
      if (motion && desktop) { var vw = window.innerWidth; imgs.forEach(function(img){ var r = img.getBoundingClientRect(); var c = (r.left + r.width / 2 - vw / 2) / vw; gsap.set(img, { xPercent: gsap.utils.clamp(-7, 7, c * -9), scale: 1.14 }); }); }
      var max = gal.scrollWidth - gal.clientWidth; if (bar && hasGSAP) gsap.set(bar, { scaleX: max ? Math.min(1, Math.abs(gal.scrollLeft) / max) : 0 });
    }
    gal.addEventListener("scroll", function(){ if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener("resize", upd); upd();
  }
  function activeNav(){
    if (!motion) return;
    document.querySelectorAll('.main-nav a[href^="#"]').forEach(function(a){
      var sec = document.querySelector(a.getAttribute("href")); if (!sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%", onToggle: function(s){ a.classList.toggle("is-active", s.isActive); } });
    });
  }

  /* ---------------- video facade ---------------- */
  document.querySelectorAll("[data-film]").forEach(function(f){
    f.addEventListener("click", function(){
      var id = f.getAttribute("data-film"); if (!id) return;
      var ifr = document.createElement("iframe");
      ifr.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      ifr.allowFullscreen = true; ifr.title = "The Way Inn — film";
      f.innerHTML = ""; f.appendChild(ifr);
    });
  });

  /* ---------------- boot ---------------- */
  applyLang(lang);
  tickClock(); setInterval(tickClock, 30000); langCbs.push(tickClock);
  initReveals(); initMagnetic(); initGallery(); activeNav();
  var yr = document.querySelector("[data-year]"); if (yr) yr.textContent = new Date().getFullYear();
  function markReady(){ ready = true; if (lenis && !(document.querySelector("[data-preloader]"))) lenis.start(); }
  if (lenis && !document.querySelector("[data-preloader]")) { lenis.start(); ready = true; }
  if (motion) { window.addEventListener("load", function(){ ScrollTrigger.refresh(); }); if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); }); }

  /* ---------------- public API ---------------- */
  window.TWI = {
    get lang(){ return lang; }, t: t, onLang: function(fn){ langCbs.push(fn); }, applyLang: applyLang,
    lenis: lenis, reduced: reduced, motion: motion, desktop: desktop, finePointer: finePointer, hasGSAP: hasGSAP,
    now: now, startD: startD, safedNow: safedNow, clockState: clockState, maskWords: maskWords,
    scrollTo: scrollTo, closeMobile: closeMobile, setReady: function(){ ready = true; }
  };
})();
