const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney, findShopItem, removeItem } = require("../../lib/economy");

const SELL_RATE = 0.5;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Sell an item from your inventory (50% refund)")
    .addStringOption((o) => o.setName("item_id").setDescription("Item id").setRequired(true))
    .addIntegerOption((o) => o.setName("qty").setDescription("Quantity").setMinValue(1).setRequired(false)),

  async execute(interaction) {
    const itemId = interaction.options.getString("item_id");
    const qty = interaction.options.getInteger("qty") ?? 1;

    const item = findShopItem(itemId);
    if (!item) return interaction.reply({ content: "❌ Unknown item id.", ephemeral: true });

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    if (!removeItem(u, item.id, qty)) {
      return interaction.reply({ content: `❌ You don’t have ${qty}x of that item.`, ephemeral: true });
    }

    const refund = Math.floor(item.price * qty * SELL_RATE);
    u.wallet = clampMoney(u.wallet + refund);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `✅ Sold **${qty}x ${item.name}** for **$${formatMoney(refund)}**. Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
  },
};