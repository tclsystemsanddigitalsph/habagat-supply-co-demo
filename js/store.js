/* =========================================================
   Habagat Supply Co. — demo data + client-side store
   All data lives in localStorage. This is a DEMO only.
   ========================================================= */
(function (global) {
  "use strict";

  var KEYS = {
    products: "habagat.products.v1",
    orders:   "habagat.orders.v1",
    settings: "habagat.settings.v1",
    cart:     "habagat.cart.v1",
    seeded:   "habagat.seeded.v1"
  };

  /* ---------------- product artwork (local SVG, no external assets) ----------------
     Simple, flat line drawings on a warm neutral ground. No gradients, no gloss. */
  function art(kind, tone) {
    tone = tone || "#e9e3d9";
    var body = "";
    switch (kind) {
      case "basket":
        body = '<path d="M52 96 L68 152 H172 L188 96 Z" fill="none" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M44 96 H196" stroke="#4b4339" stroke-width="5" stroke-linecap="round"/>' +
               '<path d="M120 96 C104 118 100 134 104 152" fill="none" stroke="#6f6558" stroke-width="3"/>' +
               '<path d="M120 96 C136 118 140 134 136 152" fill="none" stroke="#6f6558" stroke-width="3"/>' +
               '<path d="M70 108 H170 M74 120 H166" stroke="#8d8375" stroke-width="2"/>';
        break;
      case "board":
        body = '<rect x="46" y="62" width="150" height="96" rx="22" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<circle cx="164" cy="84" r="7" fill="none" stroke="#8d8375" stroke-width="3"/>' +
               '<path d="M70 96 H150 M70 112 H150 M70 128 H126" stroke="#a89d8d" stroke-width="2"/>' +
               '<path d="M196 96 l10 6 v16 l-10 6 z" fill="#6f6558"/>';
        break;
      case "blanket":
        body = '<rect x="46" y="76" width="148" height="88" rx="10" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M46 100 H194 M46 140 H194" stroke="#bdb2a1" stroke-width="2"/>' +
               '<path d="M60 76 v88 M96 76 v88 M132 76 v88 M168 76 v88" stroke="#d3c9b8" stroke-width="2"/>' +
               '<path d="M46 164 h148" stroke="#6f6558" stroke-width="4" stroke-dasharray="6 6"/>';
        break;
      case "tumbler":
        body = '<path d="M84 60 H156 L150 172 a10 10 0 0 1 -10 9 H100 a10 10 0 0 1 -10 -9 Z" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M82 60 H158" stroke="#4b4339" stroke-width="6" stroke-linecap="round"/>' +
               '<path d="M84 92 H156" stroke="#bdb2a1" stroke-width="2"/>' +
               '<path d="M120 74 v96" stroke="#d3c9b8" stroke-width="2"/>';
        break;
      case "tote":
        body = '<path d="M60 92 H180 L172 172 H68 Z" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M88 92 C88 62 152 62 152 92" fill="none" stroke="#4b4339" stroke-width="5"/>' +
               '<path d="M60 120 H180" stroke="#bdb2a1" stroke-width="2"/>';
        break;
      case "mug":
        body = '<path d="M70 80 H150 V158 a12 12 0 0 1 -12 12 H82 a12 12 0 0 1 -12 -12 Z" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M150 100 h16 a18 18 0 0 1 0 36 h-16" fill="none" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M70 100 H150" stroke="#bdb2a1" stroke-width="2"/>' +
               '<ellipse cx="110" cy="80" rx="40" ry="9" fill="#e0d8cb" stroke="#6f6558" stroke-width="3"/>';
        break;
      case "placemat":
        body = '<rect x="44" y="70" width="152" height="100" rx="6" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M44 86 H196 M44 154 H196" stroke="#bdb2a1" stroke-width="3"/>' +
               '<path d="M72 70 v16 M96 70 v16 M120 70 v16 M144 70 v16 M168 70 v16" stroke="#bdb2a1" stroke-width="3"/>' +
               '<path d="M72 154 v16 M96 154 v16 M120 154 v16 M144 154 v16 M168 154 v16" stroke="#bdb2a1" stroke-width="3"/>';
        break;
      case "picnic":
        body = '<rect x="52" y="70" width="136" height="42" rx="8" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<rect x="52" y="116" width="136" height="42" rx="8" fill="#e6dfd2" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M120 70 v88" stroke="#bdb2a1" stroke-width="3"/>' +
               '<path d="M188 92 h12 v28 h-12" fill="none" stroke="#6f6558" stroke-width="4" stroke-linejoin="round"/>';
        break;
      case "lantern":
        body = '<path d="M92 74 h56 l14 22 v66 a10 10 0 0 1 -10 10 H88 a10 10 0 0 1 -10 -10 V96 Z" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M92 74 a28 18 0 0 1 56 0" fill="none" stroke="#4b4339" stroke-width="5"/>' +
               '<circle cx="120" cy="126" r="16" fill="none" stroke="#b08a3c" stroke-width="3"/>' +
               '<path d="M120 102 v-8 M120 158 v-8 M96 126 h-8 M152 126 h-8" stroke="#b08a3c" stroke-width="3"/>';
        break;
      case "tray":
        body = '<rect x="42" y="82" width="156" height="82" rx="12" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>' +
               '<rect x="56" y="96" width="128" height="54" rx="8" fill="none" stroke="#bdb2a1" stroke-width="3"/>' +
               '<path d="M42 100 h-12 v46 h12" fill="none" stroke="#6f6558" stroke-width="4"/>' +
               '<path d="M198 100 h12 v46 h-12" fill="none" stroke="#6f6558" stroke-width="4"/>';
        break;
      default:
        body = '<rect x="56" y="70" width="128" height="96" rx="8" fill="#efe9df" stroke="#6f6558" stroke-width="4"/>';
    }
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240" role="img" aria-label="Product illustration">' +
      '<rect width="240" height="240" fill="' + tone + '"/>' +
      '<rect x="22" y="200" width="196" height="2" fill="#d8d0c2"/>' +
      body +
      '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  global.HabagatArt = art;

  /* ---------------- default products ---------------- */
  var DEFAULT_PRODUCTS = [
    {
      id: "p-rattan-basket", name: "Rattan Storage Basket (Set of 2)",
      category: "Home & Storage", price: 1290, art: "basket", active: true, featured: true,
      short: "Nested woven baskets with a sturdy frame — good for linens, toys, and odds and ends.",
      description: "A pair of handwoven rattan baskets for the parts of a home that never stay tidy. The smaller basket nests inside the larger one, so you can store both in the same corner when they are not in use. Each piece is finished with a clear matte lacquer, which keeps the weave from snagging on fabric.",
      specs: { Material: "Rattan, clear matte finish", Size: "Large 38 cm, small 28 cm", Care: "Wipe with a dry cloth" },
      options: { label: "Colour", values: ["Natural", "Walnut"] }
    },
    {
      id: "p-bamboo-board", name: "Bamboo Cutting Board (Large)",
      category: "Kitchen", price: 749, art: "board", active: true, featured: true,
      short: "Thick end-grain bamboo board with a juice groove and a hanging hole.",
      description: "A generous 40 x 28 cm board that handles a whole chicken or a pile of vegetables without crowding. The bamboo is pressed end-grain, so the surface stays kind to knife edges, and a shallow groove around the rim catches juice before it reaches your counter. Oil it once a month and it will outlast most of the kitchen.",
      specs: { Material: "End-grain bamboo", Size: "40 x 28 x 3 cm", Care: "Hand wash, oil monthly" },
      options: null
    },
    {
      id: "p-cotton-blanket", name: "Cotton Throw Blanket",
      category: "Home & Storage", price: 1150, art: "blanket", active: true, featured: true,
      short: "Breathable woven cotton throw that works in air-conditioned rooms.",
      description: "Woven cotton with a visible weave and a hand-knotted fringe. It is light enough for a warm afternoon but warm enough for a room with the aircon running all night. Pre-washed, so it will not shrink much the first time you launder it.",
      specs: { Material: "100% cotton, pre-washed", Care: "Machine wash cold, tumble low" },
      options: { label: "Size", values: ["130 x 170 cm", "150 x 200 cm"] }
    },
    {
      id: "p-tumbler", name: "Stainless Tumbler 750 ml",
      category: "Drinkware", price: 899, art: "tumbler", active: true, featured: true,
      short: "Double-wall insulated tumbler with a screw lid and a wide mouth.",
      description: "Keeps drinks cold for most of a working day and hot through a commute. The body is double-walled 304 stainless steel with a powder-coated exterior that does not sweat or slip. The lid seals with a silicone gasket and the opening is wide enough for ice cubes and a bottle brush.",
      specs: { Material: "304 stainless steel, double wall", Capacity: "750 ml", Care: "Hand wash the body" },
      options: { label: "Colour", values: ["Sand", "Deep Green", "Charcoal"] }
    },
    {
      id: "p-canvas-tote", name: "Canvas Market Tote",
      category: "Bags", price: 690, art: "tote", active: true, featured: false,
      short: "Heavy cotton canvas tote with a flat base and reinforced handles.",
      description: "Built for the wet market and the grocery run. The canvas is 14 oz, the base is boxed so jars stand upright, and the handles are stitched twice where they meet the bag. It folds flat into a drawer when you are done with it.",
      specs: { Material: "14 oz cotton canvas", Size: "38 x 40 x 12 cm", Care: "Machine wash cold" },
      options: null
    },
    {
      id: "p-ceramic-mug", name: "Ceramic Coffee Mug (Set of 4)",
      category: "Drinkware", price: 1320, art: "mug", active: true, featured: true,
      short: "Four 320 ml stoneware mugs with a reactive glaze.",
      description: "Stoneware mugs with a heavier feel in the hand and a reactive glaze that gives each piece a slightly different tone. Microwave and dishwasher safe, with a handle sized for a full grip rather than two fingers.",
      specs: { Material: "Stoneware, reactive glaze", Capacity: "320 ml each", Care: "Dishwasher safe" },
      options: { label: "Glaze", values: ["Oat", "Rust", "Slate"] }
    },
    {
      id: "p-placemat", name: "Handwoven Placemat (Set of 4)",
      category: "Kitchen", price: 860, art: "placemat", active: true, featured: false,
      short: "Textured placemats that soften a hard dining table.",
      description: "A set of four placemats woven from a cotton and abaca blend. They are firm enough to stay flat without slipping, and the neutral tone works with most table settings. Roll them up rather than folding them and they will keep their shape.",
      specs: { Material: "Cotton and abaca blend", Size: "45 x 30 cm each", Care: "Spot clean" },
      options: null
    },
    {
      id: "p-picnic-mat", name: "Foldable Picnic Mat",
      category: "Outdoors", price: 1480, art: "picnic", active: true, featured: true,
      short: "Padded mat with a water-resistant backing that folds into a carry handle.",
      description: "A 150 x 140 cm mat with a light foam layer and a water-resistant underside, so damp grass is not a problem. It folds on itself into a compact bundle with an integrated handle — no separate bag to lose.",
      specs: { Material: "Polyester surface, PEVA backing", Size: "150 x 140 cm open", Care: "Wipe clean, air dry" },
      options: { label: "Colour", values: ["Olive", "Stone"] }
    },
    {
      id: "p-lantern", name: "Solar Camping Lantern",
      category: "Outdoors", price: 1050, art: "lantern", active: true, featured: false,
      short: "Rechargeable lantern with a solar panel and three brightness levels.",
      description: "A practical light for brownouts, camping, and the back of the house. It charges from the built-in solar panel or over USB in about four hours, runs up to twelve hours on the low setting, and has a hook on top for hanging from a beam or a tent loop.",
      specs: { Material: "ABS housing, 2000 mAh battery", Runtime: "Up to 12 hours on low", Charging: "Solar or USB-C" },
      options: { label: "Colour", values: ["Forest", "Sand"] }
    },
    {
      id: "p-serving-tray", name: "Wooden Serving Tray",
      category: "Kitchen", price: 980, art: "tray", active: false, featured: false,
      short: "Rubberwood tray with cut-out handles — temporarily out of stock.",
      description: "A shallow rubberwood tray with cut-out handles on both ends, sized to carry a pitcher and four glasses in one trip. Finished with food-safe oil. Currently out of stock; it is deactivated on the storefront so customers cannot order it.",
      specs: { Material: "Rubberwood, food-safe oil", Size: "46 x 30 x 5 cm", Care: "Hand wash, re-oil occasionally" },
      options: null
    }
  ];

  /* ---------------- default settings ---------------- */
  var DEFAULT_SETTINGS = {
    storeName: "Habagat Supply Co.",
    tagline: "Home & outdoor goods, Cebu",
    email: "hello@habagatsupply.ph",
    phone: "+63 917 555 0142",
    address: "Unit 4, Escario Corner Bldg., 42 Escario St., Cebu City 6000",
    hours: "Mon–Sat, 9:00 AM – 6:00 PM",
    shippingFee: 180,
    freeShippingThreshold: 2500,
    deliveryNote: "Metro Cebu deliveries arrive in 1–2 days. Provincial orders ship via courier in 3–5 days. Pickup is available at our Cebu City unit on weekdays.",
    gcashName: "Habagat Supply Co.",
    gcashNumber: "0917 555 0142",
    bankName: "BPI Savings",
    bankAccountName: "Habagat Supply Co.",
    bankAccountNumber: "1234 5678 9012",
    qrLabel: "QR Ph — scan with any participating bank or e-wallet app",
    paymentNote: "Send your payment, then upload a screenshot or photo of the receipt below. Our team verifies each payment manually, usually within the same business day.",
    aboutShort: "Habagat Supply Co. is a small Cebu-based shop selling practical goods for the home and for the outdoors.",
    aboutLong: "We started in 2019 with a single shelf of woven baskets and a stall at a weekend market in Cebu City. Customers kept asking where they could find the same pieces again, so we put them online.\n\nToday we carry a small, deliberately short list of goods: things we have used ourselves, that last more than a season, and that do not need a manual. We buy from local weavers and small workshops where we can, and we keep our prices honest rather than running permanent sales.\n\nWe are still small enough that a real person reads every message and packs every order."
  };

  /* ---------------- seed orders ---------------- */
  function seedOrder(seed) { return seed; }

  function daysAgo(n) {
    var d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  var DEFAULT_ORDERS = [
    {
      ref: "HBG-2401", createdAt: daysAgo(2),
      customer: { name: "Mariel Sanchez", email: "mariel.sanchez@example.ph", mobile: "0917 204 8811",
        address: "12-A Rosal St., Brgy. Lahug, Cebu City, 6000", method: "Delivery", notes: "Please call before delivery." },
      items: [ { id: "p-cotton-blanket", name: "Cotton Throw Blanket", option: "150 x 200 cm", qty: 1, price: 1150 },
               { id: "p-placemat", name: "Handwoven Placemat (Set of 4)", option: "—", qty: 2, price: 860 } ],
      shipping: 0, paymentMethod: "GCash",
      proof: { filename: "gcash-receipt-4471.jpg", note: "Sent at 9:14 AM, ref 4471.", submitted: true },
      paymentStatus: "verified", status: "Processing"
    },
    {
      ref: "HBG-2402", createdAt: daysAgo(1),
      customer: { name: "Jomar Dela Cruz", email: "j.delacruz@example.ph", mobile: "0928 771 3095",
        address: "88 Mango Ave., Brgy. Kamputhaw, Cebu City, 6000", method: "Delivery", notes: "" },
      items: [ { id: "p-tumbler", name: "Stainless Tumbler 750 ml", option: "Deep Green", qty: 2, price: 899 } ],
      shipping: 180, paymentMethod: "Bank Transfer",
      proof: { filename: "bpi-transfer-slip.pdf", note: "Transferred at 2:40 PM.", submitted: true },
      paymentStatus: "pending", status: "Pending"
    },
    {
      ref: "HBG-2403", createdAt: daysAgo(0),
      customer: { name: "Angela Reyes", email: "angela.reyes@example.ph", mobile: "0906 118 4422",
        address: "Pickup — Habagat unit, 42 Escario St., Cebu City", method: "Pickup", notes: "Will collect Saturday morning." },
      items: [ { id: "p-rattan-basket", name: "Rattan Storage Basket (Set of 2)", option: "Natural", qty: 1, price: 1290 },
               { id: "p-mug", name: "Ceramic Coffee Mug (Set of 4)", option: "Oat", qty: 1, price: 1320 } ],
      shipping: 0, paymentMethod: "GCash",
      proof: { filename: "", note: "", submitted: false },
      paymentStatus: "pending", status: "Pending"
    }
  ];

  /* ---------------- storage helpers ---------------- */
  function read(key, fallback) {
    try {
      var raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { global.localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  /* ---------------- store API ---------------- */
  var Store = {
    KEYS: KEYS,

    init: function (force) {
      if (force || !read(KEYS.seeded, false)) {
        write(KEYS.products, DEFAULT_PRODUCTS);
        write(KEYS.orders, DEFAULT_ORDERS);
        write(KEYS.settings, DEFAULT_SETTINGS);
        write(KEYS.seeded, true);
      }
      // Repair if a key was cleared individually
      if (!read(KEYS.products, null)) write(KEYS.products, DEFAULT_PRODUCTS);
      if (!read(KEYS.orders, null)) write(KEYS.orders, DEFAULT_ORDERS);
      if (!read(KEYS.settings, null)) write(KEYS.settings, DEFAULT_SETTINGS);
      if (!read(KEYS.cart, null)) write(KEYS.cart, []);
    },

    reset: function () {
      global.localStorage.removeItem(KEYS.products);
      global.localStorage.removeItem(KEYS.orders);
      global.localStorage.removeItem(KEYS.settings);
      global.localStorage.removeItem(KEYS.cart);
      global.localStorage.removeItem(KEYS.seeded);
      Store.init(true);
    },

    /* --- products --- */
    getProducts: function () { return read(KEYS.products, []); },
    getActiveProducts: function () {
      return Store.getProducts().filter(function (p) { return p.active; });
    },
    getProduct: function (id) {
      var list = Store.getProducts();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },
    saveProduct: function (product) {
      var list = Store.getProducts();
      var idx = -1;
      for (var i = 0; i < list.length; i++) if (list[i].id === product.id) idx = i;
      if (idx >= 0) list[idx] = product; else list.push(product);
      write(KEYS.products, list);
      return product;
    },
    deleteProduct: function (id) {
      write(KEYS.products, Store.getProducts().filter(function (p) { return p.id !== id; }));
    },
    getCategories: function () {
      var seen = {}, out = [];
      Store.getProducts().forEach(function (p) {
        if (!seen[p.category]) { seen[p.category] = true; out.push(p.category); }
      });
      return out.sort();
    },

    /* --- settings --- */
    getSettings: function () {
      var s = read(KEYS.settings, {});
      var merged = {};
      for (var k in DEFAULT_SETTINGS) if (DEFAULT_SETTINGS.hasOwnProperty(k)) merged[k] = DEFAULT_SETTINGS[k];
      for (var k2 in s) if (s.hasOwnProperty(k2)) merged[k2] = s[k2];
      return merged;
    },
    saveSettings: function (s) { write(KEYS.settings, s); return Store.getSettings(); },

    /* --- cart --- */
    getCart: function () { return read(KEYS.cart, []); },
    saveCart: function (cart) { write(KEYS.cart, cart); Store.emit(); return cart; },
    addToCart: function (item) {
      var cart = Store.getCart();
      var found = null;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === item.id && cart[i].option === item.option) { found = cart[i]; break; }
      }
      if (found) found.qty += item.qty;
      else cart.push(item);
      return Store.saveCart(cart);
    },
    updateCartQty: function (index, qty) {
      var cart = Store.getCart();
      if (!cart[index]) return cart;
      if (qty <= 0) cart.splice(index, 1); else cart[index].qty = qty;
      return Store.saveCart(cart);
    },
    removeFromCart: function (index) {
      var cart = Store.getCart();
      cart.splice(index, 1);
      return Store.saveCart(cart);
    },
    clearCart: function () { return Store.saveCart([]); },
    cartCount: function () {
      return Store.getCart().reduce(function (n, l) { return n + l.qty; }, 0);
    },

    /* --- money --- */
    computeTotals: function (cart) {
      var s = Store.getSettings();
      var subtotal = cart.reduce(function (n, l) { return n + l.price * l.qty; }, 0);
      var shipping = 0;
      if (cart.length && subtotal < (Number(s.freeShippingThreshold) || 0)) {
        shipping = Number(s.shippingFee) || 0;
      }
      return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
    },

    /* --- orders --- */
    getOrders: function () {
      var list = read(KEYS.orders, []);
      return list.slice().sort(function (a, b) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    },
    getOrder: function (ref) {
      var list = Store.getOrders();
      for (var i = 0; i < list.length; i++) if (list[i].ref === ref) return list[i];
      return null;
    },
    newRef: function () {
      var d = new Date();
      var stamp = String(d.getFullYear()).slice(2) +
        ("0" + (d.getMonth() + 1)).slice(-2) +
        ("0" + d.getDate()).slice(-2);
      var seq = String(Math.floor(Math.random() * 9000) + 1000);
      return "HBG-" + stamp + "-" + seq;
    },
    createOrder: function (order) {
      var list = read(KEYS.orders, []);
      list.push(order);
      write(KEYS.orders, list);
      return order;
    },
    saveOrder: function (order) {
      var list = read(KEYS.orders, []);
      for (var i = 0; i < list.length; i++) if (list[i].ref === order.ref) { list[i] = order; break; }
      write(KEYS.orders, list);
      return order;
    },

    /* --- events --- */
    emit: function () {
      try { global.dispatchEvent(new CustomEvent("habagat:change")); } catch (e) {}
    },

    /* --- formatting --- */
    peso: function (n) {
      var v = Number(n) || 0;
      return "\u20B1" + v.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    },
    pesoShort: function (n) {
      var v = Number(n) || 0;
      var s = v.toLocaleString("en-PH");
      return "\u20B1" + (Number.isInteger(v) ? s : v.toFixed(2));
    },
    formatDate: function (iso) {
      var d = new Date(iso);
      if (isNaN(d)) return "—";
      return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) +
             ", " + d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
    },
    statuses: ["Pending", "Confirmed", "Processing", "Ready", "Completed"],
    paymentStatuses: ["pending", "verified", "rejected"]
  };

  global.HabagatStore = Store;
  Store.init(false);
})(window);
