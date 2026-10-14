/* StyleLoft – Sklep (Startseite, Katalog, StyleBot, Warenkorb)
 * Bedingung wird pro Seite festgelegt:
 *   a.html     -> window.STYLELOFT_FORCED = "recommendations"  (Version A, Empfehlungssystem)
 *   b.html     -> window.STYLELOFT_FORCED = "chat"             (Version B, Chatbot)
 *   index.html -> keine Vorgabe, Vorschau mit Umschalter (nur für die Entwicklung)
 */
(function () {
  "use strict";

  var forced = window.STYLELOFT_FORCED;

  /* ---------- Icons (Lucide, als Inline-SVG) ---------- */
  function svg(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }
  var ICON = {
    bot: svg('<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>'),
    heart: svg('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>'),
    search: svg('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'),
    bag: svg('<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
    user: svg('<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>'),
    x: svg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>')
  };

  function esc(text) {
    var d = document.createElement("div");
    d.textContent = text == null ? "" : String(text);
    return d.innerHTML;
  }

  /* ---------- Suchbegriffe an die Umfrage (Elternseite) schicken ---------- */
  /*
   * Schickt jeden abgeschickten Suchbegriff (Suchfeld und Chat) per postMessage an die
   * Seite, in die der Shop eingebettet ist (z. B. LimeSurvey-Frage mit iframe).
   * Die Umfrageseite muss auf Nachrichten mit channel "styleloft:search" hören.
   */
  var CHANNEL = "styleloft:search";
  var searchHistory = [];

  function reportSearchToParent(term) {
    var q = (term || "").trim();
    if (!q) return;
    searchHistory.push(q);
    var message = { channel: CHANNEL, search: q, searches: searchHistory.slice() };
    [window.parent, window.top].forEach(function (win) {
      try {
        if (win && win !== window) win.postMessage(message, "*");
      } catch (e) { /* Zielfenster nicht erreichbar */ }
    });
  }

  /* ---------- Zustand ---------- */
  var state = {
    condition: forced || "chat",
    view: forced === "recommendations" ? "home" : "catalog",
    category: "jacken",
    query: "",
    sort: "Beliebtheit"
  };
  var cart = [];
  var cartOpen = false;
  var bot = null;

  var root = document.getElementById("app");

  /* ---------- Warenkorb und Hinweis ---------- */
  var toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = "Zum Warenkorb hinzugefügt";
  document.body.appendChild(toast);
  var toastTimer = null;

  function addToCart(product) {
    cart.push(product);
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("visible"); }, 1800);
    var badge = document.getElementById("bag-count");
    if (badge) badge.textContent = cart.length;
    var bagBtn = document.getElementById("bag-btn");
    if (bagBtn) bagBtn.setAttribute("aria-label", "Warenkorb mit " + cart.length + " Artikeln");
    if (cartOpen) renderDrawer();
  }

  function productById(id) {
    return PRODUCTS.filter(function (p) { return String(p.id) === String(id); })[0];
  }

  /* ---------- Bausteine ---------- */
  function productImage(p) {
    return '<img class="product-photo product-crop-' + p.crop + '" src="' + p.image + '" alt="' + esc(p.name) + '" loading="lazy" width="1600" height="800">';
  }

  /** Empfohlene Produkte werden mit festem Preis von 149 € und ohne Streichpreis angezeigt. */
  function asRecommended(p) {
    var copy = {};
    Object.keys(p).forEach(function (k) { if (k !== "oldPrice") copy[k] = p[k]; });
    copy.price = 149;
    return copy;
  }

  /* Die angezeigten Preise stehen in data-Attributen, damit Dialog und Warenkorb denselben Preis nutzen. */
  function cardData(p) {
    return 'data-id="' + p.id + '" data-price="' + p.price + '" data-old="' + (p.oldPrice || "") + '"';
  }

  function productFromData(el) {
    var base = productById(el.getAttribute("data-id"));
    if (!base) return null;
    var copy = {};
    Object.keys(base).forEach(function (k) { copy[k] = base[k]; });
    copy.price = Number(el.getAttribute("data-price"));
    var old = el.getAttribute("data-old");
    if (old) copy.oldPrice = Number(old); else delete copy.oldPrice;
    return copy;
  }

  function productCard(p, opts) {
    opts = opts || {};
    var d = cardData(p);
    return (
      '<article class="product-card ' + (opts.compact ? "compact" : "") + '">' +
      (opts.compact && opts.recommended ? '<span class="recommended-badge above-product">Empfohlen für dich</span>' : "") +
      '<button type="button" class="product-image" aria-label="Details zu ' + esc(p.name) + '" data-act="detail" ' + d + ">" +
      (p.oldPrice ? '<span class="discount">−25%</span>' : "") +
      (!opts.compact && opts.recommended ? '<span class="recommended-badge">Empfohlen für dich</span>' : "") +
      productImage(p) + "</button>" +
      '<h3 class="product-name"><button type="button" class="product-title-button" data-act="detail" ' + d + ">" + esc(p.name) + "</button></h3>" +
      (opts.compact ? "" : '<p class="product-description">' + esc(p.description) + "</p>") +
      '<div class="rating"><span>★</span> ' + Math.min(p.rating, 4.9).toFixed(1) + " (" + p.reviews + ")</div>" +
      '<div class="price"><strong>' + p.price + "€</strong>" + (p.oldPrice ? "<del>" + p.oldPrice + "€</del>" : "") + "</div>" +
      '<button type="button" class="add-button" data-act="add" ' + d + ">" + ICON.bag + "In den Warenkorb</button>" +
      "</article>"
    );
  }

  /* ---------- Detail-Fenster (Dialog) ---------- */
  var dialogRoot = document.createElement("div");
  document.body.appendChild(dialogRoot);
  var dialogState = null;

  function openDialog(product, trigger) {
    var det = productDetails(product);
    dialogState = { product: product, trigger: trigger };
    dialogRoot.innerHTML =
      '<div class="dialog-overlay" data-act="dialog-overlay"></div>' +
      '<div class="dialog-content product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" aria-describedby="dlg-desc" tabindex="-1">' +
      '<div class="product-detail-photo">' + productImage(product) + "</div>" +
      '<div class="product-detail-copy">' +
      '<h2 class="dialog-title" id="dlg-title">' + esc(product.name) + "</h2>" +
      '<p class="dialog-desc" id="dlg-desc">' + esc(product.description) + "</p>" +
      '<div class="price"><strong>' + product.price + "€</strong>" + (product.oldPrice ? "<del>" + product.oldPrice + "€</del>" : "") + "</div>" +
      '<dl class="product-specs">' +
      "<div><dt>Material</dt><dd>" + esc(det.material) + "</dd></div>" +
      "<div><dt>Zusammensetzung</dt><dd>" + esc(det.composition) + "</dd></div>" +
      "<div><dt>Passform</dt><dd>" + esc(det.fit) + "</dd></div>" +
      "<div><dt>Abteilung</dt><dd>" + (product.gender === "damen" ? "Damen" : "Herren") + "</dd></div></dl>" +
      '<button type="button" class="product-detail-add" data-act="dialog-add">' + ICON.bag + "In den Warenkorb</button>" +
      "</div>" +
      '<button type="button" class="dialog-close" data-act="dialog-close" aria-label="Schließen">' + ICON.x + "</button>" +
      "</div>";
    document.body.style.overflow = "hidden";
    var box = dialogRoot.querySelector(".dialog-content");
    if (box) box.focus();
  }

  function closeDialog() {
    if (!dialogState) return;
    var trigger = dialogState.trigger;
    dialogState = null;
    dialogRoot.innerHTML = "";
    document.body.style.overflow = "";
    if (trigger && document.body.contains(trigger)) trigger.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (!dialogState) return;
    if (e.key === "Escape") { closeDialog(); return; }
    if (e.key === "Tab") {
      var items = dialogRoot.querySelectorAll("button");
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRoot.querySelector(".dialog-content"))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Suche / Filter (wie im Prototyp) ---------- */
  function visibleProducts() {
    var searched = state.query.trim().toLowerCase();
    function has(words) { return words.some(function (w) { return searched.indexOf(w) !== -1; }); }
    var wantsBlack = has(["schwarz", "black", "czarn", "czarne"]);
    var wantsMantel = has(["mantel", "mäntel", "płaszcz", "plaszcz"]);
    var wantsDamen = has(["damen", "damsk"]);

    var list = (wantsBlack || wantsMantel)
      ? PRODUCTS.filter(function (i) { return i.black && i.category === "jacken"; })
      : productsFor(state.category);
    if (wantsDamen) list = list.filter(function (i) { return i.gender === "damen"; });
    if (searched && !wantsBlack && !wantsMantel && !wantsDamen && searched !== "mode") {
      /* Textsuche bleibt auf die gewählte Kategorie beschränkt */
      var allMatches = productsFor(state.category).filter(function (i) {
        return (i.name + " " + i.description + " " + i.category).toLowerCase().indexOf(searched) !== -1;
      });
      if (allMatches.length) list = allMatches;
    }
    var sorted = list.slice().sort(function (a, b) {
      if (state.sort === "Preis aufsteigend") return a.price - b.price;
      if (state.sort === "Preis absteigend") return b.price - a.price;
      return b.rating - a.rating;
    });
    if (state.category !== "jacken") return sorted;
    /* In „Jacken & Mäntel“ stehen immer die ersten drei schwarzen Modelle vorn */
    var lead = sorted.filter(function (i) { return i.black; }).slice(0, 3);
    var leadIds = {};
    lead.forEach(function (i) { leadIds[i.id] = true; });
    return lead.concat(sorted.filter(function (i) { return !leadIds[i.id]; }));
  }

  function popularAds() {
    var out = [];
    ["kleider", "pullover", "schuhe", "accessoires"].forEach(function (id) {
      out = out.concat(productsFor(id).filter(function (p) { return !p.black; }).slice(0, 2));
    });
    return out;
  }

  function categoryLabel() {
    var c = CATEGORIES.filter(function (x) { return x.id === state.category; })[0];
    return c ? c.label : "Jacken & Mäntel";
  }

  /* ---------- Ergebnisliste (Version A) ---------- */
  function drawResults() {
    var count = document.getElementById("results-count");
    var grid = document.getElementById("results-grid");
    if (!count || !grid) return;
    var visible = visibleProducts();
    var searching = state.query.trim().length > 0;
    count.textContent = visible.length * 7 + 3 + " Ergebnisse";
    grid.innerHTML = visible.map(function (p, i) {
      var recommended = searching && i < 3;
      var fixedPrice = recommended || (state.category === "jacken" && i < 3);
      return productCard(fixedPrice ? asRecommended(p) : p, { recommended: recommended });
    }).join("");
  }

  /* ---------- Warenkorb-Schublade ---------- */
  function renderDrawer() {
    var host = document.getElementById("cart-root");
    if (!host) return;
    if (!cartOpen) { host.innerHTML = ""; return; }
    var total = cart.reduce(function (sum, i) { return sum + i.price; }, 0);
    var items = cart.length === 0
      ? '<p class="empty-cart">Ihr Warenkorb ist leer.</p>'
      : cart.map(function (i) {
          return '<div class="cart-item"><div class="cart-thumb">' + productImage(i) + "</div><div><strong>" + esc(i.name) + "</strong><span>Schwarz</span></div><b>" + i.price + "€</b></div>";
        }).join("");
    host.innerHTML =
      '<div class="cart-overlay" data-act="cart-overlay">' +
      '<aside class="cart-drawer" aria-label="Warenkorb">' +
      '<div class="cart-title"><div><span>Warenkorb</span><small>' + cart.length + ' Artikel</small></div>' +
      '<button type="button" data-act="cart-close" aria-label="Warenkorb schließen">' + ICON.x + "</button></div>" +
      '<div class="cart-items">' + items + "</div>" +
      '<div class="cart-total"><span>Gesamtsumme</span><strong>' + total + '€</strong><button type="button">Zur Kasse</button></div>' +
      "</aside></div>";
  }

  /* ---------- Seitenaufbau ---------- */
  function homeHtml() {
    var trending = ["Parka", "Strick", "Leder", "Kleider"].map(function (t) {
      return '<button type="button" data-act="trend" data-term="' + t + '">' + t + "</button>";
    }).join("");
    var cats = CATEGORIES.map(function (c) {
      return '<button type="button" data-act="cat" data-cat="' + c.id + '"><span>' + c.icon + "</span>" + esc(c.label) + "</button>";
    }).join("");
    var strip = [["🚚", "Kostenloser Versand", "ab 49€ Bestellwert"], ["↩", "30 Tage Rückgabe", "kostenlos zurücksenden"], ["◆", "Style Beratung", "mit unserem StyleBot"], ["▣", "Sichere Zahlung", "SSL-verschlüsselt"]]
      .map(function (s) { return "<div><span>" + s[0] + "</span><p><strong>" + s[1] + "</strong><small>" + s[2] + "</small></p></div>"; }).join("");
    return (
      "<main>" +
      '<section class="hero-section"><img class="hero-background" src="img-styleloft-models-hero.jpg" alt="Models in modernen Mänteln" width="1920" height="900"><div class="hero-shade"></div>' +
      '<div class="hero-content"><div class="eyebrow">Neue Saison · Herbst 2026</div><h1>Modern. Stilvoll. Immer richtig.</h1>' +
      "<p>Kuratierte Mode für jeden Tag — von Essentials bis Statement Pieces.</p>" +
      '<form class="hero-search" data-form="search">' + ICON.search + '<input id="hero-q" value="' + esc(state.query) + '" placeholder="Wonach suchen Sie?" autocomplete="off"><button type="submit">Suchen</button></form>' +
      '<div class="trending"><span>Beliebt gerade:</span>' + trending + "</div></div></section>" +
      '<section class="category-grid">' + cats + "</section>" +
      '<section class="promo-grid"><button type="button" class="promo-main" data-act="cat" data-cat="jacken"><span>Herbst Edit</span><strong>Bis zu 30% auf Outerwear</strong><p>Moderne Parkas, Puffer und Wollmäntel — nur für kurze Zeit.</p></button>' +
      '<div class="promo-side"><span>StyleLoft Club</span><strong>5€ Gutschein sichern</strong><p>Kostenlos anmelden und bei jeder Bestellung sparen.</p></div></section>' +
      '<section class="service-strip">' + strip + "</section></main>"
    );
  }

  function catalogHtml() {
    var head =
      (state.condition === "recommendations"
        ? '<form class="results-search" data-form="search"><input id="results-q" value="' + esc(state.query) + '" placeholder="Wonach suchen Sie?" autocomplete="off"><button type="submit">Suchen</button></form>'
        : "") +
      '<div class="breadcrumbs">Start › Damen › ' + esc(categoryLabel()) + "</div>";
    var body;
    if (state.condition === "chat") {
      var promoCard = function (p) { return productCard(p); };
      body =
        '<div class="chat-shop-head"><h1>Style Beratung</h1><p>StyleBot findet Ihren perfekten Mantel — kostenlos und unverbindlich.</p></div>' +
        '<div id="bot-slot"></div>' +
        '<section class="chat-ads"><div class="chat-promos">' +
        '<button type="button" class="chat-promo photo" data-act="cat" data-cat="jacken"><img src="img-styleloft-models-hero.jpg" alt="Models in modernen Herbstlooks" loading="lazy"><span class="chat-promo-copy"><span>Herbst Edit</span><strong>Bis zu 30% auf Outerwear</strong></span></button>' +
        '<button type="button" class="chat-promo club" data-act="cat" data-cat="accessoires"><span>StyleLoft Club</span><strong>5€ Gutschein sichern</strong><p>Kostenlos anmelden und bei jeder Bestellung sparen.</p></button>' +
        "</div>" +
        '<h2 class="chat-ads-title">Beliebt bei StyleLoft</h2><div class="product-grid chat-ads-grid">' + popularAds().map(promoCard).join("") + "</div></section>";
    } else {
      var tabs = CATEGORIES.map(function (c) {
        return '<button type="button" class="' + (state.category === c.id ? "active" : "") + '" data-act="cat" data-cat="' + c.id + '">' + esc(c.label) + "</button>";
      }).join("");
      var sorts = ["Beliebtheit", "Preis aufsteigend", "Preis absteigend"].map(function (s) {
        return "<option" + (state.sort === s ? " selected" : "") + ">" + s + "</option>";
      }).join("");
      body =
        '<div class="catalog-tabs">' + tabs + "</div>" +
        '<div class="product-toolbar"><div><h1>' + esc(categoryLabel()) + '</h1><p id="results-count"></p></div><select id="sort">' + sorts + "</select></div>" +
        '<div class="product-grid" id="results-grid"></div>';
    }
    return '<main class="results-page">' + head + body + "</main>";
  }

  function footerHtml() {
    return (
      '<footer class="site-footer"><div class="footer-grid">' +
      "<div><h3>Kontakt</h3><button type=\"button\">Kundenservice</button><button type=\"button\">Rückgabe &amp; Umtausch</button><button type=\"button\">Versandinformationen</button></div>" +
      '<div><h3>Rechtliches</h3><button type="button">Impressum</button><button type="button">AGB</button><button type="button">Datenschutz</button></div>' +
      '<div><h3>Zahlungsarten</h3><div class="payment-logos"><span>VISA</span><span>Mastercard</span><span>PayPal</span><span>Klarna</span></div></div>' +
      "<div><h3>Newsletter</h3><p>Angebote jede Woche per E-Mail.</p></div></div>" +
      '<p class="copyright">Prototyp für Forschungszwecke — kein echter Shop. HAW Hamburg, Masterarbeit Vertrauen &amp; algorithmische Systeme.</p></footer>'
    );
  }

  function render() {
    var onChatCatalog = state.condition === "chat" && state.view === "catalog";

    /* StyleBot behalten, solange er sichtbar bleibt; sonst verwerfen */
    var keepEl = null;
    if (bot) {
      if (onChatCatalog) { keepEl = bot.el; if (keepEl.parentNode) keepEl.parentNode.removeChild(keepEl); }
      else { bot.destroy(); bot = null; }
    }

    var devBar = forced ? "" :
      '<div class="experiment-bar"><span>Vorschau (nur Entwicklung):</span>' +
      '<button type="button" class="' + (state.condition === "recommendations" ? "active" : "") + '" data-act="cond" data-cond="recommendations">A — Empfehlungssystem</button>' +
      '<button type="button" class="' + (state.condition === "chat" ? "active" : "") + '" data-act="cond" data-cond="chat">B — Chatbot</button></div>';

    var nav = CATEGORIES.slice(0, 4).map(function (c) {
      return '<button type="button" data-act="cat" data-cat="' + c.id + '">' + esc(c.label.split(" ")[0]) + "</button>";
    }).join("");

    root.innerHTML =
      '<div class="styleloft-app">' + devBar +
      '<header class="site-header"><div class="topbar">' +
      '<button type="button" class="brand" data-act="brand"><span></span>STYLELOFT</button>' +
      "<nav>" + nav + "</nav>" +
      '<div class="header-actions"><button type="button" aria-label="Wunschliste">' + ICON.heart + '</button><button type="button" aria-label="Konto">' + ICON.user + "</button>" +
      '<button type="button" class="bag-button" id="bag-btn" data-act="cart-open" aria-label="Warenkorb mit ' + cart.length + ' Artikeln">' + ICON.bag + '<span id="bag-count">' + cart.length + "</span></button></div></div>" +
      '<div class="service-bar">Kostenloser Versand ab 49€ · Lieferung in 1–2 Werktagen · 30 Tage Rückgaberecht</div></header>' +
      (state.view === "home" ? homeHtml() : catalogHtml()) +
      footerHtml() +
      '<div id="cart-root"></div></div>';

    renderDrawer();

    if (state.view === "catalog" && state.condition === "recommendations") drawResults();

    if (onChatCatalog) {
      if (!bot) bot = createBot(state.query);
      else bot.setQuery(state.query);
      document.getElementById("bot-slot").appendChild(bot.el);
    }

    if (state.view === "home") {
      var hq = document.getElementById("hero-q");
      if (hq) hq.focus();
    }
  }

  /* ---------- Aktionen ---------- */
  function openCategory(id) {
    state.category = id;
    state.query = "";
    state.view = "catalog";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function search() {
    reportSearchToParent(state.query);
    state.view = "catalog";
    render();
  }

  function changeCondition(next) {
    state.condition = next;
    state.view = next === "chat" ? "catalog" : "home";
    state.query = "";
    render();
  }

  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-act]");
    if (!el) return;
    var act = el.getAttribute("data-act");

    /* Detail-Fenster (liegt außerhalb von #app) */
    if (act === "dialog-overlay" || act === "dialog-close") { closeDialog(); return; }
    if (act === "dialog-add") { if (dialogState) addToCart(dialogState.product); return; }
    if (!root.contains(el)) return;

    if (act === "cart-overlay") {
      if (e.target !== el) return; /* Klick innerhalb der Schublade schließt nicht */
      cartOpen = false; renderDrawer();
    } else if (act === "cart-close") { cartOpen = false; renderDrawer(); }
    else if (act === "cart-open") { cartOpen = true; renderDrawer(); }
    else if (act === "add") { var p = productFromData(el); if (p) addToCart(p); }
    else if (act === "detail") { var dp = productFromData(el); if (dp) openDialog(dp, el); }
    else if (act === "brand") { state.view = "home"; render(); }
    else if (act === "cat") { openCategory(el.getAttribute("data-cat")); }
    else if (act === "trend") { state.query = el.getAttribute("data-term"); state.view = "catalog"; render(); }
    else if (act === "cond") { changeCondition(el.getAttribute("data-cond")); }
  });

  root.addEventListener("submit", function (e) {
    if (e.target.getAttribute && e.target.getAttribute("data-form") === "search") {
      e.preventDefault();
      search();
    }
  });

  root.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "hero-q" || t.id === "results-q") {
      state.query = t.value;
      if (state.view === "catalog") {
        if (state.condition === "recommendations") drawResults();
        else if (bot) bot.setQuery(state.query);
      }
    }
  });

  root.addEventListener("change", function (e) {
    if (e.target.id === "sort") {
      state.sort = e.target.value;
      drawResults();
    }
  });

  /* ---------- StyleBot (Version B) ---------- */
  /* Kein echtes KI-Modell: Der Bot erkennt Stichwörter und stellt feste Fragen. */
  var TOPICS = [
    { id: "occasion", question: "Erzählen Sie mir ein bisschen: Wofür möchten Sie den Mantel tragen — im Alltag, im Büro, auf Reisen oder zu einem besonderen Anlass?", keywords: ["alltag", "jeden tag", "täglich", "freizeit", "casual", "büro", "buero", "arbeit", "job", "business", "meeting", "office", "uni", "reise", "urlaub", "stadt", "event", "abend", "party", "hochzeit", "feier", "theater", "konzert", "date", "besonder", "elegant", "festlich", "spaziergang", "wochenende"], echo: function (hit) { return "Oh, „" + hit + "“ — da sehe ich Sie schon richtig gut angezogen vor mir!"; } },
    { id: "fit", question: "Und wie mögen Sie es am liebsten — eher tailliert und figurbetont, klassisch gerade oder lässig oversize? Ich persönlich liebe ja beides 😊", keywords: ["tailliert", "taille", "figur", "eng", "schmal", "körpernah", "gerade", "klassisch", "zeitlos", "regulär", "normal", "oversize", "oversized", "weit", "locker", "lässig", "bequem", "kastig", "boxy", "gürtel", "wickel", "kurz", "lang", "midi", "knie", "maxi"], echo: function (hit) { return "„" + hit + "“ — gute Wahl, das schmeichelt wirklich jeder Silhouette."; } },
    { id: "material", question: "Jetzt wird's spannend: Welches Material fühlt sich für Sie richtig an — warme Wolle, leichter Trenchstoff, kuscheliges Stepp/Daunen oder cooles Kunstleder?", keywords: ["wolle", "woll", "kaschmir", "cashmere", "alpaka", "tweed", "filz", "trench", "baumwolle", "gabardine", "stepp", "daune", "puffer", "wattiert", "teddy", "fleece", "kunstleder", "leder", "vegan", "wasserdicht", "regen", "wind", "warm", "kalt", "winter", "leicht", "übergang", "frühling", "herbst"], echo: function (hit) { return "Mmh, „" + hit + "“ — da bekomme ich direkt Lust auf einen Herbstspaziergang."; } },
    { id: "budget", question: "Fast geschafft! Verraten Sie mir noch, wie viel Sie ungefähr ausgeben möchten? Keine Sorge, ich verrate es niemandem 😉", keywords: ["€", "eur", "euro", "budget", "unter", "bis", "maximal", "max", "höchstens", "ungefähr", "circa", "ca.", "preis", "günstig", "billig", "teuer", "egal", "spielt keine rolle", "50", "100", "150", "200", "250", "300"], echo: function (hit) { return "Budget „" + hit + "“ — notiert, ich achte darauf wie auf mein eigenes Portemonnaie."; } }
  ];

  var BOT_ACKS = [
    "Danke, das hilft mir sehr weiter!",
    "Super, ich merke mir das!",
    "Ah, verstehe — ich habe schon ein paar Ideen im Kopf.",
    "Wunderbar, Sie haben einen tollen Geschmack!",
    "Notiert! Ich freue mich, dass wir das zusammen aussuchen."
  ];

  var BOT_RECOMMENDED_IDS = [3, 6, 8, 75];

  function findHit(text, words) {
    var t = text.toLowerCase();
    for (var i = 0; i < words.length; i++) if (t.indexOf(words[i]) !== -1) return words[i];
    return undefined;
  }

  function createBot(initialQuery) {
    var query = initialQuery || "";
    var messages = [];
    var typing = true;
    var done = false;
    var covered = {};
    var pending = null;
    var greetTimer = null;
    var replyTimer = null;
    var recommendations = [];
    BOT_RECOMMENDED_IDS.forEach(function (id) {
      PRODUCTS.filter(function (p) { return p.id === id; }).forEach(function (p) { recommendations.push(p); });
    });

    var el = document.createElement("section");
    el.className = "advisor";
    el.innerHTML =
      '<div class="advisor-head"><span>' + ICON.bot + '</span><div><strong>StyleBot</strong><small>Ihr persönlicher Modeberater</small></div><b><i></i> Online</b></div>' +
      '<div class="advisor-log"></div>' +
      '<form class="advisor-form"><input placeholder="Ihre Antwort …" autocomplete="off"><button type="submit">Senden</button></form>';

    var log = el.querySelector(".advisor-log");
    var form = el.querySelector(".advisor-form");
    var input = el.querySelector("input");
    var sendBtn = form.querySelector("button");

    function draw() {
      log.innerHTML = messages.map(function (m) {
        return '<div class="advisor-message ' + m.from + " " + (m.products ? "with-products" : "") + '"><p>' + esc(m.text) + "</p>" +
          (m.products ? '<div class="bot-products">' + recommendations.map(function (p) { return productCard(p, { compact: true, recommended: true }); }).join("") + "</div>" : "") +
          "</div>";
      }).join("") + (typing ? '<div class="typing">StyleBot schreibt …</div>' : "");
      log.scrollTop = log.scrollHeight;
      input.disabled = typing;
      sendBtn.disabled = typing || !input.value.trim();
      form.hidden = done;
    }

    /* Begrüßung; wird auch erneut ausgeführt, wenn sich der Suchtext ändert.
       Die erste Frage bleibt offen: noch kein Thema gilt als "aktuelle Frage". */
    function greet() {
      clearTimeout(greetTimer);
      pending = null;
      greetTimer = setTimeout(function () {
        messages = [{ from: "bot", text: "Hallo und herzlich willkommen! 👋 Ich bin StyleBot, Ihr persönlicher Modeberater — Mode ist meine große Leidenschaft. Wie kann ich Ihnen heute helfen? Wonach suchen Sie?" }];
        typing = false;
        draw();
        if (!done) input.focus({ preventScroll: true });
      }, 700);
    }

    function send() {
      var text = input.value.trim();
      if (!text || typing || done) return;
      var userCountBefore = messages.filter(function (m) { return m.from === "user"; }).length;
      var wholeConversation = messages.filter(function (m) { return m.from === "user"; })
        .map(function (m) { return m.text; }).concat([text]).join(" ");
      messages.push({ from: "user", text: text });
      input.value = "";
      typing = true;
      reportSearchToParent(text);
      if (pending) covered[pending.id] = true;
      var echoes = [];
      TOPICS.forEach(function (topic) {
        if (covered[topic.id]) return;
        var hit = findHit(wholeConversation, topic.keywords);
        if (hit) {
          covered[topic.id] = true;
          if (findHit(text, topic.keywords)) echoes.push(topic.echo(hit));
        }
      });
      var next = TOPICS.filter(function (t) { return !covered[t.id]; })[0] || null;
      pending = next;
      draw();
      replyTimer = setTimeout(function () {
        messages.push({ from: "bot", text: BOT_ACKS[userCountBefore % BOT_ACKS.length] || "Danke!" });
        if (echoes.length) messages.push({ from: "bot", text: echoes.join(" ") });
        if (next) {
          messages.push({ from: "bot", text: next.question });
        } else {
          messages.push({ from: "bot", text: "Ich habe ein bisschen in unserem Lager gestöbert und bin ehrlich begeistert — diese Mäntel passen perfekt zu Ihnen:", products: true });
          done = true;
        }
        typing = false;
        draw();
        if (!done) input.focus({ preventScroll: true });
      }, 850);
    }

    form.addEventListener("submit", function (e) { e.preventDefault(); send(); });
    input.addEventListener("input", function () { sendBtn.disabled = typing || !input.value.trim(); });

    draw();
    greet();

    return {
      el: el,
      setQuery: function (q) { if (q !== query) { query = q; greet(); } },
      destroy: function () { clearTimeout(greetTimer); clearTimeout(replyTimer); }
    };
  }

  render();
})();
