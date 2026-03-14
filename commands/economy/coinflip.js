const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const COOLDOWN_MS = 30 * 1000;

module.exports = {
  name: "coinflip",
  category: "Economy",
  aliases: ["cf"],

  async execute(message, args) {
    const bet = Number(args[0]);
    const side = String(args[1] || "").toLowerCase();

    if (!Number.isInteger(bet) || bet < 1) {
      return message.reply("❌ Use `!coinflip <bet> <heads/tails>`.");
    }
    if (!["heads", "tails"].includes(side)) {
      return message.reply("❌ Choose `heads` or `tails`.");
    }

    const now = Date.now();
    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    if (now < (u.lastCoinflip || 0) + COOLDOWN_MS) {
      const s = Math.ceil((((u.lastCoinflip || 0) + COOLDOWN_MS) - now) / 1000);
      return message.reply(`⏳ Cooldown: **${s}s**`);
    }
    if (u.wallet < bet) {
      return message.reply(`❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`);
    }

    u.lastCoinflip = now;
    const result = Math.random() < 0.5 ? "heads" : "tails";

    if (result === side) {
      u.wallet = clampMoney(u.wallet + bet);
      writeEcon(message.guild.id, econ);
      return message.reply(`🪙 It was **${result}**! You **won** **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`);
    }

    u.wallet = clampMoney(u.wallet - bet);
    writeEcon(message.guild.id, econ);
    return message.reply(`🪙 It was **${result}**! You **lost** **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`);
  },
};
