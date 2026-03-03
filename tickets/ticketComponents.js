// tickets/ticketComponents.js
const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

const store = require("./ticketStore");

async function handleTicketComponent(interaction) {
  // Ticket dropdown
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_type_select") {
    const typeId = interaction.values[0];

    const data = store.read(interaction.guildId);
    const s = data.settings;

    if (!s.categoryChannelId) {
      await interaction.reply({ content: "❌ Tickets are not set up yet. Admin must run `/ticket-setup`.", ephemeral: true });
      return true;
    }

    // Prevent multiple open tickets
    const existing = data.openTickets[interaction.user.id];
    if (existing?.channelId) {
      await interaction.reply({ content: `❌ You already have an open ticket: <#${existing.channelId}>`, ephemeral: true });
      return true;
    }

    const type = s.ticketTypes.find((t) => t.id === typeId);
    if (!type) {
      await interaction.reply({ content: "❌ Unknown ticket type.", ephemeral: true });
      return true;
    }

    const ticketNo = data.nextId++;
    const name = `ticket-${String(ticketNo).padStart(4, "0")}`;

    const overwrites = [
      { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
      { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
      { id: interaction.client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory] },
    ];

    if (s.supportRoleId) {
      overwrites.push({
        id: s.supportRoleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
      });
    }

    const channel = await interaction.guild.channels.create({
      name,
      type: ChannelType.GuildText,
      parent: s.categoryChannelId,
      topic: `Ticket #${ticketNo} | ${interaction.user.tag} (${interaction.user.id}) | Type: ${type.id}`,
      permissionOverwrites: overwrites,
    });

    data.openTickets[interaction.user.id] = { channelId: channel.id, typeId: type.id, ticketNo };
    store.write(interaction.guildId, data);

    const embed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketNo} — ${type.label}`)
      .setDescription(
        `Hello ${interaction.user}!\n` +
        `A staff member will be with you soon.\n\n` +
        `**Type:** ${type.label}\n` +
        `Use the button below to close this ticket when done.`
      );

    const closeBtn = new ButtonBuilder()
      .setCustomId("ticket_close_btn")
      .setLabel("Close Ticket")
      .setStyle(ButtonStyle.Danger);

    await channel.send({ content: s.supportRoleId ? `<@&${s.supportRoleId}>` : "", embeds: [embed], components: [new ActionRowBuilder().addComponents(closeBtn)] });

    await interaction.reply({ content: `✅ Ticket created: ${channel}`, ephemeral: true });
    return true;
  }

  // Close button
  if (interaction.isButton() && interaction.customId === "ticket_close_btn") {
    // Must be used inside a ticket channel
    const data = store.read(interaction.guildId);

    const isTicketChannel = interaction.channel?.topic?.includes("Ticket #");
    if (!isTicketChannel) {
      await interaction.reply({ content: "❌ This isn’t a ticket channel.", ephemeral: true });
      return true;
    }

    // Find owner by matching openTickets channelId
    const ownerId = Object.keys(data.openTickets).find((uid) => data.openTickets[uid]?.channelId === interaction.channelId);

    // Allow if: owner or has manage channels
    const isOwner = ownerId === interaction.user.id;
    const canManage = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels);

    if (!isOwner && !canManage) {
      await interaction.reply({ content: "❌ Only the ticket owner or staff can close this ticket.", ephemeral: true });
      return true;
    }

    if (ownerId) delete data.openTickets[ownerId];
    store.write(interaction.guildId, data);

    await interaction.reply({ content: "✅ Closing ticket in 3 seconds…", ephemeral: true });
    setTimeout(() => interaction.channel.delete("Ticket closed").catch(() => {}), 3000);
    return true;
  }

  return false;
}

module.exports = { handleTicketComponent };