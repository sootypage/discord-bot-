const { readEconomy } = require("../../lib/economy");

module.exports = {
  name: "networth",
  category: "Economy",

  async execute(message) {
    const user = message.mentions.users.first() || message.author;

    const data = readEconomy(message.guild.id);

    const u = data.users[user.id];

    if (!u) return message.reply("No data.");

    const worth = u.balance + (u.bank || 0);

    message.reply(`💰 **${user.username}** net worth: **${worth} coins**`);
  },
};
