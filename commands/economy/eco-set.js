const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eco-set")
    .setDescription("Admin: set a user's balance")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName("user").setDescription("User").setRequired(true))
    .addIntegerOption(opt => opt.setName("amount").setDescription("New balance").setMinValue(0).setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, user.id);
    u.balance = clampMoney(amount);
    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `✅ Set **${user.tag}** balance to **$${formatMoney(u.balance)}**`, ephemeral: true });
  },
};