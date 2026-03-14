const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const INTEREST_RATE = 0.02;
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

module.exports = {
  name: "interest",
  category: "Economy",
  aliases: [],

  async execute(message) {
    const now = Date.now();
    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    const next = (u.lastInterest || 0) + COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return message.reply(`⏳ Interest already claimed. Try again in **${mins} min**.`);
    }

    if (u.bank <= 0) {
      u.lastInterest = now;
      writeEcon(message.guild.id, econ);
      return message.reply("🏦 You have no money in the bank to earn interest.");
    }

    const gain = Math.max(1, Math.floor(u.bank * INTEREST_RATE));
    u.lastInterest = now;
    u.bank = clampMoney(u.bank + gain);
    writeEcon(message.guild.id, econ);

    await message.reply(`✅ Bank interest: **+$${formatMoney(gain)}**\nBank: **$${formatMoney(u.bank)}**`);
  },
};
