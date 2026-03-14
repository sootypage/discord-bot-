const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "beg",
  category: "Economy",

  async execute(message) {
    const data = readEconomy(message.guild.id);

    const amount = Math.floor(Math.random() * 50) + 5;

    if (!data.users[message.author.id])
      data.users[message.author.id] = { balance: 0 };

    data.users[message.author.id].balance += amount;

    writeEconomy(message.guild.id, data);

    message.reply(`🥺 Someone gave you **${amount} coins**`);
  },
};
