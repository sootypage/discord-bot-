const { PermissionFlagsBits } = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  name: "ticket-setup",
  category: "Tickets",
  aliases: [],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ You need Manage Server to use this command.");
    }

    const category = message.mentions.channels.first();
    const role = message.mentions.roles.first();
    const channelMentions = [...message.mentions.channels.values()];
    const logChannel = channelMentions[1] || null;

    if (!category) {
      return message.reply("❌ Use `!ticket-setup #category [@supportRole] [#logChannel]`.");
    }

    const data = store.read(message.guild.id);
    data.settings.categoryChannelId = category.id;
    data.settings.supportRoleId = role?.id ?? null;
    data.settings.logChannelId = logChannel?.id ?? null;
    store.write(message.guild.id, data);

    await message.reply("✅ Ticket system configured.");
  },
};
