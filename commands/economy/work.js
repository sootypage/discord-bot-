const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const WORK_MIN = 50;
const WORK_MAX = 250;
const WORK_COOLDOWN_MS = 10 * 60 * 1000;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "work",
  category: "Economy",
  aliases: [],

  async execute(message) {
    const now = Date.now();
    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const next = (u.lastWork || 0) + WORK_COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return message.reply(`⏳ You’re tired. Try again in **${mins} min**.`);
    }

    const earned = randInt(WORK_MIN, WORK_MAX);
    u.lastWork = now;
    u.wallet = clampMoney(u.wallet + earned);
    writeEcon(message.guild.id, econ);

    await message.reply(`🛠️ You worked and earned **$${formatMoney(earned)}**. Wallet: **$${formatMoney(u.wallet)}**`);
  },
};
