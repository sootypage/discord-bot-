const { SlashCommandBuilder } = require("discord.js");
const { readEcon, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top balances in this server"),

  async execute(interaction) {
    const econ = readEcon(interaction.guildId);

    const rows = Object.entries(econ.users || {})
      .map(([userId, u]) => ({ userId, bal: Number(u.balance) || 0 }))
      .sort((a, b) => b.bal - a.bal)
      .slice(0, 10);

    if (rows.length === 0) {
      return interaction.reply({ content: "No economy data yet. Use `/daily` or `/work`!", ephemeral: true });
    }

    const lines = rows.map((r, i) => `${i + 1}. <@${r.userId}> — $${formatMoney(r.bal)}`);

    await interaction.reply({
      content: `🏆 **Economy Leaderboard (Top 10)**\n` + "```" + lines.join("\n") + "```",
      ephemeral: true,
    });
  },
};