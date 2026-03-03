const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../lib/config");
const { sendModLog } = require("../lib/modlog");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(opt => opt.setName("user").setDescription("User to kick").setRequired(true))
    .addStringOption(opt => opt.setName("reason").setDescription("Reason").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") ?? "No reason provided";
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: "❌ I can’t find that member in this server.", ephemeral: true });
    }
    if (!member.kickable) {
      return interaction.reply({ content: "❌ I can’t kick that user (role hierarchy / permissions).", ephemeral: true });
    }

    await member.kick(reason);

    const cfg = getConfig(interaction.guildId);
    await sendModLog({
      guild: interaction.guild,
      channelId: cfg.modLogChannelId,
      content: `👢 **Kick** — ${user.tag} (${user.id})\nBy: ${interaction.user.tag}\nReason: ${reason}`
    });

    await interaction.reply({ content: `✅ Kicked ${user.tag}`, ephemeral: true });
  },
};