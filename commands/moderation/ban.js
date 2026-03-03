const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to ban").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false))
    .addIntegerOption(opt => opt.setName("delete_days").setDescription("Delete message history (0-7 days)").setMinValue(0).setMaxValue(7).setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_days") ?? 0;

    // Try fetch member if in guild (for hierarchy checks)
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (member && !member.bannable) {
      return interaction.reply({ content: "❌ I can’t ban that user (role hierarchy / permissions).", ephemeral: true });
    }

    await interaction.guild.members.ban(user.id, { reason, deleteMessageSeconds: deleteDays * 24 * 60 * 60 });

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `🔨 **Ban** — ${user.tag} (${user.id})\nBy: ${interaction.user.tag}\nReason: ${reason}\nDelete days: ${deleteDays}`
    });

    await interaction.reply({ content: `✅ Banned ${user.tag}`, ephemeral: true });
  },
};