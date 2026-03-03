const { SlashCommandBuilder } = require("discord.js");
const { readEcon, writeEcon, ensureUser, clampMoney, formatMoney, findShopItem, addItem } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Buy an item from the shop")
    .addStringOption((o) => o.setName("item_id").setDescription("Item id from /shop").setRequired(true))
    .addIntegerOption((o) => o.setName("qty").setDescription("Quantity").setMinValue(1).setRequired(false)),

  async execute(interaction) {
    const itemId = interaction.options.getString("item_id");
    const qty = interaction.options.getInteger("qty") ?? 1;

    const item = findShopItem(itemId);
    if (!item) return interaction.reply({ content: "❌ Unknown item. Use `/shop` to see item ids.", ephemeral: true });

    const cost = item.price * qty;

    const econ = readEcon(interaction.guildId);
    const u = ensureUser(econ, interaction.user.id);

    if (u.wallet < cost) {
      return interaction.reply({ content: `❌ Not enough money. Cost: **$${formatMoney(cost)}** | Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
    }

    u.wallet = clampMoney(u.wallet - cost);
    addItem(u, item.id, qty);

    writeEcon(interaction.guildId, econ);

    await interaction.reply({ content: `✅ Bought **${qty}x ${item.name}** for **$${formatMoney(cost)}**. Wallet: **$${formatMoney(u.wallet)}**`, ephemeral: true });
  },
};