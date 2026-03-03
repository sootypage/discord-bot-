const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const COOLDOWN_MS = 30 * 1000;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coinflip")
    .setDescription("Bet money on a coinflip")
    .addIntegerOption((o) => o.setName("bet").setDescription("Bet amount").setMinValue(1).setRequired(true))
    .addStringOption((o) =>
      o.setName("side")
        .setDescription("heads or tails")
        .setRequired(true)
        .addChoices({ name: "heads", value: "heads" }, { name: "tails", value: "tails" })
    ),

  async execute(interaction) {
    const bet = interaction.options.getInteger("bet");
    const side = interaction.options.getString("side");

    const now = Date.now();
    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    if (now < u.lastCoinflip + COOLDOWN_MS) {
      const s = Math.ceil((u.lastCoinflip + COOLDOWN_MS - now) / 1000);
      return interaction.reply({ content: `⏳ Cooldown: **${s}s**`, ephemeral: true });
    }
    if (u.wallet < bet) return interaction.reply({ content: `❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });

    u.lastCoinflip = now;

    const result = Math.random() < 0.5 ? "heads" : "tails";
    if (result === side) {
      u.wallet = clampMoney(u.wallet + bet);
      writeEcon(interaction.guildId, econ);
      return interaction.reply({ content: `🪙 It was **${result}**! You **won** **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
    } else {
      u.wallet = clampMoney(u.wallet - bet);
      writeEcon(interaction.guildId, econ);
      return interaction.reply({ content: `🪙 It was **${result}**! You **lost** **$${formatMoney(bet)}**.\nWallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
    }
  },
};