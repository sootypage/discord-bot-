const fs = require("fs");
const path = require("path");

const PETS_DIR = path.join(__dirname, "..", "data", "pets");
fs.mkdirSync(PETS_DIR, { recursive: true });

function petsPath(guildId) {
  return path.join(PETS_DIR, `${guildId}.json`);
}

function defaultPets() {
  return {
    users: {
      /*
      userId: {
        activePetId: "abc123",
        pets: {
          abc123: {
            id: "abc123",
            name: "Buddy",
            type: "dog",
            level: 1,
            xp: 0,
            hp: 120,
            maxHp: 120,
            food: 100,
            water: 100,
            alive: true,
            wins: 0,
            losses: 0,
            createdAt: 0,
            lastFeed: 0,
            lastWater: 0,
            lastSleep: 0,
            lastHealTick: 0
          }
        }
      }
      */
    }
  };
}

function readPets(guildId) {
  const file = petsPath(guildId);

  if (!fs.existsSync(file)) {
    const data = defaultPets();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data.users || typeof data.users !== "object") data.users = {};
    return data;
  } catch {
    const data = defaultPets();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }
}

function writePets(guildId, data) {
  if (!data.users || typeof data.users !== "object") data.users = {};
  fs.writeFileSync(petsPath(guildId), JSON.stringify(data, null, 2));
}

function ensurePetUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      activePetId: null,
      pets: {},
    };
  }

  const u = data.users[userId];
  u.activePetId ??= null;
  u.pets ??= {};
  return u;
}

function makePetId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getBaseStats(type) {
  const bases = {
    dog: { hp: 120, damage: 14, price: 500 },
    cat: { hp: 100, damage: 12, price: 450 },
    dragon: { hp: 220, damage: 26, price: 5000 },
  };
  return bases[type] || null;
}

function calcMaxHp(type, level) {
  const base = getBaseStats(type);
  if (!base) return 100;
  return base.hp + (Math.max(1, level) - 1) * 18;
}

function calcDamage(type, level) {
  const base = getBaseStats(type);
  if (!base) return 10;
  return base.damage + (Math.max(1, level) - 1) * 4;
}

function xpNeeded(level) {
  return Math.max(50, level * 60);
}

function createPet(type, petName = null) {
  const base = getBaseStats(type);
  if (!base) return null;

  const level = 1;
  const maxHp = calcMaxHp(type, level);

  return {
    id: makePetId(),
    name: petName || type,
    type,
    level,
    xp: 0,
    hp: maxHp,
    maxHp,
    food: 100,
    water: 100,
    alive: true,
    wins: 0,
    losses: 0,
    createdAt: Date.now(),
    lastFeed: 0,
    lastWater: 0,
    lastSleep: 0,
    lastHealTick: Date.now(),
  };
}

function levelUpPet(pet) {
  let leveled = false;
  while (pet.xp >= xpNeeded(pet.level)) {
    pet.xp -= xpNeeded(pet.level);
    pet.level += 1;
    pet.maxHp = calcMaxHp(pet.type, pet.level);
    pet.hp = pet.maxHp;
    leveled = true;
  }
  return leveled;
}

function applyPassiveHealing(pet) {
  if (!pet || !pet.alive) return;

  const now = Date.now();
  const last = Number(pet.lastHealTick || 0);
  const intervalMs = 10 * 60 * 1000; // 10 min
  const fullNeeds = pet.food >= 100 && pet.water >= 100;

  if (!fullNeeds) {
    pet.lastHealTick = now;
    return;
  }

  if (now - last < intervalMs) return;

  const ticks = Math.floor((now - last) / intervalMs);
  if (ticks <= 0) return;

  const healPerTick = Math.max(2, Math.floor(pet.maxHp * 0.03));
  pet.hp = Math.min(pet.maxHp, pet.hp + healPerTick * ticks);
  pet.lastHealTick = last + ticks * intervalMs;
}

function getPetList(u) {
  return Object.values(u.pets || {});
}

function getActivePet(u) {
  if (!u.activePetId) return null;
  return u.pets?.[u.activePetId] || null;
}

module.exports = {
  readPets,
  writePets,
  ensurePetUser,
  getBaseStats,
  calcMaxHp,
  calcDamage,
  xpNeeded,
  createPet,
  levelUpPet,
  applyPassiveHealing,
  getPetList,
  getActivePet,
};
