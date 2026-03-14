const { readEcon, getShopItems, formatMoney } = require("../../lib/economy");

module.exports = {
  name: "shop",
  category: "Economy",
  aliases: [],

  async execute(message) {
    const data = readEcon(message.guild.id);
    const items = getShopItems(data);

    if (!items.length) {
      return message.reply("🛒 The shop is empty.");
    }

    const lines = items.map(
      (it) => `${it.id} — ${it.name} — $${formatMoney(it.price)} — ${it.description}`
    );

    await message.reply(
      `🛒 **Shop**\n\`\`\`\n${lines.join("\n")}\n\`\`\`\nBuy with: \`!buy item_id qty\``
    );
  },
};
