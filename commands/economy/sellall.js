const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "sellall",
  category: "Economy",

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users[message.author.id];

    if (!user || !user.inventory?.length)
      return message.reply("You have nothing to sell.");

    let total = 0;

    for (const item of user.inventory) {
      const shopItem = data.shop.find(i => i.name === item);
      if (shopItem) total += Math.floor(shopItem.price / 2);
    }

    user.inventory = [];
    user.balance += total;

    writeEconomy(message.guild.id, data);

    message.reply(`💰 Sold everything for **${total} coins**`);
  },
};
