const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const WORK_MIN = 50;
const WORK_MAX = 250;
const WORK_COOLDOWN_MS = 10 * 60 * 1000;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  data: new SlashCommandBuilder().setName("work").setDescription("Work for some money (10m cooldown)"),

  async execute(interaction) {
    const now = Date.now();
    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    const next = u.lastWork + WORK_COOLDOWN_MS;
    if (now < next) {
      const mins = Math.ceil((next - now) / 60000);
      return interaction.reply({ content: `⏳ You’re tired. Try again in **${mins} min**.`, ephemeral: true });
    }

    const earned = randInt(WORK_MIN, WORK_MAX);
    u.lastWork = now;
    u.wallet = clampMoney(u.wallet + earned);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({
      content: `🛠️ You worked and earned **$${formatMoney(earned)}**. Wallet: **$${formatMoney(u.wallet)}**`,
      ephemeral: true,
    });
  },
};