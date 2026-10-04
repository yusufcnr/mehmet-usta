/* Mehmet Usta'nın Yeri – Kuzu Pirzola
   Header, mobil menü, reveal animasyonları, hafif parallax, galeri lightbox ve mobil sticky CTA. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: scroll durumu ---------- */
  var header = document.getElementById("header");
  var hero = document.querySelector(".hero");
  var sticky = document.getElementById("sticky-cta");
  var heroMedia = document.querySelector(".hero__media");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var heroH = hero ? hero.offsetHeight : 600;

    header.classList.toggle("is-scrolled", y > 24);

    if (sticky) {
      var show = y > heroH * 0.6;
      if (show !== sticky.classList.contains("is-visible")) {
        sticky.classList.toggle("is-visible", show);
        sticky.setAttribute("aria-hidden", show ? "false" : "true");
        sticky.querySelectorAll("a").forEach(function (a) {
          a.tabIndex = show ? 0 : -1;
        });
      }
    }

    if (heroMedia && !reduceMotion && y < heroH) {
      heroMedia.style.transform = "translate3d(0," + (y * 0.25).toFixed(1) + "px,0)";
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---------- Mobil menü ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Menüyü kapat" : "Menüyü aç");
  }

  burger.addEventListener("click", function () {
    setMenu(!header.classList.contains("is-open"));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && header.classList.contains("is-open")) {
      setMenu(false);
      burger.focus();
    }
  });

  window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Aktif menü bağlantısı ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__list a"));
  var sectionIds = ["top", "menu", "hakkimizda", "galeri", "konum"];

  if ("IntersectionObserver" in window) {
    var activeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) activeObserver.observe(el);
    });
  }

  /* ---------- Reveal animasyonları ---------- */
  var reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    reveals.forEach(function (el, i) {
      var siblings = el.parentElement ? el.parentElement.querySelectorAll(":scope > .reveal") : [];
      var index = Array.prototype.indexOf.call(siblings, el);
      if (index > 0) el.style.transitionDelay = Math.min(index, 4) * 90 + "ms";
      revealObserver.observe(el);
    });
  }

  /* ---------- Galeri lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightbox-img");
  var lbCaption = document.getElementById("lightbox-caption");
  var lbCount = document.getElementById("lightbox-count");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  var current = 0;
  var lastFocus = null;

  function sourceOf(item) {
    var img = item.querySelector("img");
    return (img && img.currentSrc) || item.getAttribute("data-full");
  }

  function show(index) {
    current = (index + items.length) % items.length;
    var item = items[current];
    var caption = item.getAttribute("data-caption") || "";
    lbImg.src = sourceOf(item);
    lbImg.alt = caption;
    lbCaption.textContent = caption;
    lbCount.textContent = (current + 1) + " / " + items.length;
  }

  function open(index) {
    lastFocus = document.activeElement;
    show(index);
    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (typeof lightbox.close === "function" && lightbox.open) {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
      onClosed();
    }
  }

  function onClosed() {
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { open(i); });
  });

  lightbox.addEventListener("close", onClosed);

  lightbox.addEventListener("click", function (e) {
    var action = e.target.getAttribute("data-lb");
    if (action === "close") close();
    else if (action === "prev") show(current - 1);
    else if (action === "next") show(current + 1);
    else if (e.target === lightbox) close();
  });

  lightbox.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
  });

  /* Dokunmatik kaydırma ile geçiş */
  var touchX = null;
  var touchY = null;

  lightbox.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      show(dx < 0 ? current + 1 : current - 1);
    } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
      close();
    }
    touchX = null;
    touchY = null;
  }, { passive: true });

  /* Komşu görselleri önceden yükle */
  lbImg.addEventListener("load", function () {
    [current + 1, current - 1].forEach(function (i) {
      var item = items[(i + items.length) % items.length];
      var pre = new Image();
      pre.src = sourceOf(item);
    });
  });

  /* ---------- Yıl ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  doc.classList.add("is-ready");
})();
