const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "petwater",
  category: "Pets",
  aliases: ["petdrink"],

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users?.[message.author.id];

    if (!user?.pet) return message.reply("❌ You do not have a pet.");
    if (!user.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    user.pet.water = Math.min(100, (user.pet.water || 0) + 25);
    user.pet.hp = Math.min(user.pet.maxHp || 100, (user.pet.hp || 0) + 5);
    user.pet.xp = (user.pet.xp || 0) + 5;

    writeEconomy(message.guild.id, data);

    return message.reply(
      `💧 You gave water to your **${user.pet.name}**.\nWater: **${user.pet.water}/100**\nHP: **${user.pet.hp}/${user.pet.maxHp}**`
    );
  },
};
