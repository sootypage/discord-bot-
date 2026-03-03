const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ChannelType,
} = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-panel")
    .setDescription("Admin: send the ticket dropdown panel")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("Where to send the panel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");
    const data = store.read(interaction.guildId);

    if (!data.settings.categoryChannelId) {
      return interaction.reply({ content: "❌ Run `/ticket-setup` first.", ephemeral: true });
    }

    const types = data.settings.ticketTypes.slice(0, 25);

    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Open a ticket…")
      .addOptions(
        types.map(t => ({
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

    await interaction.reply({ content: `✅ Ticket panel sent to ${channel}`, ephemeral: true });
  },
};