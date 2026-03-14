const {
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  name: "ticket-panel",
  category: "Tickets",
  aliases: [],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
      return message.reply("❌ You need Manage Server to use this command.");
    }

    const channel = message.mentions.channels.first() || message.channel;
    const data = store.read(message.guild.id);

    if (!data.settings.categoryChannelId) {
      return message.reply("❌ Run `!ticket-setup` first.");
    }

    const types = (data.settings.ticketTypes || []).slice(0, 25);
    if (!types.length) {
      return message.reply("❌ No ticket types were found in your ticket settings.");
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Open a ticket…")
      .addOptions(
        types.map((t) => ({
          label: t.label,
          value: t.id,
          description: t.description?.slice(0, 100) || "Open a ticket",
        }))
      );

    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Tickets")
      .setDescription("Select what you need help with from the dropdown. A private ticket channel will be created.");

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(menu)],
    });

    await message.reply(`✅ Ticket panel sent to ${channel}`);
  },
};
