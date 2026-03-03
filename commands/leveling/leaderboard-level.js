const { SlashCommandBuilder } = require("discord.js");
const { readLevels } = require("../../lib/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard-level")
    .setDescription("Top levels in this server"),

  async execute(interaction) {
    const data = readLevels(interaction.guildId);

    const sorted = Object.entries(data.users)
      .sort((a, b) => b[1].level - a[1].level)
      .slice(0, 10);

    if (sorted.length === 0)
      return interaction.reply({ content: "No level data yet.", ephemeral: true });

    const lines = sorted.map(
      ([id, u], i) => `${i + 1}. <@${id}> — Level ${u.level}`
    );

    await interaction.reply({
      content: `🏆 **Level Leaderboard**\n\`\`\`\n${lines.join("\n")}\n\`\`\``,
      ephemeral: true,
    });
  },
};