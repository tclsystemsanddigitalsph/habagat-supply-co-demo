/* =========================================================
   Habagat Supply Co. — shared storefront UI layer
   ========================================================= */
(function (global) {
  "use strict";

  function productArtSrc(value) {
    if (!value) return global.HabagatArt("default");

    if (/^(data:|https?:|\/|\.\.?\/)/i.test(value)) {
      return value;
    }

    return global.HabagatArt(value);
  }

  var S = global.HabagatStore;

  var NAV = [
    { href: "index.html", label: "Home" },
    { href: "shop.html", label: "Shop" },
    { href: "about.html", label: "About" },
    { href: "contact.html", label: "Contact" }
  ];

  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function currentPage() {
    var path = global.location.pathname.split("/").pop() || "index.html";
    return path;
  }

  /* ---------------- header ---------------- */
  function header() {
    var s = S.getSettings();
    var page = currentPage();
    var count = S.cartCount();

    var links = NAV.map(function (n) {
      var cur = n.href === page ? ' aria-current="page"' : "";

      return (
        '<li><a href="' +
        n.href +
        '"' +
        cur +
        ">" +
        esc(n.label) +
        "</a></li>"
      );
    }).join("");

    var mLinks =
      NAV.map(function (n) {
        return (
          '<li><a href="' +
          n.href +
          '">' +
          esc(n.label) +
          "</a></li>"
        );
      }).join("") +
      '<li><a href="cart.html">Cart (' +
      count +
      ")</a></li>" +
      '<li><a class="mnav-admin" href="admin.html">Demo Admin</a></li>';

    var initials = esc(
      (s.storeName || "H")
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 2)
        .toUpperCase() || "HB"
    );

    return (
      '<div class="announce">Demo store for the <strong>TCL Systems &amp; Digitals PH</strong> Online Shop + Admin package &mdash; orders and payments are simulated.</div>' +
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<header class="site-header">' +
      '<div class="wrap header-inner">' +
      '<a class="brand" href="index.html">' +
      '<span class="brand-mark" aria-hidden="true">' +
      initials +
      "</span>" +
      "<span>" +
      '<span class="brand-name">' +
      esc(s.storeName) +
      "</span>" +
      '<span class="brand-sub">' +
      esc(s.tagline) +
      "</span>" +
      "</span>" +
      "</a>" +
      '<nav class="nav-desktop" aria-label="Main">' +
      "<ul>" +
      links +
      '<li><a href="admin.html">Demo Admin</a></li>' +
      "</ul>" +
      "</nav>" +
      '<div class="header-actions">' +
      '<a class="cart-link" href="cart.html">Cart' +
      '<span class="cart-count" data-cart-count' +
      (count ? "" : " hidden") +
      ">" +
      count +
      "</span>" +
      "</a>" +
      '<a class="admin-link" href="admin.html">Demo Admin</a>' +
      '<button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="mobileNav">' +
      '<span class="bars" aria-hidden="true"><span></span><span></span><span></span></span>Menu' +
      "</button>" +
      "</div>" +
      "</div>" +
      '<nav class="mobile-nav" id="mobileNav" aria-label="Mobile">' +
      "<ul>" +
      mLinks +
      "</ul>" +
      "</nav>" +
      "</header>"
    );
  }

  /* ---------------- footer ---------------- */
  function footer() {
    var s = S.getSettings();

    var initials = esc(
      (s.storeName || "H")
        .replace(/[^A-Za-z]/g, "")
        .slice(0, 2)
        .toUpperCase() || "HB"
    );

    var year = new Date().getFullYear();

    return (
      '<footer class="site-footer">' +
      '<div class="wrap footer-grid">' +
      "<div>" +
      '<div class="footer-brand">' +
      '<span class="brand-mark" aria-hidden="true">' +
      initials +
      "</span>" +
      "<strong>" +
      esc(s.storeName) +
      "</strong>" +
      "</div>" +
      "<p>" +
      esc(s.aboutShort) +
      "</p>" +
      "<p>" +
      esc(s.hours) +
      "</p>" +
      "</div>" +
      "<div>" +
      "<h4>Shop</h4>" +
      "<ul>" +
      '<li><a href="shop.html">All products</a></li>' +
      '<li><a href="cart.html">Cart</a></li>' +
      '<li><a href="about.html">About us</a></li>' +
      '<li><a href="contact.html">Contact</a></li>' +
      "</ul>" +
      "</div>" +
      "<div>" +
      "<h4>Get in touch</h4>" +
      "<ul>" +
      '<li><a href="mailto:' +
      esc(s.email) +
      '">' +
      esc(s.email) +
      "</a></li>" +
      '<li><a href="tel:' +
      esc(String(s.phone).replace(/\s/g, "")) +
      '">' +
      esc(s.phone) +
      "</a></li>" +
      "<li>" +
      esc(s.address) +
      "</li>" +
      "</ul>" +
      "</div>" +
      "</div>" +
      '<div class="wrap footer-bottom">' +
      "<span>&copy; " +
      year +
      " " +
      esc(s.storeName) +
      ". Demo site &mdash; no real orders are processed.</span>" +
      '<span class="attrib">Powered by <a href="index.html">TCL Systems &amp; Digitals PH</a></span>' +
      "</div>" +
      "</footer>"
    );
  }

  /* ---------------- product card ---------------- */
  function productCard(p) {
    var options =
      p.options &&
      p.options.values &&
      p.options.values.length
        ? '<span class="opt">' +
          p.options.values.length +
          " " +
          esc(p.options.label.toLowerCase()) +
          " options</span>"
        : "";

    var badge = !p.active
      ? '<span class="badge-off badge-out">Out of stock</span>'
      : p.featured
        ? '<span class="badge-off">Featured</span>'
        : "";

    return (
      '<article class="card">' +
      '<a class="card-thumb" href="product.html?id=' +
      encodeURIComponent(p.id) +
      '" aria-label="' +
      esc(p.name) +
      '">' +
      '<img src="' +
      productArtSrc(p.art) +
      '" alt="' +
      esc(p.name) +
      '" loading="lazy" width="240" height="240">' +
      "</a>" +
      '<div class="card-body">' +
      '<span class="card-cat">' +
      esc(p.category) +
      "</span>" +
      '<h3 class="card-title"><a href="product.html?id=' +
      encodeURIComponent(p.id) +
      '">' +
      esc(p.name) +
      "</a></h3>" +
      '<div class="card-price">' +
      badge +
      S.pesoShort(p.price) +
      options +
      "</div>" +
      "</div>" +
      '<div class="card-foot">' +
      (p.active
        ? '<a class="btn btn-outline btn-sm btn-block" href="product.html?id=' +
          encodeURIComponent(p.id) +
          '">View details</a>'
        : '<button class="btn btn-outline btn-sm btn-block" type="button" disabled>Unavailable</button>') +
      "</div>" +
      "</article>"
    );
  }

  /* ---------------- cart badge sync ---------------- */
  function syncCartCount() {
    var count = S.cartCount();
    var nodes = global.document.querySelectorAll("[data-cart-count]");

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = count;

      if (count) {
        nodes[i].removeAttribute("hidden");
      } else {
        nodes[i].setAttribute("hidden", "");
      }
    }

    var mobileCart = global.document.querySelector(
      ".mobile-nav a[href='cart.html']"
    );

    if (mobileCart) {
      mobileCart.textContent = "Cart (" + count + ")";
    }
  }

  /* ---------------- toast ---------------- */
  var toastEl = null;
  var toastTimer = null;

  function toast(msg) {
    if (!toastEl) {
      toastEl = global.document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      global.document.body.appendChild(toastEl);
    }

    toastEl.textContent = msg;
    toastEl.classList.add("show");

    if (toastTimer) {
      global.clearTimeout(toastTimer);
    }

    toastTimer = global.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2600);
  }

  /* ---------------- mount ---------------- */
  function mount() {
    var h = global.document.querySelector("[data-header]");

    if (h) {
      h.innerHTML = header();
    }

    var f = global.document.querySelector("[data-footer]");

    if (f) {
      f.innerHTML = footer();
    }

    var toggle = global.document.querySelector("[data-nav-toggle]");
    var menu = global.document.getElementById("mobileNav");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");

        toggle.setAttribute(
          "aria-expanded",
          open ? "true" : "false"
        );
      });
    }

    syncCartCount();

    global.addEventListener(
      "habagat:change",
      syncCartCount
    );
  }

  global.HabagatUI = {
    esc: esc,
    mount: mount,
    productCard: productCard,
    header: header,
    footer: footer,
    toast: toast,
    syncCartCount: syncCartCount
  };
})(window);