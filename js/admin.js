/* =========================================================
   Habagat Supply Co. — DEMO ADMIN
   No authentication. All data is client-side only.
   ========================================================= */
(function (global) {
  "use strict";
  var S = global.HabagatStore, UI = global.HabagatUI;
  var esc = UI.esc;
  var doc = global.document;

  var state = {
    tab: "dashboard",
    orderQuery: "",
    orderStatus: "All",
    productQuery: "",
    openOrderRef: null,
    editingId: null,
    draft: null
  };

  /* ---------------- helpers ---------------- */
  function statusClass(s) { return String(s || "").toLowerCase().replace(/\s+/g, "-"); }

  function statCard(k, v, sub, tone) {
    return '<div class="stat' + (tone ? " " + tone : "") + '">' +
      '<span class="k">' + esc(k) + '</span>' +
      '<span class="v">' + v + '</span>' +
      '<span class="s">' + esc(sub) + '</span></div>';
  }

  function fmtProofBytes(name) {
    if (!name) return "—";
    var ext = String(name).split(".").pop().toUpperCase().slice(0, 4);
    return ext;
  }

  /* ---------------- computations ---------------- */
  function metrics() {
    var orders = S.getOrders();
    var products = S.getProducts();
    var pending = orders.filter(function (o) { return o.status === "Pending"; }).length;
    var unverified = orders.filter(function (o) { return o.paymentStatus === "pending"; }).length;
    var revenue = orders.reduce(function (n, o) {
      return n + o.items.reduce(function (m, i) { return m + i.price * i.qty; }, 0) + (o.shipping || 0);
    }, 0);
    var verifiedRevenue = orders.filter(function (o) { return o.paymentStatus === "verified"; })
      .reduce(function (n, o) {
        return n + o.items.reduce(function (m, i) { return m + i.price * i.qty; }, 0) + (o.shipping || 0);
      }, 0);
    return {
      orders: orders.length,
      pending: pending,
      unverified: unverified,
      activeProducts: products.filter(function (p) { return p.active; }).length,
      totalProducts: products.length,
      revenue: revenue,
      verifiedRevenue: verifiedRevenue,
      open: orders.filter(function (o) { return o.status !== "Completed"; }).length
    };
  }

  /* ---------------- dashboard ---------------- */
  function renderDashboard() {
    var m = metrics();
    var orders = S.getOrders();
    var products = S.getProducts();

    var byStatus = {};
    S.statuses.forEach(function (s) { byStatus[s] = 0; });
    orders.forEach(function (o) { if (byStatus[o.status] != null) byStatus[o.status]++; });

    var recent = orders.slice(0, 5);
    var attention = orders.filter(function (o) { return o.paymentStatus !== "verified" && o.status !== "Completed"; }).slice(0, 4);

    var catCounts = {};
    products.forEach(function (p) { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });

    return '' +
      '<div class="stats">' +
        statCard("Total orders", m.orders, m.open + " still open") +
        statCard("Pending orders", m.pending, "Waiting for confirmation", m.pending ? "warn" : "") +
        statCard("Awaiting payment check", m.unverified, "Needs manual verification", m.unverified ? "alert" : "") +
        statCard("Active products", m.activeProducts, "of " + m.totalProducts + " listed") +
      '</div>' +

      '<div class="settings-grid" style="margin-top:18px">' +
        '<div class="panel">' +
          '<div class="panel-head"><h3>Recent orders</h3><p>Latest five submissions from the storefront.</p></div>' +
          (recent.length
            ? '<div class="order-cards">' + recent.map(function (o) {
                var total = o.items.reduce(function (n, i) { return n + i.price * i.qty; }, 0) + (o.shipping || 0);
                return '<div class="order-card">' +
                  '<div class="order-card-head">' +
                    '<div><span class="ref">' + esc(o.ref) + '</span>' +
                      '<div class="order-card-meta"><span>' + esc(o.customer.name) + '</span>' +
                      '<span>' + esc(S.formatDate(o.createdAt)) + '</span></div></div>' +
                    '<span class="status ' + statusClass(o.status) + '">' + esc(o.status) + '</span>' +
                  '</div>' +
                  '<div class="order-card-meta"><span>' + o.items.length + ' line item' + (o.items.length === 1 ? "" : "s") +
                    ' · ' + esc(o.paymentMethod) + '</span></div>' +
                  '<div class="order-card-foot">' +
                    '<strong>' + S.peso(total) + '</strong>' +
                    '<button class="btn btn-outline btn-sm" type="button" data-open-order="' + esc(o.ref) + '">Open order</button>' +
                  '</div>' +
                '</div>';
              }).join("") + '</div>'
            : '<p class="muted">No orders yet. Submit one from the storefront checkout to see it appear here.</p>') +
        '</div>' +

        '<div>' +
          '<div class="panel">' +
            '<div class="panel-head"><h3>Needs attention</h3><p>Orders with unverified payment and an open status.</p></div>' +
            (attention.length
              ? '<ul class="list-plain">' + attention.map(function (o) {
                  return '<li style="display:flex;justify-content:space-between;align-items:center;gap:12px">' +
                    '<span><strong class="ref" style="font-family:ui-monospace,Menlo,monospace">' + esc(o.ref) + '</strong><br>' +
                    '<span class="muted small">' + esc(o.customer.name) + ' · ' + esc(o.paymentMethod) + '</span></span>' +
                    '<span><span class="status ' + (o.paymentStatus === "rejected" ? "rejected" : "unverified") + '">' +
                      (o.paymentStatus === "rejected" ? "Payment rejected" : "Unverified") + '</span></span>' +
                  '</li>';
                }).join("") + '</ul>'
              : '<p class="muted">Nothing outstanding. Every open order has a verified payment.</p>') +
          '</div>' +
          '<div class="panel">' +
            '<div class="panel-head"><h3>Order pipeline</h3></div>' +
            '<div class="definition">' +
              S.statuses.map(function (s) {
                return '<div class="row"><dt>' + esc(s) + '</dt><dd><strong>' + byStatus[s] + '</strong> order' +
                  (byStatus[s] === 1 ? "" : "s") + '</dd></div>';
              }).join("") +
            '</div>' +
          '</div>' +
          '<div class="panel">' +
            '<div class="panel-head"><h3>Catalog</h3></div>' +
            '<div class="definition">' +
              Object.keys(catCounts).sort().map(function (c) {
                return '<div class="row"><dt>' + esc(c) + '</dt><dd>' + catCounts[c] + ' product' + (catCounts[c] === 1 ? "" : "s") + '</dd></div>';
              }).join("") +
            '</div>' +
            '<p class="small muted" style="margin-top:12px">Verified sales recorded in this demo session: <strong>' + S.peso(m.verifiedRevenue) + '</strong> of ' + S.peso(m.revenue) + ' submitted.</p>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- products ---------------- */
  function renderProducts() {
    var products = S.getProducts();
    var q = state.productQuery.toLowerCase();
    var list = q ? products.filter(function (p) {
      return (p.name + " " + p.category).toLowerCase().indexOf(q) >= 0;
    }) : products;

    return '' +
      '<div class="toolbar">' +
        '<input class="input grow" type="search" placeholder="Search products by name or category" data-product-search value="' + esc(state.productQuery) + '" aria-label="Search products">' +
        '<button class="btn btn-primary" type="button" data-new-product>Add product</button>' +
      '</div>' +
      '<div class="callout" style="margin-bottom:16px"><p class="small">Editing a product here updates the customer storefront immediately. Deactivating a product hides it from the shop without deleting it.</p></div>' +
      (list.length
        ? '<div class="table-wrap"><table class="data">' +
            '<thead><tr><th>Product</th><th>Category</th><th>Options</th><th class="num">Price</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
            list.map(function (p) {
              return '<tr>' +
                '<td><div class="cell-product">' +
                  '<img class="product-thumb-sm" src="' + p.art + '" alt="" width="44" height="44">' +
                  '<span><span class="t">' + esc(p.name) + '</span>' +
                  '<span class="c">' + esc(p.id) + '</span></span>' +
                '</div></td>' +
                '<td>' + esc(p.category) + '</td>' +
                '<td>' + (p.options && p.options.values.length
                  ? esc(p.options.label) + ': ' + p.options.values.map(esc).join(", ")
                  : '<span class="muted">None</span>') + '</td>' +
                '<td class="num">' + S.pesoShort(p.price) + '</td>' +
                '<td><span class="status ' + (p.active ? "ready" : "rejected") + '">' + (p.active ? "Active" : "Inactive") + '</span></td>' +
                '<td><div class="actions-cell">' +
                  '<button class="btn btn-outline btn-sm" type="button" data-edit-product="' + esc(p.id) + '">Edit</button>' +
                  '<button class="btn btn-outline btn-sm" type="button" data-toggle-product="' + esc(p.id) + '">' + (p.active ? "Deactivate" : "Activate") + '</button>' +
                '</div></td>' +
              '</tr>';
            }).join("") +
          '</tbody></table></div>'
        : '<div class="empty"><h3>No matching products</h3><p>Try a different search term, or add a new product.</p></div>');
  }

  /* ---------------- orders ---------------- */
  function renderOrders() {
    var orders = S.getOrders();
    var q = state.orderQuery.toLowerCase();
    var list = orders.filter(function (o) {
      if (state.orderStatus !== "All" && o.status !== state.orderStatus) return false;
      if (!q) return true;
      return (o.ref + " " + o.customer.name + " " + o.customer.email + " " + o.customer.mobile + " " + o.paymentMethod)
        .toLowerCase().indexOf(q) >= 0;
    });

    return '' +
      '<div class="toolbar">' +
        '<input class="input grow" type="search" placeholder="Search by reference, customer, email or mobile" data-order-search value="' + esc(state.orderQuery) + '" aria-label="Search orders">' +
        '<select class="select sm" data-order-status aria-label="Filter by status">' +
          ['All'].concat(S.statuses).map(function (s) {
            return '<option value="' + esc(s) + '"' + (s === state.orderStatus ? " selected" : "") + '>' + esc(s === "All" ? "All statuses" : s) + '</option>';
          }).join("") +
        '</select>' +
      '</div>' +
      (list.length
        ? '<div class="table-wrap"><table class="data">' +
            '<thead><tr><th>Reference</th><th>Customer</th><th>Payment</th><th class="num">Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
            list.map(function (o) {
              var total = o.items.reduce(function (n, i) { return n + i.price * i.qty; }, 0) + (o.shipping || 0);
              var payLabel = o.paymentStatus === "verified" ? "Verified" : (o.paymentStatus === "rejected" ? "Rejected" : "Unverified");
              return '<tr>' +
                '<td><span class="ref">' + esc(o.ref) + '</span><br><span class="muted small">' + esc(S.formatDate(o.createdAt)) + '</span></td>' +
                '<td>' + esc(o.customer.name) + '<br><span class="muted small">' + esc(o.customer.mobile) + '</span></td>' +
                '<td>' + esc(o.paymentMethod) + '<br><span class="status ' + statusClass(payLabel) + '">' + payLabel + '</span></td>' +
                '<td class="num">' + S.peso(total) + '</td>' +
                '<td><select class="select-inline" data-status-select="' + esc(o.ref) + '" aria-label="Status for ' + esc(o.ref) + '">' +
                  S.statuses.map(function (s) {
                    return '<option value="' + esc(s) + '"' + (s === o.status ? " selected" : "") + '>' + esc(s) + '</option>';
                  }).join("") +
                '</select></td>' +
                '<td><button class="btn btn-outline btn-sm" type="button" data-open-order="' + esc(o.ref) + '">Open</button></td>' +
              '</tr>';
            }).join("") +
          '</tbody></table></div>'
        : '<div class="empty"><h3>No orders match</h3><p>Try clearing the search or switching the status filter. New orders from the storefront checkout appear here instantly.</p></div>');
  }

  /* ---------------- settings ---------------- */
  function renderSettings() {
    var s = S.getSettings();
    function f(key, label, hint, type) {
      return '<div class="field">' +
        '<label for="set-' + key + '">' + esc(label) + (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</label>' +
        '<input class="input" id="set-' + key + '" name="' + key + '" type="' + (type || "text") + '" value="' + esc(s[key]) + '">' +
      '</div>';
    }
    function ta(key, label, hint) {
      return '<div class="field">' +
        '<label for="set-' + key + '">' + esc(label) + (hint ? '<span class="hint">' + esc(hint) + '</span>' : '') + '</label>' +
        '<textarea class="textarea" id="set-' + key + '" name="' + key + '">' + esc(s[key]) + '</textarea>' +
      '</div>';
    }

    return '<form id="settingsForm">' +
      '<div class="settings-grid">' +
        '<div class="panel">' +
          '<div class="panel-head"><h3>Store identity</h3><p>Shown in the header, footer and on your about page.</p></div>' +
          f("storeName", "Store name") +
          f("tagline", "Tagline", "Small line under the store name in the header.") +
          f("email", "Email address", null, "email") +
          f("phone", "Mobile number") +
          f("address", "Store address") +
          f("hours", "Opening hours") +
          ta("aboutShort", "Short introduction", "Used in the footer.") +
          ta("aboutLong", "About text", "Separate paragraphs with a blank line.") +
        '</div>' +
        '<div>' +
          '<div class="panel">' +
            '<div class="panel-head"><h3>Orders and delivery</h3><p>Applies to new orders at checkout.</p></div>' +
            f("shippingFee", "Delivery fee (PHP)", "Charged on delivery orders below the free-shipping threshold.", "number") +
            f("freeShippingThreshold", "Free delivery over (PHP)", "Set to 0 to disable free delivery.", "number") +
            ta("deliveryNote", "Delivery and pickup information", "Shown at checkout and on the contact page.") +
          '</div>' +
          '<div class="panel">' +
            '<div class="panel-head"><h3>Payment instructions</h3><p>Displayed to customers at checkout after they pick a method.</p></div>' +
            f("gcashName", "GCash account name") +
            f("gcashNumber", "GCash number") +
            f("qrLabel", "QR Ph label") +
            f("bankName", "Bank name") +
            f("bankAccountName", "Bank account name") +
            f("bankAccountNumber", "Bank account number") +
            ta("paymentNote", "Payment verification note", "Explains how long manual verification takes.") +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="panel" style="margin-top:18px">' +
        '<div class="actions-cell">' +
          '<button class="btn btn-primary" type="submit">Save settings</button>' +
          '<button class="btn btn-outline" type="button" data-reset-settings>Restore default settings</button>' +
        '</div>' +
      '</div>' +
    '</form>';
  }

  /* ---------------- shell ---------------- */
  function panels() {
    return {
      dashboard: renderDashboard(),
      products: renderProducts(),
      orders: renderOrders(),
      settings: renderSettings()
    };
  }

  function renderTabs() {
    var m = metrics();
    var tabs = [
      { id: "dashboard", label: "Dashboard" },
      { id: "products", label: "Products" },
      { id: "orders", label: "Orders", badge: m.unverified },
      { id: "settings", label: "Store settings" }
    ];
    return tabs.map(function (t) {
      return '<button class="tab" type="button" role="tab" data-tab="' + t.id + '" aria-selected="' + (state.tab === t.id) + '">' +
        esc(t.label) +
        (t.badge ? '<span class="pill">' + t.badge + '</span>' : '') +
      '</button>';
    }).join("");
  }

  function render() {
    doc.getElementById("adminTabs").innerHTML = renderTabs();
    var body = doc.getElementById("adminBody");
    body.innerHTML = panels()[state.tab];
    var extra = doc.getElementById("adminExtra");
    var host = doc.getElementById("adminMain");
    host.setAttribute("data-tab", state.tab);
    if (extra) extra.hidden = true;
    global.scrollTo({ top: global.scrollY > 140 ? doc.getElementById("adminTabs").offsetTop - 20 : 0, behavior: "smooth" });
  }

  function renderKeepScroll() {
    var y = global.scrollY;
    render();
    global.scrollTo({ top: y });
  }

  /* ---------------- product modal ---------------- */
  function openProductModal(id) {
    var p = id ? JSON.parse(JSON.stringify(S.getProduct(id))) : {
      id: "", name: "", category: S.getCategories()[0] || "Home & Storage",
      price: 0, art: "basket", active: true, featured: false, short: "",
      description: "", specs: { Material: "", Size: "", Care: "" }, options: null
    };
    state.editingId = id || null;
    state.draft = p;

    var backdrop = doc.getElementById("productModal");
    backdrop.classList.add("open");
    doc.getElementById("modalTitle").textContent = id ? "Edit product" : "Add product";
    doc.getElementById("modalSub").textContent = id
      ? "Changes appear on the storefront as soon as you save."
      : "The new product appears in the shop right away.";

    var artChoices = ["basket", "board", "blanket", "tumbler", "tote", "mug", "placemat", "picnic", "lantern", "tray", "default"];

    doc.getElementById("modalBody").innerHTML = '' +
      '<div class="field">' +
        '<label for="pName">Product name</label>' +
        '<input class="input" id="pName" value="' + esc(p.name) + '">' +
      '</div>' +
      '<div class="field-row two">' +
        '<div class="field"><label for="pCategory">Category</label>' +
          '<input class="input" id="pCategory" list="catList" value="' + esc(p.category) + '">' +
          '<datalist id="catList">' + S.getCategories().map(function (c) { return '<option value="' + esc(c) + '">'; }).join("") + '</datalist>' +
        '</div>' +
        '<div class="field"><label for="pPrice">Price (PHP)</label>' +
          '<input class="input" id="pPrice" type="number" min="0" step="1" value="' + esc(p.price) + '">' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label for="pShort">Short description<span class="hint">One line, shown on the product card.</span></label>' +
        '<input class="input" id="pShort" value="' + esc(p.short) + '">' +
      '</div>' +
      '<div class="field">' +
        '<label for="pDesc">Full description</label>' +
        '<textarea class="textarea" id="pDesc">' + esc(p.description) + '</textarea>' +
      '</div>' +
      '<div class="field">' +
        '<label for="pArt">Product image<span class="hint">Demo artwork — a real store would upload photos here.</span></label>' +
        '<select class="select" id="pArt">' + artChoices.map(function (a) {
          return '<option value="' + a + '"' + (a === p.art ? " selected" : "") + '>' + a.charAt(0).toUpperCase() + a.slice(1) + ' illustration</option>';
        }).join("") + '</select>' +
      '</div>' +
      '<div class="field">' +
        '<label>Variations / options<span class="hint">Optional. Customers pick one value at checkout.</span></label>' +
        '<div class="var-editor" id="varEditor">' +
          '<div class="var-row">' +
            '<input class="input" id="varLabel" placeholder="Option name, e.g. Colour" value="' + esc(p.options ? p.options.label : "") + '">' +
            '<button class="btn btn-outline btn-sm" type="button" data-clear-options>Clear</button>' +
          '</div>' +
          '<div class="var-row">' +
            '<input class="input" id="varValue" placeholder="Add a value, e.g. Sand">' +
            '<button class="btn btn-outline btn-sm" type="button" data-add-option>Add value</button>' +
          '</div>' +
          '<div class="var-chips" id="varChips"></div>' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<label>Specifications<span class="hint">Three optional detail rows shown on the product page.</span></label>' +
        '<div id="specRows"></div>' +
      '</div>' +
      '<div class="field-row two">' +
        '<label class="check-card"><input type="checkbox" id="pActive"' + (p.active ? " checked" : "") + '>' +
          '<span><strong>Active</strong><span>Visible and orderable on the storefront.</span></span></label>' +
        '<label class="check-card"><input type="checkbox" id="pFeatured"' + (p.featured ? " checked" : "") + '>' +
          '<span><strong>Featured</strong><span>Shown on the home page.</span></span></label>' +
      '</div>';

    renderVarChips();
    renderSpecRows();

    doc.getElementById("pArt").addEventListener("change", function () {
      var prev = doc.getElementById("artPreview");
      if (prev) prev.src = global.HabagatArt(this.value);
    });
  }

  function renderSpecRows() {
    var keys = ["Material", "Size", "Care"];
    var specs = state.draft.specs || {};
    doc.getElementById("specRows").innerHTML = keys.map(function (k) {
      return '<div class="var-row">' +
        '<input class="input" data-spec="' + k + '" placeholder="' + k + '" value="' + esc(specs[k] || "") + '">' +
      '</div>';
    }).join("");
  }

  function renderVarChips() {
    var opts = state.draft.options || (state.draft.options = { label: "", values: [] });
    var el = doc.getElementById("varChips");
    if (!el) return;
    el.innerHTML = opts.values.length
      ? opts.values.map(function (v, i) {
          return '<span class="var-chip">' + esc(v) + '<button type="button" data-del-option="' + i + '" aria-label="Remove ' + esc(v) + '">&times;</button></span>';
        }).join("")
      : '<span class="muted small">No variations — this product will be a single option.</span>';
  }

  function collectProduct() {
    var opts = state.draft.options || { label: "", values: [] };
    var label = (doc.getElementById("varLabel").value || "").trim();
    var specs = {};
    doc.querySelectorAll("[data-spec]").forEach(function (inp) {
      var v = inp.value.trim();
      if (v) specs[inp.getAttribute("data-spec")] = v;
    });
    var name = doc.getElementById("pName").value.trim();
    if (!name) return null;

    var id = state.editingId || ("p-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40));
    if (!state.editingId) {
      var existing = S.getProduct(id);
      if (existing) id = id + "-" + Math.floor(Math.random() * 900 + 100);
    }

    return {
      id: id,
      name: name,
      category: doc.getElementById("pCategory").value.trim() || "Uncategorised",
      price: Math.max(0, Number(doc.getElementById("pPrice").value) || 0),
      art: global.HabagatArt(doc.getElementById("pArt").value),
      active: doc.getElementById("pActive").checked,
      featured: doc.getElementById("pFeatured").checked,
      short: doc.getElementById("pShort").value.trim(),
      description: doc.getElementById("pDesc").value.trim(),
      specs: specs,
      options: (label && opts.values.length) ? { label: label, values: opts.values.slice() } : null
    };
  }

  /* ---------------- order drawer ---------------- */
  function openOrderModal(ref) {
    var o = S.getOrder(ref);
    if (!o) return;
    state.openOrderRef = ref;
    var subtotal = o.items.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
    var total = subtotal + (o.shipping || 0);

    doc.getElementById("orderModal").classList.add("open");
    doc.getElementById("orderTitle").textContent = "Order " + o.ref;
    doc.getElementById("orderSub").textContent = "Submitted " + S.formatDate(o.createdAt);

    var payBadge = o.paymentStatus === "verified" ? '<span class="status verified">Payment verified</span>'
      : o.paymentStatus === "rejected" ? '<span class="status rejected">Payment rejected</span>'
      : '<span class="status unverified">Awaiting verification</span>';

    doc.getElementById("orderBody").innerHTML = '' +
      '<div class="panel" style="border-radius:var(--radius)">' +
        '<div class="panel-head"><h3>Customer</h3></div>' +
        '<dl class="definition">' +
          '<div class="row"><dt>Full name</dt><dd>' + esc(o.customer.name) + '</dd></div>' +
          '<div class="row"><dt>Email</dt><dd>' + esc(o.customer.email) + '</dd></div>' +
          '<div class="row"><dt>Mobile</dt><dd>' + esc(o.customer.mobile) + '</dd></div>' +
          '<div class="row"><dt>' + esc(o.customer.method) + ' details</dt><dd>' + esc(o.customer.address || "—") + '</dd></div>' +
          '<div class="row"><dt>Notes</dt><dd>' + (o.customer.notes ? esc(o.customer.notes) : '<span class="muted">None</span>') + '</dd></div>' +
          '<div class="row"><dt>Payment method</dt><dd>' + esc(o.paymentMethod) + '</dd></div>' +
          '<div class="row"><dt>Payment status</dt><dd>' + payBadge +
            (o.paymentStatus === "verified" && o.verifiedAt ? '<br><span class="muted small">Verified ' + esc(S.formatDate(o.verifiedAt)) + '</span>' : '') +
            (o.paymentStatus === "rejected" && o.rejectedNote ? '<br><span class="muted small">' + esc(o.rejectedNote) + '</span>' : '') +
          '</dd></div>' +
        '</dl>' +
      '</div>' +

      '<div class="panel" style="border-radius:var(--radius)">' +
        '<div class="panel-head"><h3>Items</h3></div>' +
        '<div class="table-wrap" style="border:0">' +
          '<table class="data" style="min-width:0">' +
            '<thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Price</th><th class="num">Line total</th></tr></thead><tbody>' +
            o.items.map(function (i) {
              return '<tr><td>' + esc(i.name) +
                (i.option && i.option !== "—" ? '<br><span class="muted small">' + esc(i.option) + '</span>' : '') +
                '</td><td class="num">' + i.qty + '</td><td class="num">' + S.peso(i.price) + '</td><td class="num">' + S.peso(i.price * i.qty) + '</td></tr>';
            }).join("") +
          '</tbody></table>' +
        '</div>' +
        '<div style="margin-top:14px">' +
          '<div class="summary-row"><span class="k">Subtotal</span><span>' + S.peso(subtotal) + '</span></div>' +
          '<div class="summary-row"><span class="k">Delivery</span><span>' + (o.shipping ? S.peso(o.shipping) : "Free") + '</span></div>' +
          '<div class="summary-row total"><span class="k">Total</span><span>' + S.peso(total) + '</span></div>' +
        '</div>' +
      '</div>' +

      '<div class="panel" style="border-radius:var(--radius)">' +
        '<div class="panel-head"><h3>Payment proof</h3><p>Demo submission — stored as text in this browser only.</p></div>' +
        (o.proof && o.proof.submitted
          ? '<div class="proof-box"><div class="proof-file">' +
              '<span class="ico">' + esc(fmtProofBytes(o.proof.filename)) + '</span>' +
              '<span><strong>' + esc(o.proof.filename) + '</strong><br>' +
              '<span class="muted small">Simulated upload · not stored as a real file</span></span>' +
            '</div>' +
            (o.proof.note ? '<p class="small" style="margin:12px 0 0"><span class="muted">Customer note:</span> ' + esc(o.proof.note) + '</p>' : '') +
          '</div>'
          : '<div class="callout callout-warn"><p class="small">No proof was attached to this order. Contact the customer before confirming.</p></div>') +
        '<div class="actions-cell" style="margin-top:16px">' +
          '<button class="btn btn-primary btn-sm" type="button" data-verify="' + esc(o.ref) + '"' + (o.paymentStatus === "verified" ? " disabled" : "") + '>Mark payment verified</button>' +
          '<button class="btn btn-danger btn-sm" type="button" data-reject="' + esc(o.ref) + '">Reject / unverify</button>' +
        '</div>' +
      '</div>' +

      '<div class="panel" style="border-radius:var(--radius)">' +
        '<div class="panel-head"><h3>Order status</h3></div>' +
        '<div class="field">' +
          '<select class="select" data-modal-status="' + esc(o.ref) + '" aria-label="Order status">' +
            S.statuses.map(function (s) { return '<option value="' + esc(s) + '"' + (s === o.status ? " selected" : "") + '>' + esc(s) + '</option>'; }).join("") +
          '</select>' +
          '<span class="hint">Pending → Confirmed → Processing → Ready → Completed</span>' +
        '</div>' +
      '</div>' +
      '<p class="small muted">Reference ' + esc(o.ref) + '. This record lives in your browser storage for the demo session.</p>';
  }

  function refreshOpenOrder() {
    if (state.openOrderRef && doc.getElementById("orderModal").classList.contains("open")) {
      openOrderModal(state.openOrderRef);
    }
  }

  /* ---------------- events ---------------- */
  function wire() {
    doc.getElementById("adminTabs").addEventListener("click", function (e) {
      var t = e.target.closest("[data-tab]");
      if (!t) return;
      state.tab = t.getAttribute("data-tab");
      render();
    });

    doc.getElementById("adminBody").addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest("[data-open-order]"))) { openOrderModal(b.getAttribute("data-open-order")); return; }
      if ((b = e.target.closest("[data-edit-product]"))) { openProductModal(b.getAttribute("data-edit-product")); return; }
      if ((b = e.target.closest("[data-toggle-product]"))) {
        var id = b.getAttribute("data-toggle-product");
        var p = S.getProduct(id);
        if (p) {
          p.active = !p.active;
          S.saveProduct(p);
          UI.toast(p.name + (p.active ? " is now active" : " is now inactive"));
          renderKeepScroll();
        }
        return;
      }
      if ((b = e.target.closest("[data-new-product]"))) { openProductModal(null); return; }
      if ((b = e.target.closest("[data-reset-settings]"))) {
        var s = S.getSettings();
        var fresh = {};
        // Re-seed only the settings block
        var defaults = null;
        S.reset();
        defaults = S.getSettings();
        var keepProducts = null;
        UI.toast("Store settings restored to defaults");
        renderKeepScroll();
        return;
      }
      if ((b = e.target.closest("[data-verify]"))) {
        var o = S.getOrder(b.getAttribute("data-verify"));
        if (o) {
          o.paymentStatus = "verified";
          o.verifiedAt = new Date().toISOString();
          if (o.status === "Pending") o.status = "Confirmed";
          S.saveOrder(o);
          UI.toast(o.ref + ": payment marked verified");
          renderKeepScroll(); refreshOpenOrder();
        }
        return;
      }
      if ((b = e.target.closest("[data-reject]"))) {
        var o2 = S.getOrder(b.getAttribute("data-reject"));
        if (o2) {
          if (o2.paymentStatus === "rejected") {
            o2.paymentStatus = "pending";
            o2.rejectedNote = "";
            UI.toast(o2.ref + ": payment set back to unverified");
          } else {
            o2.paymentStatus = "rejected";
            o2.rejectedNote = "Marked rejected by staff during demo review.";
            UI.toast(o2.ref + ": payment marked rejected");
          }
          S.saveOrder(o2);
          renderKeepScroll(); refreshOpenOrder();
        }
        return;
      }
    });

    // settings submit + reset
    doc.getElementById("adminBody").addEventListener("submit", function (e) {
      if (e.target.id !== "settingsForm") return;
      e.preventDefault();
      var s = S.getSettings();
      e.target.querySelectorAll("[data-spec], input, textarea, select").forEach(function (el) {
        if (el.name) s[el.name] = el.type === "number" ? Number(el.value) : el.value;
      });
      S.saveSettings(s);
      UI.toast("Settings saved — the storefront is updated");
      renderKeepScroll();
    });

    // live search inputs
    doc.getElementById("adminBody").addEventListener("input", function (e) {
      if (e.target.matches("[data-product-search]")) {
        state.productQuery = e.target.value;
        var v = e.target.value;
        var y = global.scrollY;
        doc.getElementById("adminBody").innerHTML = renderProducts();
        var inp = doc.querySelector("[data-product-search]");
        if (inp) { inp.value = v; inp.focus(); }
        global.scrollTo({ top: y });
        return;
      }
      if (e.target.matches("[data-order-search]")) {
        state.orderQuery = e.target.value;
        var v2 = e.target.value;
        var y2 = global.scrollY;
        doc.getElementById("adminBody").innerHTML = renderOrders();
        var inp2 = doc.querySelector("[data-order-search]");
        if (inp2) { inp2.value = v2; inp2.focus(); }
        global.scrollTo({ top: y2 });
      }
    });

    doc.getElementById("adminBody").addEventListener("change", function (e) {
      var sel = e.target.closest("[data-status-select]");
      if (sel) {
        var o = S.getOrder(sel.getAttribute("data-status-select"));
        if (o) {
          o.status = sel.value;
          if (o.status === "Completed" && o.paymentStatus === "pending") o.paymentStatus = "verified";
          S.saveOrder(o);
          UI.toast(o.ref + " status set to " + o.status);
          renderKeepScroll();
        }
        return;
      }
      var s2 = e.target.closest("[data-order-status]");
      if (s2) { state.orderStatus = s2.value; renderKeepScroll(); }
    });

    // product modal
    var pm = doc.getElementById("productModal");
    pm.addEventListener("click", function (e) {
      if (e.target.matches("[data-close-modal]") || e.target === pm) { pm.classList.remove("open"); return; }
      var b;
      if ((b = e.target.closest("[data-add-option]"))) {
        var input = doc.getElementById("varValue");
        var val = (input.value || "").trim();
        if (!val) { UI.toast("Type a value first"); return; }
        state.draft.options = state.draft.options || { label: "", values: [] };
        if (state.draft.options.values.indexOf(val) === -1) state.draft.options.values.push(val);
        input.value = "";
        renderVarChips();
        return;
      }
      if ((b = e.target.closest("[data-del-option]"))) {
        state.draft.options.values.splice(+b.getAttribute("data-del-option"), 1);
        renderVarChips();
        return;
      }
      if ((b = e.target.closest("[data-clear-options]"))) {
        state.draft.options = { label: "", values: [] };
        doc.getElementById("varLabel").value = "";
        renderVarChips();
        return;
      }
      if ((b = e.target.closest("[data-save-product]"))) {
        var product = collectProduct();
        if (!product) { UI.toast("Please give the product a name"); return; }
        S.saveProduct(product);
        pm.classList.remove("open");
        UI.toast(state.editingId ? "Product updated — storefront refreshed" : "Product added to the shop");
        renderKeepScroll();
        return;
      }
      if (e.target.closest("[data-delete-product]")) {
        if (!state.editingId) { UI.toast("Nothing to delete yet"); return; }
        S.deleteProduct(state.editingId);
        pm.classList.remove("open");
        UI.toast("Product removed");
        renderKeepScroll();
      }
    });

    // order modal
    var om = doc.getElementById("orderModal");
    om.addEventListener("click", function (e) {
      if (e.target.matches("[data-close-modal]") || e.target === om) { om.classList.remove("open"); state.openOrderRef = null; }
    });
    om.addEventListener("change", function (e) {
      var sel = e.target.closest("[data-modal-status]");
      if (!sel) return;
      var o = S.getOrder(sel.getAttribute("data-modal-status"));
      if (o) {
        o.status = sel.value;
        if (o.status === "Completed" && o.paymentStatus === "pending") o.paymentStatus = "verified";
        S.saveOrder(o);
        UI.toast(o.ref + " status set to " + o.status);
        renderKeepScroll(); refreshOpenOrder();
      }
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        pm.classList.remove("open");
        om.classList.remove("open");
        state.openOrderRef = null;
      }
    });

    doc.getElementById("resetDemo").addEventListener("click", function () {
      if (!global.confirm("Reset demo data?\n\nThis restores the original products, the three sample orders and the default store settings. Anything you added or edited during the session will be lost.")) return;
      S.reset();
      state.tab = "dashboard";
      render();
      UI.toast("Demo data restored to its original state");
    });

    doc.getElementById("openStorefront").addEventListener("click", function (e) {
      e.preventDefault();
      global.open("index.html", "_blank");
    });
  }

  /* ---------------- boot ---------------- */
  doc.addEventListener("DOMContentLoaded", function () {
    S.init(false);
    wire();
    render();
  });
})(window);
