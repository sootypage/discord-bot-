const fs = require("fs");
const path = require("path");

const LEVEL_DIR = path.join(__dirname, "..", "data", "levels");
fs.mkdirSync(LEVEL_DIR, { recursive: true });

function levelPath(guildId) {
  return path.join(LEVEL_DIR, `${guildId}.json`);
}

function defaultData() {
  return {
    settings: {
      levelChannelId: null,
      xpMin: 5,
      xpMax: 20,
      cooldownMs: 60000,
      levelRoles: [
        // { level: 5, roleId: "123" }
      ],
    },
    users: {
      // userId: { xp: 0, level: 0, lastMessage: 0 }
    },
  };
}

function readLevels(guildId) {
  const file = levelPath(guildId);
  if (!fs.existsSync(file)) {
    const data = defaultData();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }

  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    data.settings ??= defaultData().settings;
    data.users ??= {};
    data.settings.levelRoles ??= [];
    data.settings.xpMin ??= 5;
    data.settings.xpMax ??= 20;
    data.settings.cooldownMs ??= 60000;
    return data;
  } catch {
    const data = defaultData();
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  }
}

function writeLevels(guildId, data) {
  fs.writeFileSync(levelPath(guildId), JSON.stringify(data, null, 2));
}

function ensureUser(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { xp: 0, level: 0, lastMessage: 0 };
  }
  return data.users[userId];
}

function xpNeeded(level) {
  return 5 * level * level + 50 * level + 100;
}

module.exports = { readLevels, writeLevels, ensureUser, xpNeeded };