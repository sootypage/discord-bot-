const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const INTEREST_RATE = 0.02; // 2% per day
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder().setName("interest").setDescription("Claim daily bank interest (24h cooldown)"),

  async execute(interaction) {
    const now = Date.now();
    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    const next = u.lastInterest + COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return interaction.reply({ content: `⏳ Interest already claimed. Try again in **${mins} min**.`, ephemeral: true });
    }

    if (u.bank <= 0) {
      u.lastInterest = now;
      writeEcon(interaction.guildId, econ);
      return interaction.reply({ content: "🏦 You have no money in the bank to earn interest.", ephemeral: true });
    }

    const gain = Math.max(1, Math.floor(u.bank * INTEREST_RATE));
    u.lastInterest = now;
    u.bank = clampMoney(u.bank + gain);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `✅ Bank interest: **+$${formatMoney(gain)}**\nBank: **$${formatMoney(u.bank)}**`, ephemeral: true });
  },
};