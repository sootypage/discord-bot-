const { SlashCommandBuilder } = require("discord.js");
const { getShopItems, formatMoney } = require("../../lib/economy");

module.exports = {
  data: new SlashCommandBuilder().setName("shop").setDescription("View items you can buy"),

  async execute(interaction) {
    const items = getShopItems();
    const lines = items.map((it) => `${it.id} — ${it.name} — $${formatMoney(it.price)} — ${it.description}`);
    await interaction.reply({ content: `🛒 **Shop**\n\`\`\`\n${lines.join("\n")}\n\`\`\`\nBuy with: \`/buy item_id qty\``, ephemeral: true });
  },
};
