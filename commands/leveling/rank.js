const { SlashCommandBuilder } = require("discord.js");
const { readLevels, ensureUser } = require("../../lib/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Check your level")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const data = readLevels(interaction.guildId);
    const u = ensureUser(data, user.id);

    await interaction.reply({
      content:
        `📊 **${user.tag}**\n` +
        `Level: **${u.level}**\n` +
        `XP: **${u.xp}**`,
      ephemeral: true,
    });
  },
};