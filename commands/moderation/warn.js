const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig, saveConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member (stored in server file)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to warn").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    const cfg = getConfig(interaction.guildId);
    cfg.warnings ||= {};
    cfg.warnings[user.id] ||= [];
    cfg.warnings[user.id].push({
      by: interaction.user.id,
      reason,
      at: Date.now(),
    });
    saveConfig(interaction.guildId, cfg);

    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `⚠️ **Warn** — ${user.tag} (${user.id})\nBy: ${interaction.user.tag}\nReason: ${reason}\nTotal warnings: ${cfg.warnings[user.id].length}`
    });

    await interaction.reply({ content: `✅ Warned ${user.tag}. Total warnings: **${cfg.warnings[user.id].length}**`, ephemeral: true });
  },
};