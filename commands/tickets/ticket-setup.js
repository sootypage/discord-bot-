const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const store = require("../../tickets/ticketStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("Admin: configure tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption(o =>
      o.setName("category")
        .setDescription("Category channel to create tickets under")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addRoleOption(o => o.setName("support_role").setDescription("Role that can view tickets").setRequired(false))
    .addChannelOption(o =>
      o.setName("log_channel")
        .setDescription("Optional log channel")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    const category = interaction.options.getChannel("category");
    const supportRole = interaction.options.getRole("support_role");
    const logChannel = interaction.options.getChannel("log_channel");

    const data = store.read(interaction.guildId);
    data.settings.categoryChannelId = category.id;
    data.settings.supportRoleId = supportRole?.id ?? null;
    data.settings.logChannelId = logChannel?.id ?? null;
    store.write(interaction.guildId, data);

    await interaction.reply({ content: "✅ Ticket system configured.", ephemeral: true });
  },
};