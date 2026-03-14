const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "crime",
  category: "Economy",

  async execute(message) {
    const data = readEconomy(message.guild.id);

    if (!data.users[message.author.id])
      data.users[message.author.id] = { balance: 0 };

    const success = Math.random() < 0.5;

    if (success) {
      const money = Math.floor(Math.random() * 200);
      data.users[message.author.id].balance += money;
      message.reply(`💰 Crime success! You stole **${money} coins**`);
    } else {
      const loss = Math.floor(Math.random() * 100);
      data.users[message.author.id].balance -= loss;
      message.reply(`🚔 You got caught and paid **${loss} coins**`);
    }

    writeEconomy(message.guild.id, data);
  },
};
