const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const DAILY_AMOUNT = 500;
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000;

module.exports = {
  data: new SlashCommandBuilder().setName("daily").setDescription("Claim your daily money (24h cooldown)"),

  async execute(interaction) {
    const now = Date.now();
    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    const next = u.lastDaily + DAILY_COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return interaction.reply({ content: `⏳ You already claimed daily. Try again in **${mins} min**.`, ephemeral: true });
    }

    u.lastDaily = now;
    u.wallet = clampMoney(u.wallet + DAILY_AMOUNT);
    writeEcon(interaction.guildId, econ);

    await interaction.reply({
      content: `✅ You claimed **$${formatMoney(DAILY_AMOUNT)}**. Wallet: **$${formatMoney(u.wallet)}**`,
      ephemeral: true,
    });
  },
};