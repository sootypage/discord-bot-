const { getShopItems, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "shop",
  category: "Economy",
  aliases: [],

  async execute(message) {
    const items = getShopItems();
    const lines = items.map((it) => `${it.id} — ${it.name} — $${formatMoney(it.price)} — ${it.description}`);
    await message.reply(`🛒 **Shop**\n\`\`\`\n${lines.join("\n")}\n\`\`\`\nBuy with: \`!buy item_id qty\``);
  },
};
