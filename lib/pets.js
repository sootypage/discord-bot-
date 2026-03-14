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
      // userId: { pet: {...} }
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
      pet: null,
    };
  }
  return data.users[userId];
}

function petXpNeeded(level) {
  return Math.max(50, level * 50);
}

function petBaseStats(type) {
  const base = {
    dog: { hp: 100, damage: 12, price: 500 },
    cat: { hp: 90, damage: 10, price: 450 },
    dragon: { hp: 250, damage: 25, price: 5000 },
  };

  return base[type] || base.dog;
}

function maxHpForPet(pet) {
  const base = pet.baseHp || 100;
  const level = pet.level || 1;
  return base + (level - 1) * 20;
}

function damageForPet(pet) {
  const base = pet.baseDamage || 10;
  const level = pet.level || 1;
  return base + (level - 1) * 4;
}

function levelUpPet(pet) {
  let leveledUp = false;

  while ((pet.xp || 0) >= petXpNeeded(pet.level || 1)) {
    pet.xp -= petXpNeeded(pet.level || 1);
    pet.level = (pet.level || 1) + 1;

    pet.maxHp = maxHpForPet(pet);
    pet.hp = pet.maxHp;

    leveledUp = true;
  }

  return leveledUp;
}

module.exports = {
  readPets,
  writePets,
  ensurePetUser,
  petXpNeeded,
  petBaseStats,
  maxHpForPet,
  damageForPet,
  levelUpPet,
};
