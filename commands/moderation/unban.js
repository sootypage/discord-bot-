const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban a user by ID")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(opt => opt.setName("user_id").setDescription("User ID to unban").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const userId = interaction.options.getString("user_id");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    if (!/^\d{17,20}$/.test(userId)) {
      return interaction.reply({ content: "❌ That doesn’t look like a valid user ID.", ephemeral: true });
    }

    await interaction.guild.members.unban(userId, reason);

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `✅ **Unban** — ${userId}\nBy: ${interaction.user.tag}\nReason: ${reason}`
    });

    await interaction.reply({ content: `✅ Unbanned **${userId}**`, ephemeral: true });
  },
};