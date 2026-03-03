// commands/economy/pay.js
const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney } = require("../../lib/economy");

const TAX_RATE = 0.05; // 5%

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pay")
    .setDescription("Pay another user money (5% tax)")
    .addUserOption((opt) => opt.setName("user").setDescription("Who to pay").setRequired(true))
    .addIntegerOption((opt) =>
      opt.setName("amount").setDescription("Amount to send").setMinValue(1).setRequired(true)
    ),

  async execute(interaction) {
    const toUser = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    if (toUser.bot) return interaction.reply({ content: "❌ You can’t pay bots.", ephemeral: true });
    if (toUser.id === interaction.user.id)
      return interaction.reply({ content: "❌ You can’t pay yourself.", ephemeral: true });

    const fee = Math.ceil(amount * TAX_RATE);
    const totalCost = amount + fee;

    const econ = readEcon(interaction.guildId);
    const from = ensureUser(econ, interaction.user.id);
    const to = ensureUser(econ, toUser.id);

    if (from.wallet < totalCost) {
      return interaction.reply({
        content: `❌ Not enough funds.\nYou need **$${formatMoney(totalCost)}** (amount $${formatMoney(
          amount
        )} + tax $${formatMoney(fee)}).\nYour wallet: **$${formatMoney(from.wallet)}**`,
        ephemeral: true,
      });
    }

    from.wallet = clampMoney(from.wallet - totalCost);
    to.wallet = clampMoney(to.wallet + amount);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({
      content:
        `✅ Sent **$${formatMoney(amount)}** to **${toUser.tag}**\n` +
        `Tax: **$${formatMoney(fee)}** | Total cost: **$${formatMoney(totalCost)}**\n` +
        `Your wallet: **$${formatMoney(from.wallet)}**`,
      ephemeral: true,
    });
  },
};