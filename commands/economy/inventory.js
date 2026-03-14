const { readEcon, ensureUser, getShopItems } = require("../../lib/economy");

module.exports = {
  name: "inventory",
  category: "Economy",
  aliases: ["inv"],

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const econ = readEcon(message.guild.id);
    const u = ensureUser(econ, user.id);

    const inv = u.inventory || {};
    const entries = Object.entries(inv);

    if (entries.length === 0) {
      return message.reply(`🎒 **${user.tag}** has nothing in their inventory.`);
    }

    const shop = getShopItems();
    const nameOf = (id) => shop.find((x) => x.id === id)?.name ?? id;

    const lines = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([id, qty]) => `${nameOf(id)} (${id}) — x${qty}`);

    await message.reply(`🎒 **${user.tag} Inventory**\n\`\`\`\n${lines.join("\n")}\n\`\`\``);
  },
};
