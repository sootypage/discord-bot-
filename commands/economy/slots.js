const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const COOLDOWN_MS = 45 * 1000;
const SYMBOLS = ["🍒", "🍋", "🍇", "⭐", "💎"];

function spin() {
  return [
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
  ];
}

function payoutMultiplier(a, b, c) {
  if (a === b && b === c) {
    if (a === "💎") return 10;
    if (a === "⭐") return 6;
    return 4;
  }
  if (a === b || b === c || a === c) return 2;
  return 0;
}

module.exports = {
  name: "slots",
  category: "Economy",
  aliases: [],

  async execute(message, args) {
    const bet = Number(args[0]);
    const now = Date.now();

    if (!Number.isInteger(bet) || bet < 1) {
      return message.reply("❌ Use `!slots <bet>`.");
    }

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, message.author.id);

    if (now < (u.lastSlots || 0) + COOLDOWN_MS) {
      const s = Math.ceil((((u.lastSlots || 0) + COOLDOWN_MS) - now) / 1000);
      return message.reply(`⏳ Cooldown: **${s}s**`);
    }
    if (u.wallet < bet) {
      return message.reply(`❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`);
    }

    u.lastSlots = now;

    const [a, b, c] = spin();
    const mult = payoutMultiplier(a, b, c);

    if (mult === 0) {
      u.wallet = clampMoney(u.wallet - bet);
      writeEcon(message.guild.id, econ);
      return message.reply(`🎰 ${a} ${b} ${c}\nYou lost **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`);
    }

    const win = bet * mult;
    u.wallet = clampMoney(u.wallet + win);
    writeEcon(message.guild.id, econ);

    return message.reply(`🎰 ${a} ${b} ${c}\nYou won **$${formatMoney(win)}** (**x${mult}**)\nWallet: **$${formatMoney(u.wallet)}**`);
  },
};
