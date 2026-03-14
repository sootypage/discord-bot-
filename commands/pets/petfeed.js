const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "petfeed",
  category: "Pets",
  aliases: [],

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users?.[message.author.id];

    if (!user?.pet) return message.reply("❌ You do not have a pet.");
    if (!user.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    user.pet.food = Math.min(100, (user.pet.food || 0) + 25);
    user.pet.hp = Math.min(user.pet.maxHp || 100, (user.pet.hp || 0) + 5);
    user.pet.xp = (user.pet.xp || 0) + 5;

    writeEconomy(message.guild.id, data);

    return message.reply(
      `🍖 You fed your **${user.pet.name}**.\nFood: **${user.pet.food}/100**\nHP: **${user.pet.hp}/${user.pet.maxHp}**`
    );
  },
};
