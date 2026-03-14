const fs = require("fs");
const path = require("path");

const PETS_DIR = path.join(__dirname, "..", "data", "pets");
fs.mkdirSync(PETS_DIR, { recursive: true });

const DELETE_DEAD_AFTER_MS = 10 * 60 * 1000;
const PASSIVE_HEAL_MS = 60 * 1000;

const PET_TYPES = {
  dog: { price: 500, baseHp: 100, baseDamage: 12 },
  cat: { price: 450, baseHp: 90, baseDamage: 10 },
  dragon: { price: 5000, baseHp: 250, baseDamage: 25 },
};

function petsPath(guildId) {
  return path.join(PETS_DIR, `${guildId}.json`);
}

function defaultPets() {
  return {
    users: {
      // userId: { pets: [ ... ] }
    },
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
    cleanupPets(data);
    return data;
  } catch {
    const data = defaultPets();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }
}

function writePets(guildId, data) {
  if (!data.users || typeof data.users !== "object") data.users = {};
  cleanupPets(data);
  fs.writeFileSync(petsPath(guildId), JSON.stringify(data, null, 2));
}

function ensureUserPets(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { pets: [] };
  }
  if (!Array.isArray(data.users[userId].pets)) {
    data.users[userId].pets = [];
  }
  return data.users[userId];
}

function makePetId() {
  return `pet_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function xpNeeded(level) {
  return Math.max(50, level * 50);
}

function maxHpForPet(pet) {
  const base = Number(pet.baseHp || 100);
  const level = Number(pet.level || 1);
  return base + (level - 1) * 20;
}

function damageForPet(pet) {
  const base = Number(pet.baseDamage || 10);
  const level = Number(pet.level || 1);
  return base + (level - 1) * 4;
}

function healPassive(pet) {
  const now = Date.now();
  const lastTick = Number(pet.lastPassiveHeal || 0);

  if (!pet.alive) return;
  if ((pet.food || 0) < 100) return;
  if ((pet.water || 0) < 100) return;
  if (now - lastTick < PASSIVE_HEAL_MS) return;

  const ticks = Math.floor((now - lastTick) / PASSIVE_HEAL_MS) || 1;
  const maxHp = maxHpForPet(pet);
  pet.maxHp = maxHp;
  pet.hp = Math.min(maxHp, (pet.hp || maxHp) + ticks * 2);
  pet.lastPassiveHeal = now;
}

function cleanupPets(data) {
  const now = Date.now();

  for (const userId of Object.keys(data.users || {})) {
    const user = ensureUserPets(data, userId);

    user.pets = user.pets.filter((pet) => {
      if (!pet || typeof pet !== "object") return false;

      pet.id ||= makePetId();
      pet.nickname ||= pet.type || "Pet";
      pet.type ||= "dog";
      pet.level ||= 1;
      pet.xp ||= 0;
      pet.baseHp ||= PET_TYPES[pet.type]?.baseHp || 100;
      pet.baseDamage ||= PET_TYPES[pet.type]?.baseDamage || 10;
      pet.maxHp = maxHpForPet(pet);
      pet.hp = Math.min(Number(pet.hp ?? pet.maxHp), pet.maxHp);
      pet.food = Math.max(0, Math.min(100, Number(pet.food ?? 100)));
      pet.water = Math.max(0, Math.min(100, Number(pet.water ?? 100)));
      pet.alive = Boolean(pet.alive ?? true);
      pet.wins ||= 0;
      pet.losses ||= 0;
      pet.createdAt ||= now;
      pet.lastSleep ||= 0;
      pet.lastPassiveHeal ||= now;
      pet.deadAt ||= 0;

      if (!pet.alive && pet.deadAt && now - pet.deadAt > DELETE_DEAD_AFTER_MS) {
        return false;
      }

      healPassive(pet);
      return true;
    });
  }
}

function addXp(pet, amount) {
  pet.xp = Number(pet.xp || 0) + Number(amount || 0);

  while (pet.xp >= xpNeeded(pet.level || 1)) {
    pet.xp -= xpNeeded(pet.level || 1);
    pet.level = Number(pet.level || 1) + 1;
    pet.maxHp = maxHpForPet(pet);
    pet.hp = pet.maxHp;
  }
}

function createPet(type, nickname) {
  const t = PET_TYPES[type];
  if (!t) return null;

  return {
    id: makePetId(),
    type,
    nickname: nickname?.trim() || type,
    level: 1,
    xp: 0,
    baseHp: t.baseHp,
    baseDamage: t.baseDamage,
    maxHp: t.baseHp,
    hp: t.baseHp,
    food: 100,
    water: 100,
    alive: true,
    wins: 0,
    losses: 0,
    createdAt: Date.now(),
    lastSleep: 0,
    lastPassiveHeal: Date.now(),
    deadAt: 0,
  };
}

function getPetTypes() {
  return PET_TYPES;
}

function getUserPets(data, userId) {
  return ensureUserPets(data, userId).pets;
}

function getAlivePets(data, userId) {
  return getUserPets(data, userId).filter((p) => p.alive);
}

function findPet(data, userId, petId) {
  return getUserPets(data, userId).find((p) => p.id === petId) || null;
}

function firstAlivePet(data, userId) {
  return getAlivePets(data, userId)[0] || null;
}

function killPet(pet) {
  pet.alive = false;
  pet.hp = 0;
  pet.deadAt = Date.now();
}

module.exports = {
  readPets,
  writePets,
  ensureUserPets,
  getPetTypes,
  createPet,
  getUserPets,
  getAlivePets,
  findPet,
  firstAlivePet,
  addXp,
  xpNeeded,
  maxHpForPet,
  damageForPet,
  killPet,
  DELETE_DEAD_AFTER_MS,
};
