// lib/economy.js
const fs = require("fs");
const path = require("path");

const ECON_DIR = path.join(__dirname, "..", "data", "economy");
fs.mkdirSync(ECON_DIR, { recursive: true });

function econPath(guildId) {
  return path.join(ECON_DIR, `${guildId}.json`);
}

function defaultEcon() {
  return {
    users: {
      // userId: { wallet, bank, lastDaily, lastWork, lastInterest, lastCoinflip, lastSlots, inventory: { itemId: qty } }
    },
  };
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
    if (!data.users) data.users = {};
    return data;
  } catch {
    const data = defaultEcon();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }
}

function writeEcon(guildId, data) {
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
  if (n > 1_000_000_000_000) return 1_000_000_000_000; // 1T cap
  return n;
}

function formatMoney(n) {
  return clampMoney(n).toLocaleString();
}

// ---- Shop items (edit these anytime) ----
const SHOP_ITEMS = [
  { id: "vip", name: "VIP Pass", price: 5000, description: "Bragging rights 😎" },
  { id: "cookie", name: "Cookie", price: 50, description: "A tasty snack 🍪" },
  { id: "potion", name: "Lucky Potion", price: 1500, description: "Totally not a scam 🧪" },
  { id: "crate", name: "Mystery Crate", price: 2500, description: "Could be anything 📦" },
];

function getShopItems() {
  return SHOP_ITEMS;
}

function findShopItem(itemId) {
  return SHOP_ITEMS.find((x) => x.id === itemId) || null;
}

function addItem(u, itemId, qty) {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return;
  u.inventory[itemId] = (u.inventory[itemId] || 0) + qty;
  if (u.inventory[itemId] <= 0) delete u.inventory[itemId];
}

function removeItem(u, itemId, qty) {
  qty = Math.floor(qty);
  if (!Number.isFinite(qty) || qty <= 0) return false;
  const have = u.inventory[itemId] || 0;
  if (have < qty) return false;
  u.inventory[itemId] = have - qty;
  if (u.inventory[itemId] <= 0) delete u.inventory[itemId];
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
  addItem,
  removeItem,
};