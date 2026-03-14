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
    users: {
      // userId: { wallet, bank, lastDaily, lastWork, lastInterest, lastCoinflip, lastSlots, inventory: { itemId: qty }, pet: {} }
    },
    shop: cloneDefaultShop(),
  };
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
      id: String(item.id).toLowerCase(),
      name: String(item.name),
      price: clampMoney(Number(item.price)),
      description: String(item.description || "No description."),
    }));

  if (!data.shop.length) {
    data.shop = cloneDefaultShop();
  }
}

function readEcon(guildId) {
  const file = econPath(guildId);

  if (!fs.existsSync(file)) {
    const data = defaultEcon();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!data.users || typeof data.users !== "object") data.users = {};
    normalizeShop(data);

    return data;
  } catch {
    const data = defaultEcon();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }
}

function writeEcon(guildId, data) {
  if (!data.users || typeof data.users !== "object") data.users = {};
  normalizeShop(data);
  fs.writeFileSync(econPath(guildId), JSON.stringify(data, null, 2));
}

function ensureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      wallet: 0,
      bank: 0,
      lastDaily: 0,
      lastWork: 0,
      lastInterest: 0,
      lastCoinflip: 0,
      lastSlots: 0,
      inventory: {},
    };
  }

  const u = data.users[userId];
  u.wallet ??= 0;
  u.bank ??= 0;
  u.lastDaily ??= 0;
  u.lastWork ??= 0;
  u.lastInterest ??= 0;
  u.lastCoinflip ??= 0;
  u.lastSlots ??= 0;
  u.inventory ??= {};

  return u;
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

function getShopItems(data) {
  normalizeShop(data);
  return data.shop;
}

function findShopItem(data, itemId) {
  normalizeShop(data);
  const id = String(itemId || "").toLowerCase();
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

  if (!id || !name || !price) return { ok: false, error: "Invalid item data." };
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

  const id = String(itemId || "").toLowerCase();
  u.inventory[id] = (u.inventory[id] || 0) + qty;

  if (u.inventory[id] <= 0) delete u.inventory[id];
}

function removeItem(u, itemId, qty) {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return false;

  const id = String(itemId || "").toLowerCase();
  const have = u.inventory[id] || 0;

  if (have < qty) return false;

  u.inventory[id] = have - qty;
  if (u.inventory[id] <= 0) delete u.inventory[id];
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
