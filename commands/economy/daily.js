const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const DAILY_AMOUNT = 500;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

module.exports = {
  name: "daily",
  category: "Economy",
  aliases: [],

  async execute(message) {
    const now = Date.now();
    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const next = (u.lastDaily || 0) + DAILY_COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return message.reply(`⏳ You already claimed daily. Try again in **${mins} min**.`);
    }

    u.lastDaily = now;
    u.wallet = clampMoney(u.wallet + DAILY_AMOUNT);
    writeEcon(message.guild.id, econ);

    await message.reply(`✅ You claimed **$${formatMoney(DAILY_AMOUNT)}**. Wallet: **$${formatMoney(u.wallet)}**`);
  },
};
