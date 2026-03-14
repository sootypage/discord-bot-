const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "rob",
  category: "Economy",

  async execute(message) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Mention someone to rob.");

    const data = readEconomy(message.guild.id);

    const victim = data.users[target.id];
    const robber = data.users[message.author.id];

    if (!victim || victim.balance < 50)
      return message.reply("Target too poor.");

    const success = Math.random() < 0.5;

    if (success) {
      const amount = Math.floor(victim.balance * 0.2);
      victim.balance -= amount;
      robber.balance += amount;

      message.reply(`💰 You robbed **${amount} coins**`);
    } else {
      message.reply("🚔 Robbery failed!");
    }

    writeEconomy(message.guild.id, data);
  },
};
