const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-close")
    .setDescription("Close the current ticket")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const data = store.read(interaction.guildId);
    const isTicketChannel = interaction.channel?.topic?.includes("Ticket #");
    if (!isTicketChannel) return interaction.reply({ content: "❌ This isn’t a ticket channel.", ephemeral: true });

    const ownerId = Object.keys(data.openTickets).find((uid) => data.openTickets[uid]?.channelId === interaction.channelId);
    const isOwner = ownerId === interaction.user.id;
    const canManage = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);

    if (!isOwner && !canManage) return interaction.reply({ content: "❌ Only the owner or staff can close this ticket.", ephemeral: true });

    if (ownerId) delete data.openTickets[ownerId];
    store.write(interaction.guildId, data);

    await interaction.reply({ content: "✅ Closing ticket in 3 seconds…", ephemeral: true });
    setTimeout(() => interaction.channel.delete("Ticket closed").catch(() => {}), 3000);
  },
};