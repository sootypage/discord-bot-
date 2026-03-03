const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove timeout from a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to untimeout").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) return interaction.reply({ content: "❌ I can’t find that member.", ephemeral: true });
    if (!member.moderatable) return interaction.reply({ content: "❌ I can’t edit that user (role hierarchy / permissions).", ephemeral: true });

    await member.timeout(null, reason);

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `✅ **Untimeout** — ${user.tag} (${user.id})\nBy: ${interaction.user.tag}\nReason: ${reason}`
    });

    await interaction.reply({ content: `✅ Removed timeout from ${user.tag}`, ephemeral: true });
  },
};