const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-remove")
    .setDescription("Remove a user from this ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption(o => o.setName("user").setDescription("User to remove").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    if (!interaction.channel?.topic?.includes("Ticket #")) {
      return interaction.reply({ content: "❌ This isn’t a ticket channel.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.delete(user.id).catch(() => {});
    await interaction.reply({ content: `✅ Removed ${user} from this ticket.`, ephemeral: true });
  },
};