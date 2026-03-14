const fs = require("fs");
const path = require("path");

const ECON_DIR = path.join(__dirname, "..", "data", "economy");
fs.mkdirSync(ECON_DIR, { recursive: true });

function econPath(guildId) {
  return path.join(ECON_DIR, `${guildId}.json`);
}

const DEFAULT_SHOP_ITEMS = [
  { id: "vip", name: "VIP Pass", price: 5000, description: "Bragging rights 😎" },
  { id: "cookie", name: "Cookie", price: 50, description: "A tasty snack 🍪" },
  { id: "potion", name: "Lucky Potion", price: 1500, description: "Totally not a scam 🧪" },
  { id: "crate", name: "Mystery Crate", price: 2500, description: "Could be anything 📦" },
];

function cloneDefaultShop() {
  return DEFAULT_SHOP_ITEMS.map((item) => ({ ...item }));
}

function defaultEcon() {
  return {
    users: {},
    shop: cloneDefaultShop(),
  };
}

function clampMoney(n) {
  if (!Number.isFinite(n)) return 0;
  n = Math.floor(n);
  if (n < 0) return 0;
  if (n > 1_000_000_000_000) return 1_000_000_000_000;
  return n;
}

function formatMoney(n) {
  return clampMoney(n).toLocaleString();
}

function safeWriteJson(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function normalizeInventory(inv) {
  if (!inv || typeof inv !== "object" || Array.isArray(inv)) return {};

  const clean = {};
  for (const [itemId, qty] of Object.entries(inv)) {
    const id = String(itemId || "").trim().toLowerCase();
    const amount = Math.floor(Number(qty));
    if (!id) continue;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    clean[id] = amount;
  }
  return clean;
}

function normalizeShop(data) {
  if (!Array.isArray(data.shop)) {
    data.shop = cloneDefaultShop();
  }

  data.shop = data.shop
    .filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.id &&
        item.name &&
        Number.isFinite(Number(item.price))
    )
    .map((item) => ({
      id: String(item.id).trim().toLowerCase(),
      name: String(item.name).trim(),
      price: clampMoney(Number(item.price)),
      description: String(item.description || "No description.").trim(),
    }))
    .filter((item) => item.id && item.name && item.price > 0);

  if (!data.shop.length) {
    data.shop = cloneDefaultShop();
  }
}

function normalizeUser(u) {
  if (!u || typeof u !== "object" || Array.isArray(u)) {
    u = {};
  }

  u.wallet = clampMoney(Number(u.wallet ?? 0));
  u.bank = clampMoney(Number(u.bank ?? 0));
  u.lastDaily = Number(u.lastDaily ?? 0) || 0;
  u.lastWork = Number(u.lastWork ?? 0) || 0;
  u.lastInterest = Number(u.lastInterest ?? 0) || 0;
  u.lastCoinflip = Number(u.lastCoinflip ?? 0) || 0;
  u.lastSlots = Number(u.lastSlots ?? 0) || 0;
  u.lastBeg = Number(u.lastBeg ?? 0) || 0;
  u.lastCrime = Number(u.lastCrime ?? 0) || 0;
  u.lastRob = Number(u.lastRob ?? 0) || 0;
  u.lastBlackjack = Number(u.lastBlackjack ?? 0) || 0;
  u.inventory = normalizeInventory(u.inventory);

  return u;
}

function normalizeUsers(data) {
  if (!data.users || typeof data.users !== "object" || Array.isArray(data.users)) {
    data.users = {};
  }

  for (const userId of Object.keys(data.users)) {
    data.users[userId] = normalizeUser(data.users[userId]);
  }
}

function readEcon(guildId) {
  const file = econPath(guildId);

  if (!fs.existsSync(file)) {
    const data = defaultEcon();
    safeWriteJson(file, data);
    return data;
  }

  try {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(raw);

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Invalid economy data");
    }

    normalizeUsers(data);
    normalizeShop(data);

    return data;
  } catch (err) {
    console.error(`❌ Failed to read economy file for guild ${guildId}:`, err);
    const data = defaultEcon();
    safeWriteJson(file, data);
    return data;
  }
}

function writeEcon(guildId, data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    data = defaultEcon();
  }

  normalizeUsers(data);
  normalizeShop(data);

  safeWriteJson(econPath(guildId), data);
}

function ensureUser(data, userId) {
  if (!data.users || typeof data.users !== "object" || Array.isArray(data.users)) {
    data.users = {};
  }

  if (!data.users[userId]) {
    data.users[userId] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastInterest: 0,
      lastCoinflip: 0,
      lastSlots: 0,
      lastBeg: 0,
      lastCrime: 0,
      lastRob: 0,
      lastBlackjack: 0,
      inventory: {},
    };
  }

  data.users[userId] = normalizeUser(data.users[userId]);
  return data.users[userId];
}

function getShopItems(data) {
  normalizeShop(data);
  return data.shop;
}

function findShopItem(data, itemId) {
  normalizeShop(data);
  const id = String(itemId || "").trim().toLowerCase();
  return data.shop.find((x) => x.id === id) || null;
}

function addShopItem(data, item) {
  normalizeShop(data);

  const id = String(item.id || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const name = String(item.name || "").trim();
  const price = clampMoney(Number(item.price));
  const description = String(item.description || "No description.").trim();

  if (!id || !name || !price) {
    return { ok: false, error: "Invalid item data." };
  }

  if (data.shop.some((x) => x.id === id)) {
    return { ok: false, error: "An item with that ID already exists." };
  }

  data.shop.push({ id, name, price, description });
  return { ok: true };
}

function removeShopItem(data, itemId) {
  normalizeShop(data);

  const id = String(itemId || "").trim().toLowerCase();
  const before = data.shop.length;
  data.shop = data.shop.filter((item) => item.id !== id);

  return data.shop.length < before;
}

function addItem(u, itemId, qty) {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return;

  const id = String(itemId || "").trim().toLowerCase();
  if (!id) return;

  u.inventory = normalizeInventory(u.inventory);
  u.inventory[id] = (u.inventory[id] || 0) + qty;

  if (u.inventory[id] <= 0) {
    delete u.inventory[id];
  }
}

function removeItem(u, itemId, qty) {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return false;

  const id = String(itemId || "").trim().toLowerCase();
  if (!id) return false;

  u.inventory = normalizeInventory(u.inventory);

  const have = u.inventory[id] || 0;
  if (have < qty) return false;

  u.inventory[id] = have - qty;
  if (u.inventory[id] <= 0) {
    delete u.inventory[id];
  }

  return true;
}

module.exports = {
  readEcon,
  writeEcon,
  ensureUser,
  clampMoney,
  formatMoney,
  getShopItems,
  findShopItem,
  addShopItem,
  removeShopItem,
  addItem,
  removeItem,
};
