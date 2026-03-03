const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data", "guilds");
fs.mkdirSync(DATA_DIR, { recursive: true });

function defaultConfig() {
  return {
    prefix: "!",
    welcomeChannelId: null,
    autoRoleId: null,
    logsChannelId: null,
    modLogChannelId: null,

    // NEW: bad words list (one per line in dashboard)
    badWords: [],
    badWordAction: "delete", // reserved for later ("delete" | "warn")

    warnings: {
      // userId: [
      //   { by: "moderatorId", reason: "reason text", at: timestamp }
      // ]
    },
  };
}

function configPath(guildId) {
  return path.join(DATA_DIR, `${guildId}.json`);
}

function getConfig(guildId) {
  const file = configPath(guildId);

  if (!fs.existsSync(file)) {
    const cfg = defaultConfig();
    fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
    return cfg;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));

    // merge new keys into old configs safely
    const merged = {
      ...defaultConfig(),
      ...parsed,
      warnings: parsed.warnings ?? {},
      badWords: Array.isArray(parsed.badWords) ? parsed.badWords : [],
    };

    return merged;
  } catch (err) {
    console.error("❌ Failed to parse config, resetting:", err);
    const cfg = defaultConfig();
    fs.writeFileSync(file, JSON.stringify(cfg, null, 2));
    return cfg;
  }
}

function saveConfig(guildId, config) {
  const file = configPath(guildId);
  fs.writeFileSync(file, JSON.stringify(config, null, 2));
}

module.exports = {
  getConfig,
  saveConfig,
};