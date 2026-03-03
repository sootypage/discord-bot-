const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-add")
    .setDescription("Add a user to this ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption(o => o.setName("user").setDescription("User to add").setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    if (!interaction.channel?.topic?.includes("Ticket #")) {
      return interaction.reply({ content: "❌ This isn’t a ticket channel.", ephemeral: true });
    }

    await interaction.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await interaction.reply({ content: `✅ Added ${user} to this ticket.`, ephemeral: true });
  },
};