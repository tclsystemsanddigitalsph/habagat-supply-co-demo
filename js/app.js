/* =========================================================

   Habagat Supply Co. — storefront page scripts

   \========================================================= */

(function (global) {

  "use strict";



  var S = global.HabagatStore;

  var UI = global.HabagatUI;

  var esc = UI.esc;



  function productArtSrc(value) {

    if (!value) {

      return global.HabagatArt("default");

    }



    if (

      value.indexOf("data:") === 0 ||

      value.indexOf("http://") === 0 ||

      value.indexOf("https://") === 0 ||

      value.indexOf("/") === 0 ||

      value.indexOf("./") === 0 ||

      value.indexOf("../") === 0

    ) {

      return value;

    }



    return global.HabagatArt(value);

  }



  var page = global.document.body.getAttribute("data-page");



  /* ================= HOME ================= */

  function initHome() {

    var S2 = S.getSettings();

    var featured = S.getActiveProducts().filter(function (p) {

      return p.featured;

    }).slice(0, 4);



    if (featured.length < 4) {

      S.getActiveProducts().forEach(function (p) {

        if (featured.length < 4 && featured.indexOf(p) === -1) {

          featured.push(p);

        }

      });

    }



    var fw = global.document.getElementById("featuredGrid");



    if (fw) {

      fw.innerHTML = featured.map(UI.productCard).join("");

    }



    var cats = S.getCategories();

    var cw = global.document.getElementById("homeCategories");



    if (cw) {

      cw.innerHTML = cats.map(function (c) {

        var n = S.getActiveProducts().filter(function (p) {

          return p.category === c;

        }).length;



        return '<li><a href="shop.html?category=' +

          encodeURIComponent(c) +

          '">' +

          esc(c) +

          ' <span class="muted small">(' +

          n +

          ')</span></a></li>';

      }).join("");

    }



    var intro = global.document.getElementById("homeIntro");



    if (intro) {

      var parts = String(S2.aboutLong || "").split("\n\n").slice(0, 2);



      intro.innerHTML = parts.map(function (t) {

        return "<p>" + esc(t) + "</p>";

      }).join("");

    }

  }



  /* ================= SHOP ================= */

  function initShop() {

    var params = new URLSearchParams(global.location.search);

    var activeCat = params.get("category") || "All";

    var query = "";

    var sort = "default";



    var chips = global.document.getElementById("categoryChips");

    var grid = global.document.getElementById("shopGrid");

    var countEl = global.document.getElementById("shopCount");

    var searchEl = global.document.getElementById("shopSearch");

    var sortEl = global.document.getElementById("shopSort");

    var emptyEl = global.document.getElementById("shopEmpty");



    function renderChips() {

      var cats = ["All"].concat(S.getCategories());



      chips.innerHTML = cats.map(function (c) {

        return '<button type="button" class="chip' +

          (c === activeCat ? " active" : "") +

          '" data-cat="' +

          esc(c) +

          '" aria-pressed="' +

          (c === activeCat) +

          '">' +

          esc(c) +

          '</button>';

      }).join("");

    }



    function renderGrid() {

      var list = S.getActiveProducts();



      if (activeCat !== "All") {

        list = list.filter(function (p) {

          return p.category === activeCat;

        });

      }



      if (query) {

        var q = query.toLowerCase();



        list = list.filter(function (p) {

          return (

            p.name +

            " " +

            p.category +

            " " +

            p.short

          ).toLowerCase().indexOf(q) >= 0;

        });

      }



      if (sort === "price-asc") {

        list.sort(function (a, b) {

          return a.price - b.price;

        });

      } else if (sort === "price-desc") {

        list.sort(function (a, b) {

          return b.price - a.price;

        });

      } else if (sort === "name") {

        list.sort(function (a, b) {

          return a.name.localeCompare(b.name);

        });

      }



      grid.innerHTML = list.map(UI.productCard).join("");



      var total = S.getActiveProducts().length;

      var shown = list.length;



      countEl.textContent = shown === total

        ? "Showing all " + total + " products"

        : "Showing " + shown + " of " + total + " products";



      emptyEl.hidden = shown > 0;

    }



    chips.addEventListener("click", function (e) {

      var btn = e.target.closest("[data-cat]");



      if (!btn) {

        return;

      }



      activeCat = btn.getAttribute("data-cat");



      renderChips();

      renderGrid();



      history.replaceState(

        null,

        "",

        activeCat === "All"

          ? "shop.html"

          : "shop.html?category=" + encodeURIComponent(activeCat)

      );

    });



    if (searchEl) {

      searchEl.addEventListener("input", function () {

        query = searchEl.value.trim();

        renderGrid();

      });

    }



    if (sortEl) {

      sortEl.addEventListener("change", function () {

        sort = sortEl.value;

        renderGrid();

      });

    }



    renderChips();

    renderGrid();

  }



  /* ================= PRODUCT ================= */

  function initProduct() {

    var params = new URLSearchParams(global.location.search);

    var id = params.get("id");

    var p = id ? S.getProduct(id) : null;

    var host = global.document.getElementById("productHost");



    if (!p) {

      host.innerHTML =

        '<div class="empty">' +

          '<h3>Product not found</h3>' +

          '<p>This item is no longer listed. It may have been removed in the demo admin.</p>' +

          '<a class="btn btn-primary" href="shop.html">Back to shop</a>' +

        '</div>';



      return;

    }



    var selected = {};



    if (p.options && p.options.values.length) {

      selected[p.options.label] = p.options.values[0];

    }



    var qty = 1;



    function optionSummary() {

      var keys = Object.keys(selected);



      if (!keys.length) {

        return "—";

      }



      return keys.map(function (k) {

        return k + ": " + selected[k];

      }).join(", ");

    }



    function optionsHtml() {

      if (!p.options || !p.options.values.length) {

        return "";

      }



      return (

        '<div class="opt-group">' +

          '<div class="opt-label">' +

            esc(p.options.label) +

            ' <span class="muted" data-opt-current>— ' +

            esc(selected[p.options.label]) +

            '</span>' +

          '</div>' +



          '<div class="swatches" role="group" aria-label="' +

            esc(p.options.label) +

            '">' +



            p.options.values.map(function (v) {

              return (

                '<button type="button" class="swatch" data-opt="' +

                esc(v) +

                '" aria-pressed="' +

                (v === selected[p.options.label]) +

                '">' +

                esc(v) +

                '</button>'

              );

            }).join("") +



          '</div>' +

        '</div>'

      );

    }



    function specHtml() {

      var rows = [];



      if (p.specs) {

        Object.keys(p.specs).forEach(function (k) {

          rows.push(

            '<li>' +

              '<span class="k">' + esc(k) + '</span>' +

              '<span class="v">' + esc(p.specs[k]) + '</span>' +

            '</li>'

          );

        });

      }



      rows.push(

        '<li>' +

          '<span class="k">Category</span>' +

          '<span class="v">' + esc(p.category) + '</span>' +

        '</li>'

      );



      rows.push(

        '<li>' +

          '<span class="k">Available</span>' +

          '<span class="v">' +

            (p.active ? "In stock" : "Out of stock") +

          '</span>' +

        '</li>'

      );



      return '<ul class="spec-list">' + rows.join("") + '</ul>';

    }



    host.innerHTML =

      '<div class="crumbs">' +

        '<a href="index.html">Home</a>' +

        '<span>/</span>' +

        '<a href="shop.html">Shop</a>' +

        '<span>/</span>' +

        '<a href="shop.html?category=' +

          encodeURIComponent(p.category) +

          '">' +

          esc(p.category) +

        '</a>' +

      '</div>' +



      '<div class="product-layout section-tight">' +



        '<div class="product-media">' +

          '<img src="' +

            productArtSrc(p.art) +

            '" alt="' +

            esc(p.name) +

            '" width="240" height="240">' +

        '</div>' +



        '<div>' +

          '<span class="card-cat">' + esc(p.category) + '</span>' +

          '<h1>' + esc(p.name) + '</h1>' +

          '<div class="product-price">' + S.pesoShort(p.price) + '</div>' +

          '<p>' + esc(p.short) + '</p>' +



          optionsHtml() +



          '<div class="qty-row">' +

            '<div class="opt-label" style="margin:0">Quantity</div>' +



            '<div class="qty-control">' +

              '<button type="button" data-qty-down aria-label="Decrease quantity">−</button>' +

              '<input type="number" inputmode="numeric" min="1" max="99" value="1" data-qty aria-label="Quantity">' +

              '<button type="button" data-qty-up aria-label="Increase quantity">+</button>' +

            '</div>' +

          '</div>' +



          '<div class="add-row">' +



            (

              p.active

                ? '<button class="btn btn-primary btn-block" type="button" data-add-to-cart>Add to cart</button>'

                : '<button class="btn btn-outline btn-block" type="button" disabled>Out of stock</button>'

            ) +



            '<a class="btn btn-outline btn-block" href="shop.html">Continue shopping</a>' +

          '</div>' +



          '<div class="callout" style="margin-top:18px">' +

            '<p><strong>Payment:</strong> GCash, QR Ph or bank transfer. Upload your receipt at checkout and we verify it manually.</p>' +

          '</div>' +

        '</div>' +

      '</div>' +



      '<div class="panel section-tight">' +

        '<div class="panel-head">' +

          '<h2>Description</h2>' +

        '</div>' +



        '<p>' + esc(p.description) + '</p>' +



        '<h3 style="margin-top:22px">Details</h3>' +



        specHtml() +

      '</div>' +



      '<section class="section">' +

        '<div class="sec-head">' +

          '<h2>You may also like</h2>' +

          '<a class="link-more" href="shop.html">All products</a>' +

        '</div>' +



        '<div class="grid-products" id="relatedGrid"></div>' +

      '</section>';



    var rel = S.getActiveProducts().filter(function (x) {

      return x.id !== p.id && x.category === p.category;

    }).slice(0, 4);



    if (rel.length < 4) {

      S.getActiveProducts().forEach(function (x) {

        if (

          rel.length < 4 &&

          x.id !== p.id &&

          rel.indexOf(x) === -1

        ) {

          rel.push(x);

        }

      });

    }



    global.document.getElementById("relatedGrid").innerHTML =

      rel.map(UI.productCard).join("");



    var qtyInput = host.querySelector("[data-qty]");



    function setQty(v) {

      qty = Math.max(1, Math.min(99, v || 1));

      qtyInput.value = qty;

    }



    host.querySelector("[data-qty-down]").addEventListener(

      "click",

      function () {

        setQty(qty - 1);

      }

    );



    host.querySelector("[data-qty-up]").addEventListener(

      "click",

      function () {

        setQty(qty + 1);

      }

    );



    qtyInput.addEventListener("change", function () {

      setQty(parseInt(qtyInput.value, 10));

    });



    host.addEventListener("click", function (e) {

      var sw = e.target.closest("[data-opt]");



      if (sw) {

        var v = sw.getAttribute("data-opt");



        selected[p.options.label] = v;



        host.querySelectorAll("[data-opt]").forEach(function (b) {

          b.setAttribute(

            "aria-pressed",

            b.getAttribute("data-opt") === v ? "true" : "false"

          );

        });



        var cur = host.querySelector("[data-opt-current");



        if (cur) {

          cur.textContent = "— " + v;

        }



        return;

      }



      if (e.target.closest("[data-add-to-cart]")) {

        S.addToCart({

          id: p.id,

          name: p.name,

          price: p.price,

          option: optionSummary(),

          qty: qty,

          art: p.art

        });



        UI.toast(qty + " × " + p.name + " added to your cart");

      }

    });

  }



  /* ================= CART ================= */

  function initCart() {

    var host = global.document.getElementById("cartHost");



    function render() {

      var cart = S.getCart();



      if (!cart.length) {

        host.innerHTML =

          '<div class="empty">' +

            '<h3>Your cart is empty</h3>' +

            '<p>Browse the shop and add a few items. Nothing is charged in this demo.</p>' +

            '<a class="btn btn-primary" href="shop.html">Go to shop</a>' +

          '</div>';



        return;

      }



      var t = S.computeTotals(cart);



      var freeNote =

        t.shipping === 0

          ? '<p class="small muted" style="margin:6px 0 0">Shipping is free on this order.</p>'

          : '<p class="small muted" style="margin:6px 0 0">Add ' +

            S.pesoShort(

              (Number(S.getSettings().freeShippingThreshold) || 0) -

              t.subtotal

            ) +

            ' more for free shipping.</p>';



      host.innerHTML =

        '<div class="cart-layout">' +



          '<div class="panel">' +

            '<div class="panel-head">' +

              '<h2>Items in your cart</h2>' +

              '<p>' +

                S.cartCount() +

                ' item' +

                (S.cartCount() === 1 ? "" : "s") +

              '</p>' +

            '</div>' +



            cart.map(function (l, i) {

              return (

                '<div class="cart-line">' +



                  '<img src="' +

                    productArtSrc(l.art) +

                    '" alt="' +

                    esc(l.name) +

                    '" width="76" height="76">' +



                  '<div class="cart-line-info">' +

                    '<h3>' + esc(l.name) + '</h3>' +



                    (

                      l.option && l.option !== "—"

                        ? '<div class="opt">' + esc(l.option) + '</div>'

                        : ''

                    ) +



                    '<div class="cart-line-foot">' +

                      '<div class="qty-control sm">' +



                        '<button type="button" data-line-down="' +

                          i +

                          '" aria-label="Decrease quantity of ' +

                          esc(l.name) +

                          '">−</button>' +



                        '<input type="number" inputmode="numeric" min="1" max="99" value="' +

                          l.qty +

                          '" data-line-qty="' +

                          i +

                          '" aria-label="Quantity of ' +

                          esc(l.name) +

                          '">' +



                        '<button type="button" data-line-up="' +

                          i +

                          '" aria-label="Increase quantity of ' +

                          esc(l.name) +

                          '">+</button>' +



                      '</div>' +



                      '<span class="cart-line-price">' +

                        S.peso(l.price * l.qty) +

                      '</span>' +

                    '</div>' +



                    '<button class="btn btn-quiet" type="button" data-line-remove="' +

                      i +

                      '" style="padding-left:0">Remove</button>' +

                  '</div>' +

                '</div>'

              );

            }).join("") +



          '</div>' +



          '<div class="panel">' +

            '<div class="panel-head">' +

              '<h3>Order summary</h3>' +

            '</div>' +



            '<div class="summary-row">' +

              '<span class="k">Subtotal</span>' +

              '<span>' + S.peso(t.subtotal) + '</span>' +

            '</div>' +



            '<div class="summary-row">' +

              '<span class="k">Delivery</span>' +

              '<span>' +

                (t.shipping ? S.peso(t.shipping) : "Free") +

              '</span>' +

            '</div>' +



            '<div class="summary-row total">' +

              '<span class="k">Total</span>' +

              '<span>' + S.peso(t.total) + '</span>' +

            '</div>' +



            freeNote +



            '<div class="stack" style="margin-top:18px">' +

              '<a class="btn btn-primary btn-block" href="checkout.html">Proceed to checkout</a>' +

              '<a class="btn btn-outline btn-block" href="shop.html">Continue shopping</a>' +

            '</div>' +



            '<div class="callout" style="margin-top:16px">' +

              '<p class="small">Payment is arranged manually after checkout. Have your GCash, QR Ph screenshot or bank transfer slip ready.</p>' +

            '</div>' +

          '</div>' +

        '</div>';

    }



    host.addEventListener("click", function (e) {

      var b;



      if ((b = e.target.closest("[data-line-down]"))) {

        var i1 = +b.getAttribute("data-line-down");



        S.updateCartQty(

          i1,

          S.getCart()[i1].qty - 1

        );



        render();

      } else if ((b = e.target.closest("[data-line-up]"))) {

        var i2 = +b.getAttribute("data-line-up");



        S.updateCartQty(

          i2,

          S.getCart()[i2].qty + 1

        );



        render();

      } else if ((b = e.target.closest("[data-line-remove]"))) {

        S.removeFromCart(

          +b.getAttribute("data-line-remove")

        );



        render();

        UI.toast("Item removed");

      }

    });



    host.addEventListener("change", function (e) {

      var inp = e.target.closest("[data-line-qty]");



      if (!inp) {

        return;

      }



      var i = +inp.getAttribute("data-line-qty");



      S.updateCartQty(

        i,

        parseInt(inp.value, 10)

      );



      render();

    });



    render();



    global.addEventListener(

      "habagat:change",

      render

    );

  }

    /* ================= CHECKOUT ================= */

  function initCheckout() {

    var host = global.document.getElementById("checkoutHost");

    var cart = S.getCart();



    if (!cart.length) {

      host.innerHTML =

        '<div class="empty">' +

          '<h3>Nothing to check out</h3>' +

          '<p>Your cart is empty, so there is no order to submit yet.</p>' +

          '<a class="btn btn-primary" href="shop.html">Go to shop</a>' +

        '</div>';



      return;

    }



    var st = S.getSettings();

    var t = S.computeTotals(cart);

    var payment = "GCash";

    var delivery = "Delivery";



    function summaryHtml() {

      return (

        '<div class="panel">' +



          '<div class="panel-head">' +

            '<h3>Order summary</h3>' +

            '<p>' +

              S.cartCount() +

              ' item' +

              (S.cartCount() === 1 ? "" : "s") +

            '</p>' +

          '</div>' +



          cart.map(function (l) {

            return (

              '<div class="summary-row">' +

                '<span class="k">' +

                  l.qty +

                  ' × ' +

                  esc(l.name) +



                  (

                    l.option && l.option !== "—"

                      ? ' <span class="muted small">(' +

                        esc(l.option) +

                        ')</span>'

                      : ''

                  ) +



                '</span>' +



                '<span class="nowrap">' +

                  S.peso(l.price * l.qty) +

                '</span>' +

              '</div>'

            );

          }).join("") +



          '<div class="summary-row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:10px">' +

            '<span class="k">Subtotal</span>' +

            '<span>' + S.peso(t.subtotal) + '</span>' +

          '</div>' +



          '<div class="summary-row">' +

            '<span class="k">Delivery</span>' +

            '<span data-ship>' +

              (t.shipping ? S.peso(t.shipping) : "Free") +

            '</span>' +

          '</div>' +



          '<div class="summary-row total">' +

            '<span class="k">Total due</span>' +

            '<span data-total>' +

              S.peso(t.total) +

            '</span>' +

          '</div>' +



        '</div>'

      );

    }



    function paymentPanel() {

      if (payment === "GCash") {

        return (

          '<div class="callout">' +

            '<p><strong>Send ' +

              S.peso(t.total) +

              ' via GCash</strong></p>' +



            '<ul class="list-plain">' +

              '<li>' +

                '<span class="muted">Account name</span><br>' +

                esc(st.gcashName) +

              '</li>' +



              '<li>' +

                '<span class="muted">GCash number</span><br>' +

                '<strong>' +

                  esc(st.gcashNumber) +

                '</strong>' +

              '</li>' +

            '</ul>' +



            '<p class="small" style="margin-top:10px">' +

              'Include your order reference in the GCash notes if the app allows it.' +

            '</p>' +

          '</div>'

        );

      }



      if (payment === "QR Ph") {

        return (

          '<div class="callout">' +

            '<p><strong>Scan to pay ' +

              S.peso(t.total) +

              '</strong></p>' +



            '<figure class="map-figure" style="max-width:230px;padding:10px;background:#fff">' +

              qrArt() +

            '</figure>' +



            '<p class="small" style="margin-top:10px">' +

              esc(st.qrLabel) +

              '. Open any participating bank or e-wallet app, scan, and enter the amount shown above.' +

            '</p>' +

          '</div>'

        );

      }



      return (

        '<div class="callout">' +

          '<p><strong>Transfer ' +

            S.peso(t.total) +

            ' to our bank account</strong></p>' +



          '<ul class="list-plain">' +

            '<li>' +

              '<span class="muted">Bank</span><br>' +

              esc(st.bankName) +

            '</li>' +



            '<li>' +

              '<span class="muted">Account name</span><br>' +

              esc(st.bankAccountName) +

            '</li>' +



            '<li>' +

              '<span class="muted">Account number</span><br>' +

              '<strong>' +

                esc(st.bankAccountNumber) +

              '</strong>' +

            '</li>' +

          '</ul>' +



          '<p class="small" style="margin-top:10px">' +

            'Transfers are usually credited on the same banking day.' +

          '</p>' +

        '</div>'

      );

    }



    function qrArt() {

      var svg =

        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29 29" width="210" height="210" role="img" aria-label="Demo QR Ph code">' +

          '<rect width="29" height="29" fill="#fff"/>' +

          '<g fill="#1d1c1a">';



      var seed = 7;



      function rnd() {

        seed =

          (seed * 1103515245 + 12345) &

          0x7fffffff;



        return seed / 0x7fffffff;

      }



      for (var y = 0; y < 29; y++) {

        for (var x = 0; x < 29; x++) {

          var corner =

            (x < 8 && y < 8) ||

            (x > 20 && y < 8) ||

            (x < 8 && y > 20);



          if (corner) {

            continue;

          }



          if (rnd() > 0.52) {

            svg +=

              '<rect x="' +

              x +

              '" y="' +

              y +

              '" width="1" height="1"/>';

          }

        }

      }



      function eye(ox, oy) {

        return (

          '<rect x="' +

          ox +

          '" y="' +

          oy +

          '" width="7" height="7"/>' +



          '<rect x="' +

          (ox + 1) +

          '" y="' +

          (oy + 1) +

          '" width="5" height="5" fill="#fff"/>' +



          '<rect x="' +

          (ox + 2) +

          '" y="' +

          (oy + 2) +

          '" width="3" height="3"/>'

        );

      }



      svg +=

        eye(0, 0) +

        eye(22, 0) +

        eye(0, 22);



      svg += '</g></svg>';



      return svg;

    }



    host.innerHTML =

      '<ol class="steps">' +

        '<li class="on"><span class="n">1</span>Cart</li>' +

        '<li class="on"><span class="n">2</span>Your details</li>' +

        '<li class="on"><span class="n">3</span>Payment</li>' +

        '<li><span class="n">4</span>Confirmation</li>' +

      '</ol>' +



      '<form id="checkoutForm" novalidate>' +



        '<div class="cart-layout">' +



          '<div>' +



            '<div class="panel">' +

              '<div class="panel-head">' +

                '<h2>Your details</h2>' +

                '<p>We only use these to contact you about this order.</p>' +

              '</div>' +



              '<div class="field" data-field="fullName">' +

                '<label for="fullName">Full name</label>' +

                '<input class="input" id="fullName" name="fullName" autocomplete="name" required>' +

                '<div class="field-error">Please enter your full name.</div>' +

              '</div>' +



              '<div class="field-row two">' +



                '<div class="field" data-field="email">' +

                  '<label for="email">Email address</label>' +

                  '<input class="input" id="email" name="email" type="email" autocomplete="email" required>' +

                  '<div class="field-error">Please enter a valid email address.</div>' +

                '</div>' +



                '<div class="field" data-field="mobile">' +

                  '<label for="mobile">Mobile number</label>' +

                  '<input class="input" id="mobile" name="mobile" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX" required>' +

                  '<div class="field-error">Please enter a mobile number with at least 10 digits.</div>' +

                '</div>' +



              '</div>' +



              '<div class="field">' +

                '<label for="delivery">Delivery or pickup</label>' +



                '<select class="select" id="delivery" name="delivery">' +

                  '<option value="Delivery">Deliver to my address</option>' +

                  '<option value="Pickup">Pick up at the store</option>' +

                '</select>' +



                '<span class="hint" data-delivery-hint></span>' +

              '</div>' +



              '<div class="field" data-field="address" data-address-block>' +

                '<label for="address">Delivery address</label>' +

                '<textarea class="textarea" id="address" name="address" autocomplete="street-address" data-address-input></textarea>' +

                '<div class="field-error">Please enter the full delivery address.</div>' +

              '</div>' +



              '<div class="field">' +

                '<label for="notes">' +

                  'Order notes <span class="hint" style="display:inline">(optional)</span>' +

                '</label>' +



                '<textarea class="textarea" id="notes" name="notes" placeholder="Landmark, preferred delivery time, gift note…"></textarea>' +

              '</div>' +

            '</div>' +



            '<div class="panel">' +

              '<div class="panel-head">' +

                '<h2>Payment method</h2>' +

                '<p>Manual payment only — we verify every transaction by hand.</p>' +

              '</div>' +



              '<div class="check-list" id="payList">' +



                ["GCash", "QR Ph", "Bank Transfer"].map(function (m) {

                  var desc =

                    m === "GCash"

                      ? "Send via the GCash app, then upload a screenshot."

                      : m === "QR Ph"

                        ? "Scan the QR code with any bank or e-wallet app."

                        : "Transfer from your bank, then upload the slip.";



                  return (

                    '<label class="check-card' +

                      (m === payment ? " selected" : "") +

                    '">' +



                      '<input type="radio" name="payment" value="' +

                        m +

                        '"' +

                        (m === payment ? " checked" : "") +

                      '>' +



                      '<span>' +

                        '<strong>' + m + '</strong>' +

                        '<span>' + desc + '</span>' +

                      '</span>' +



                    '</label>'

                  );

                }).join("") +



              '</div>' +



              '<div style="margin-top:16px" data-payment-panel>' +

                paymentPanel() +

              '</div>' +

            '</div>' +



            '<div class="panel">' +

              '<div class="panel-head">' +

                '<h2>Payment proof</h2>' +

                '<p>Demo only — the file stays in your browser and is never uploaded.</p>' +

              '</div>' +



              '<div class="callout callout-warn" style="margin-bottom:14px">' +

                '<p class="small">' +

                  '<strong>Demo behaviour:</strong> no file leaves this device. A simulated receipt is attached to your order so you can see the admin verification flow.' +

                '</p>' +

              '</div>' +



              '<div class="file-drop">' +

                '<label for="proof" style="display:block;font-weight:550;margin-bottom:8px">' +

                  'Upload receipt or screenshot' +

                '</label>' +



                '<input type="file" id="proof" name="proof" accept="image/*,.pdf">' +



                '<div class="file-name" data-proof-name>' +

                  'No file selected — a simulated receipt will be used.' +

                '</div>' +

              '</div>' +



              '<div class="field" style="margin-top:14px">' +

                '<label for="proofNote">' +

                  'Receipt note <span class="hint" style="display:inline">(optional)</span>' +

                '</label>' +



                '<input class="input" id="proofNote" name="proofNote" placeholder="e.g. Paid at 10:42 AM, reference 8821">' +

              '</div>' +



              '<label class="check-card" style="margin-top:6px">' +

                '<input type="checkbox" id="confirmBox">' +



                '<span>' +

                  '<strong>I confirm the details are correct</strong>' +

                  '<span>This is a demo order and no money will be collected.</span>' +

                '</span>' +

              '</label>' +



              '<div class="field-error" id="confirmError" style="display:none;margin-top:8px">' +

                'Please tick the confirmation box.' +

              '</div>' +

            '</div>' +



          '</div>' +



          '<div>' +

            summaryHtml() +



            '<div class="panel">' +

              '<button class="btn btn-primary btn-block" type="submit">' +

                'Submit order' +

              '</button>' +



              '<a class="btn btn-outline btn-block" href="cart.html" style="margin-top:10px">' +

                'Back to cart' +

              '</a>' +



              '<p class="small muted" style="margin:14px 0 0">' +

                esc(st.deliveryNote) +

              '</p>' +

            '</div>' +



          '</div>' +



        '</div>' +

      '</form>';



    var form =

      global.document.getElementById("checkoutForm");



    var delSel =

      global.document.getElementById("delivery");



    var addrBlock =

      host.querySelector("[data-address-block]");



    var addrInput =

      host.querySelector("[data-address-input]");



    var deliveryHint =

      host.querySelector("[data-delivery-hint]");



    function syncDelivery() {

      delivery = delSel.value;



      if (delivery === "Pickup") {

        addrBlock.style.display = "none";

        addrInput.removeAttribute("required");



        deliveryHint.textContent =

          "Collect at " +

          st.address +

          ". No delivery fee is charged.";



        t = {

          subtotal: t.subtotal,

          shipping: 0,

          total: t.subtotal

        };

      } else {

        addrBlock.style.display = "";

        addrInput.setAttribute(

          "required",

          "required"

        );



        deliveryHint.textContent =

          st.deliveryNote;



        var c = S.getCart();



        t = S.computeTotals(c);

      }



      var shipEl =

        host.querySelector("[data-ship]");



      var totalEl =

        host.querySelector("[data-total]");



      if (shipEl) {

        shipEl.textContent =

          t.shipping

            ? S.peso(t.shipping)

            : "Free";

      }



      if (totalEl) {

        totalEl.textContent =

          S.peso(t.total);

      }



      var pp =

        host.querySelector("[data-payment-panel]");



      if (pp) {

        pp.innerHTML = paymentPanel();

      }

    }



    delSel.addEventListener(

      "change",

      syncDelivery

    );



    syncDelivery();



    global.document

      .getElementById("payList")

      .addEventListener("change", function (e) {

        if (e.target.name !== "payment") {

          return;

        }



        payment = e.target.value;



        host.querySelectorAll(

          "#payList .check-card"

        ).forEach(function (c) {

          c.classList.toggle(

            "selected",

            c.querySelector("input").value === payment

          );

        });



        host.querySelector(

          "[data-payment-panel]"

        ).innerHTML = paymentPanel();

      });



    var proofInput =

      global.document.getElementById("proof");



    proofInput.addEventListener(

      "change",

      function () {

        var nameEl =

          host.querySelector("[data-proof-name]");



        if (

          proofInput.files &&

          proofInput.files.length

        ) {

          var f = proofInput.files[0];



          nameEl.textContent =

            f.name +

            " (" +

            Math.max(

              1,

              Math.round(f.size / 1024)

            ) +

            " KB) — recorded in demo mode only.";

        } else {

          nameEl.textContent =

            "No file selected — a simulated receipt will be used.";

        }

      }

    );



    function invalid(name, on) {

      var wrap =

        host.querySelector(

          '[data-field="' + name + '"]'

        );



      if (wrap) {

        if (on) {

          wrap.classList.add("invalid");

        } else {

          wrap.classList.remove("invalid");

        }

      }

    }



    form.addEventListener(

      "submit",

      function (e) {

        e.preventDefault();



        var ok = true;



        var fullName =

          form.fullName.value.trim();



        invalid(

          "fullName",

          !fullName

        );



        if (!fullName) {

          ok = false;

        }



        var email =

          form.email.value.trim();



        var validEmail =

          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(

            email

          );



        invalid(

          "email",

          !validEmail

        );



        if (!validEmail) {

          ok = false;

        }



        var mobile =

          form.mobile.value.replace(

            /\D/g,

            ""

          );



        invalid(

          "mobile",

          mobile.length < 10

        );



        if (mobile.length < 10) {

          ok = false;

        }



        var address =

          addrInput.value.trim();



        if (delivery === "Delivery") {

          invalid(

            "address",

            address.length < 7

          );



          if (address.length < 7) {

            ok = false;

          }

        } else {

          invalid(

            "address",

            false

          );



          address =

            "Pickup — " +

            st.address;

        }



        var confirmed =

          global.document

            .getElementById("confirmBox")

            .checked;



        global.document

          .getElementById("confirmError")

          .style.display =

            confirmed

              ? "none"

              : "block";



        if (!confirmed) {

          ok = false;

        }



        if (!ok) {

          var firstBad =

            host.querySelector(

              ".field.invalid, #confirmError[style*='block']"

            );



          if (firstBad) {

            firstBad.scrollIntoView({

              behavior: "smooth",

              block: "center"

            });

          }



          UI.toast(

            "Please complete the highlighted fields"

          );



          return;

        }



        var cartNow =

          S.getCart();



        var totals =

          delivery === "Pickup"

            ? {

                subtotal:

                  cartNow.reduce(

                    function (n, l) {

                      return (

                        n +

                        l.price * l.qty

                      );

                    },

                    0

                  ),

                shipping: 0,

                total: 0

              }

            : S.computeTotals(

                cartNow

              );



        if (delivery === "Pickup") {

          totals.total =

            totals.subtotal;

        }



        var proofName =

          proofInput.files &&

          proofInput.files.length

            ? proofInput.files[0].name

            : "demo-receipt-" +

              payment

                .toLowerCase()

                .replace(/\s+/g, "-") +

              ".png";



        var order = {

          ref: S.newRef(),



          createdAt:

            new Date().toISOString(),



          customer: {

            name: fullName,

            email: email,

            mobile:

              form.mobile.value.trim(),

            address: address,

            method: delivery,

            notes:

              form.notes.value.trim()

          },



          items:

            cartNow.map(

              function (l) {

                return {

                  id: l.id,

                  name: l.name,

                  option: l.option,

                  qty: l.qty,

                  price: l.price

                };

              }

            ),



          shipping:

            totals.shipping,



          paymentMethod:

            payment,



          proof: {

            filename:

              proofName,

            note:

              global.document

                .getElementById(

                  "proofNote"

                )

                .value.trim(),

            submitted: true

          },



          paymentStatus:

            "pending",



          status:

            "Pending"

        };



        S.createOrder(order);

        S.clearCart();



        global.location.href =

          "confirmation.html?ref=" +

          encodeURIComponent(

            order.ref

          );

      }

    );

  }



  /* ================= CONFIRMATION ================= */
  function initConfirmation() {
    var host =
      global.document.getElementById(
        "confirmHost"
      );

    var ref =
      new URLSearchParams(
        global.location.search
      ).get("ref");

    var order =
      ref
        ? S.getOrder(ref)
        : null;

    if (!order) {
      host.innerHTML =
        '<div class="empty">' +
          '<h3>Order not found</h3>' +
          '<p>We could not find that reference. It may have been cleared by a demo data reset.</p>' +
          '<a class="btn btn-primary" href="shop.html">Back to shop</a>' +
        '</div>';

      return;
    }

    var paymentLabel =
      order.paymentStatus === "verified"
        ? "Verified"
        : order.paymentStatus === "rejected"
          ? "Rejected"
          : "Awaiting verification";

    var paymentClass =
      order.paymentStatus === "verified"
        ? "verified"
        : order.paymentStatus === "rejected"
          ? "rejected"
          : "unverified";

    host.innerHTML =
      '<ol class="steps">' +
        '<li class="on"><span class="n">1</span>Cart</li>' +
        '<li class="on"><span class="n">2</span>Your details</li>' +
        '<li class="on"><span class="n">3</span>Payment</li>' +
        '<li class="on"><span class="n">4</span>Confirmation</li>' +
      '</ol>' +

      '<div class="panel">' +
        '<div class="panel-head">' +
          '<span class="card-cat">Order received</span>' +
          '<h1 style="font-size:1.6rem;margin-top:5px">Thank you for your order</h1>' +
          '<p>Your order has been submitted successfully and is waiting for manual payment verification.</p>' +
        '</div>' +

        '<div class="callout">' +
          '<div class="small muted">Order reference</div>' +
          '<div style="font-size:1.15rem;font-weight:650;margin-top:3px">' +
            esc(order.ref) +
          '</div>' +
          '<p class="small" style="margin:7px 0 0">Keep this reference number for any questions about your order.</p>' +
        '</div>' +

        '<div class="field-row two" style="margin-top:20px">' +
          '<div>' +
            '<div class="small muted">Order status</div>' +
            '<div style="margin-top:5px"><span class="status ' +
              order.status.toLowerCase() +
            '">' +
              esc(order.status) +
            '</span></div>' +
            '<div class="small muted" style="margin-top:6px">Submitted ' +
              esc(S.formatDate(order.createdAt)) +
            '</div>' +
          '</div>' +

          '<div>' +
            '<div class="small muted">Payment</div>' +
            '<div style="font-weight:600;margin-top:4px">' +
              esc(order.paymentMethod) +
            '</div>' +
            '<div style="margin-top:5px"><span class="status ' +
              paymentClass +
            '">' +
              esc(paymentLabel) +
            '</span></div>' +
          '</div>' +

          '<div>' +
            '<div class="small muted">Fulfilment</div>' +
            '<div style="font-weight:600;margin-top:4px">' +
              esc(order.customer.method) +
            '</div>' +
            '<div class="small muted" style="margin-top:4px">' +
              esc(order.customer.address) +
            '</div>' +
          '</div>' +

          '<div>' +
            '<div class="small muted">Contact</div>' +
            '<div style="margin-top:4px">' +
              esc(order.customer.email) +
            '</div>' +
            '<div class="small muted" style="margin-top:3px">' +
              esc(order.customer.mobile) +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div style="border-top:1px solid var(--line);margin-top:20px;padding-top:18px">' +
          '<div class="small muted">Payment proof submitted</div>' +
          '<div style="font-weight:550;margin-top:4px">' +
            esc(order.proof.filename) +
          '</div>' +
          (
            order.proof.note
              ? '<div class="small muted" style="margin-top:4px">' +
                  esc(order.proof.note) +
                '</div>'
              : ''
          ) +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel-head">' +
          '<h2>Your items</h2>' +
          '<p>Items included in this order.</p>' +
        '</div>' +

        order.items.map(function (l) {
          return (
            '<div class="summary-row">' +
              '<span class="k">' +
                l.qty +
                ' × ' +
                esc(l.name) +
                (
                  l.option && l.option !== "—"
                    ? ' <span class="muted small">(' +
                        esc(l.option) +
                      ')</span>'
                    : ''
                ) +
              '</span>' +
              '<span class="nowrap">' +
                S.peso(l.price * l.qty) +
              '</span>' +
            '</div>'
          );
        }).join("") +

        '<div class="summary-row" style="border-top:1px solid var(--line);margin-top:8px;padding-top:10px">' +
          '<span class="k">Subtotal</span>' +
          '<span>' + S.peso(order.subtotal) + '</span>' +
        '</div>' +

        '<div class="summary-row">' +
          '<span class="k">Delivery</span>' +
          '<span>' +
            (order.shipping ? S.peso(order.shipping) : "Free") +
          '</span>' +
        '</div>' +

        '<div class="summary-row total">' +
          '<span class="k">Total</span>' +
          '<span>' + S.peso(order.total) + '</span>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel-head">' +
          '<h2>What happens next</h2>' +
          '<p>Your order remains pending while the payment proof is reviewed.</p>' +
        '</div>' +

        '<div class="stack">' +
          '<div>' +
            '<strong>1. Payment verification</strong>' +
            '<p class="small muted" style="margin:4px 0 0">We review the submitted payment proof manually.</p>' +
          '</div>' +

          '<div>' +
            '<strong>2. Order confirmation</strong>' +
            '<p class="small muted" style="margin:4px 0 0">Once the payment is verified, the order can be confirmed and prepared.</p>' +
          '</div>' +

          '<div>' +
            '<strong>3. Fulfilment</strong>' +
            '<p class="small muted" style="margin:4px 0 0">' +
              esc(S.getSettings().deliveryNote) +
            '</p>' +
          '</div>' +
        '</div>' +

        '<div class="callout callout-warn" style="margin-top:18px">' +
          '<p class="small"><strong>Demo notice:</strong> No real payment is collected and no goods are shipped. The order is stored in this browser so you can test the Demo Admin workflow.</p>' +
        '</div>' +
      '</div>' +

      '<div class="stack" style="margin-top:18px">' +
        '<a class="btn btn-primary btn-block" href="admin.html">View order in Demo Admin</a>' +
        '<a class="btn btn-outline btn-block" href="shop.html">Continue shopping</a>' +
      '</div>';
  }

  /* ================= ABOUT / CONTACT ================= */

  function initAbout() {

    var s =

      S.getSettings();



    var el =

      global.document.getElementById(

        "aboutBody"

      );



    if (el) {

      el.innerHTML =

        String(

          s.aboutLong || ""

        )

          .split("\n\n")

          .map(function (t) {

            return (

              "<p>" +

              esc(t) +

              "</p>"

            );

          })

          .join("");

    }



    var box =

      global.document.getElementById(

        "aboutStoreInfo"

      );



    if (box) {

      box.innerHTML =

        '<ul class="list-plain">' +



          '<li>' +

            '<span class="muted">Store</span><br>' +

            '<strong>' +

              esc(s.storeName) +

            '</strong>' +

          '</li>' +



          '<li>' +

            '<span class="muted">Address</span><br>' +

            esc(s.address) +

          '</li>' +



          '<li>' +

            '<span class="muted">Hours</span><br>' +

            esc(s.hours) +

          '</li>' +



          '<li>' +

            '<span class="muted">Email</span><br>' +

            esc(s.email) +

          '</li>' +



          '<li>' +

            '<span class="muted">Mobile</span><br>' +

            esc(s.phone) +

          '</li>' +



        '</ul>';

    }

  }



  function initContact() {

    var s =

      S.getSettings();



    var info =

      global.document.getElementById(

        "contactInfo"

      );



    if (info) {

      info.innerHTML =

        '<ul class="list-plain">' +



          '<li>' +

            '<span class="muted">Email</span><br>' +

            '<a href="mailto:' +

              esc(s.email) +

            '">' +

              esc(s.email) +

            '</a>' +

          '</li>' +



          '<li>' +

            '<span class="muted">Mobile</span><br>' +

            '<a href="tel:' +

              esc(

                String(

                  s.phone

                ).replace(

                  /\s/g,

                  ""

                )

              ) +

            '">' +

              esc(s.phone) +

            '</a>' +

          '</li>' +



          '<li>' +

            '<span class="muted">Store address</span><br>' +

            esc(s.address) +

          '</li>' +



          '<li>' +

            '<span class="muted">Opening hours</span><br>' +

            esc(s.hours) +

          '</li>' +



          '<li>' +

            '<span class="muted">Delivery</span><br>' +

            esc(s.deliveryNote) +

          '</li>' +



        '</ul>';

    }



    var form =

      global.document.getElementById(

        "contactForm"

      );



    if (form) {

      form.addEventListener(

        "submit",

        function (e) {

          e.preventDefault();



          var name =

            form.cname.value.trim();



          var email =

            form.cemail.value.trim();



          var msg =

            form.cmessage.value.trim();



          var validEmail =

            /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(

              email

            );



          var bad =

            !name ||

            !validEmail ||

            msg.length < 5;



          form

            .querySelectorAll(

              ".field"

            )

            .forEach(

              function (f) {

                f.classList.remove(

                  "invalid"

                );

              }

            );



          if (!name) {

            form

              .querySelector(

                '[data-field="cname"]'

              )

              .classList.add(

                "invalid"

              );

          }



          if (!validEmail) {

            form

              .querySelector(

                '[data-field="cemail"]'

              )

              .classList.add(

                "invalid"

              );

          }



          if (msg.length < 5) {

            form

              .querySelector(

                '[data-field="cmessage"]'

              )

              .classList.add(

                "invalid"

              );

          }



          if (bad) {

            UI.toast(

              "Please complete the highlighted fields"

            );



            return;

          }



          form.reset();



          var done =

            global.document.getElementById(

              "contactDone"

            );



          if (done) {

            done.hidden = false;



            done.scrollIntoView({

              behavior: "smooth",

              block: "center"

            });

          }



          UI.toast(

            "Message recorded in demo mode"

          );

        }

      );

    }

  }



  /* ================= BOOT ================= */

  global.document.addEventListener(

    "DOMContentLoaded",

    function () {

      UI.mount();



      if (page === "home") {

        initHome();

      } else if (page === "shop") {

        initShop();

      } else if (page === "product") {

        initProduct();

      } else if (page === "cart") {

        initCart();

      } else if (page === "checkout") {

        initCheckout();

      } else if (page === "confirmation") {

        initConfirmation();

      } else if (page === "about") {

        initAbout();

      } else if (page === "contact") {

        initContact();

      }

    }

  );

})(window);