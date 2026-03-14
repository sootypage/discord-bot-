const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "ticket-add",
  category: "Tickets",
  aliases: [],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
      return message.reply("❌ You need Manage Channels to use this command.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mention a user to add.");
    if (!message.channel?.topic?.includes("Ticket #")) {
      return message.reply("❌ This isn’t a ticket channel.");
    }

    await message.channel.permissionOverwrites.edit(user.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await message.reply(`✅ Added ${user} to this ticket.`);
  },
};
