const { SlashCommandBuilder } = require("discord.js");
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
  // 3 of a kind big payout
  if (a === b && b === c) {
    if (a === "💎") return 10;
    if (a === "⭐") return 6;
    return 4;
  }
  // 2 of a kind small payout
  if (a === b || b === c || a === c) return 2;
  return 0;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slots")
    .setDescription("Play slots")
    .addIntegerOption((o) => o.setName("bet").setDescription("Bet amount").setMinValue(1).setRequired(true)),

  async execute(interaction) {
    const bet = interaction.options.getInteger("bet");
    const now = Date.now();

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    if (now < u.lastSlots + COOLDOWN_MS) {
      const s = Math.ceil((u.lastSlots + COOLDOWN_MS - now) / 1000);
      return interaction.reply({ content: `⏳ Cooldown: **${s}s**`, ephemeral: true });
    }
    if (u.wallet < bet) return interaction.reply({ content: `❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });

    u.lastSlots = now;

    const [a, b, c] = spin();
    const mult = payoutMultiplier(a, b, c);

    if (mult === 0) {
      u.wallet = clampMoney(u.wallet - bet);
      writeEcon(interaction.guildId, econ);
      return interaction.reply({ content: `🎰 ${a} ${b} ${c}\nYou lost **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
    }

    const win = bet * mult;
    // net profit: you keep your bet and gain win-bet? we’ll do: win includes profit; simplest: add win
    u.wallet = clampMoney(u.wallet + win);
    writeEcon(interaction.guildId, econ);

    return interaction.reply({
      content: `🎰 ${a} ${b} ${c}\nYou won **$${formatMoney(win)}** (**x${mult}**)!\nWallet: **$${formatMoney(u.wallet)}**`,
      ephemeral: true,
    });
  },
};