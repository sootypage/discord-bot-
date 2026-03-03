const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw money from your bank")
    .addIntegerOption((o) => o.setName("amount").setDescription("Amount (or use 0 for all)").setMinValue(0).setRequired(true)),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    const toWithdraw = amount === 0 ? u.bank : amount;
    if (toWithdraw <= 0) return interaction.reply({ content: "❌ Nothing to withdraw.", ephemeral: true });
    if (u.bank < toWithdraw) return interaction.reply({ content: `❌ Not enough bank funds. Bank: **$${formatMoney(u.bank)}**`, ephemeral: true });

    u.bank = clampMoney(u.bank - toWithdraw);
    u.wallet = clampMoney(u.wallet + toWithdraw);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `🏦 Withdrew **$${formatMoney(toWithdraw)}**.\nWallet: **$${formatMoney(u.wallet)}** | Bank: **$${formatMoney(u.bank)}**`, ephemeral: true });
  },
};