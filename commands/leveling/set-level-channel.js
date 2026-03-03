const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { readLevels, writeLevels } = require("../../lib/leveling");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set-level-channel")
    .setDescription("Set channel for level up messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o => o.setName("channel").setDescription("Channel").setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const data = readLevels(interaction.guildId);
    data.levelChannelId = channel.id;
    writeLevels(interaction.guildId, data);

    await interaction.reply({
      content: `✅ Level up messages will go to ${channel}`,
      ephemeral: true,
    });
  },
};