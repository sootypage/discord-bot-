const { SlashCommandBuilder } = require("discord.js");
const { readEcon, ensureUser, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Check your (or someone else's) wallet + bank")
    .addUserOption((opt) => opt.setName("user").setDescription("User to check").setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser("user") ?? interaction.user;

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, user.id);

    await interaction.reply({
      content:
        `💰 **${user.tag}**\n` +
        `Wallet: **$${formatMoney(u.wallet)}**\n` +
        `Bank: **$${formatMoney(u.bank)}**\n` +
        `Total: **$${formatMoney(u.wallet + u.bank)}**`,
      ephemeral: true,
    });
  },
};