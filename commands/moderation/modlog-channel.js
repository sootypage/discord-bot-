const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig, saveConfig } = require("../lib/config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("modlog-channel")
    .setDescription("Set the moderation log channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(opt =>
      opt.setName("channel").setDescription("Channel for mod logs").setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const cfg = getConfig(interaction.guildId);
    cfg.modLogChannelId = channel.id;
    saveConfig(interaction.guildId, cfg);

    await interaction.reply({ content: `✅ Mod log channel set to ${channel}`, ephemeral: true });
  },
};