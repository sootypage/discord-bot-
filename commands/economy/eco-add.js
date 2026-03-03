const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("eco-add")
    .setDescription("Admin: add money to a user's balance")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt => opt.setName("user").setDescription("User").setRequired(true))
    .addIntegerOption(opt => opt.setName("amount").setDescription("Amount to add").setMinValue(1).setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, user.id);
    u.balance = clampMoney(u.balance + amount);
    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `✅ Added **$${formatMoney(amount)}** to **${user.tag}**. New: **$${formatMoney(u.balance)}**`, ephemeral: true });
  },
};