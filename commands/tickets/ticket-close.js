const { PermissionFlagsBits } = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  name: "ticket-close",
  category: "Tickets",
  aliases: ["close-ticket"],

  async execute(message) {
    const data = store.read(message.guild.id);
    const isTicketChannel = message.channel?.topic?.includes("Ticket #");
    if (!isTicketChannel) return message.reply("❌ This isn’t a ticket channel.");

    const ownerId = Object.keys(data.openTickets || {}).find(
      (uid) => data.openTickets[uid]?.channelId === message.channel.id
    );
    const isOwner = ownerId === message.author.id;
    const canManage = message.member.permissions.has(PermissionFlagsBits.ManageChannels);

    if (!isOwner && !canManage) {
      return message.reply("❌ Only the owner or staff can close this ticket.");
    }

    if (ownerId) delete data.openTickets[ownerId];
    store.write(message.guild.id, data);

    await message.reply("✅ Closing ticket in 3 seconds…");
    setTimeout(() => message.channel.delete().catch(() => {}), 3000);
  },
};
