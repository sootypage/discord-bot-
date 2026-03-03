const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit money into your bank")
    .addIntegerOption((o) => o.setName("amount").setDescription("Amount (or use 0 for all)").setMinValue(0).setRequired(true)),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    const toDeposit = amount === 0 ? u.wallet : amount;
    if (toDeposit <= 0) return interaction.reply({ content: "❌ Nothing to deposit.", ephemeral: true });
    if (u.wallet < toDeposit) return interaction.reply({ content: `❌ Not enough wallet funds. Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });

    u.wallet = clampMoney(u.wallet - toDeposit);
    u.bank = clampMoney(u.bank + toDeposit);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `🏦 Deposited **$${formatMoney(toDeposit)}**.\nWallet: **$${formatMoney(u.wallet)}** | Bank: **$${formatMoney(u.bank)}**`, ephemeral: true });
  },
};