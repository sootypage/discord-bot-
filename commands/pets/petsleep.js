const { readEconomy, writeEconomy } = require("../../lib/economy");

module.exports = {
  name: "petsleep",
  category: "Pets",
  aliases: ["petsrest", "petrest"],

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users?.[message.author.id];

    if (!user?.pet) return message.reply("❌ You do not have a pet.");
    if (!user.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    const now = Date.now();
    const cooldown = 60 * 60 * 1000; // 1 hour
    const lastSleep = Number(user.pet.lastSleep || 0);

    if (now - lastSleep < cooldown) {
      const mins = Math.ceil((cooldown - (now - lastSleep)) / 60000);
      return message.reply(`😴 Your pet is not tired yet. Try again in **${mins} min**.`);
    }

    user.pet.lastSleep = now;
    user.pet.hp = Math.min(user.pet.maxHp || 100, (user.pet.hp || 0) + 20);
    user.pet.food = Math.max(0, (user.pet.food || 0) - 10);
    user.pet.water = Math.max(0, (user.pet.water || 0) - 10);
    user.pet.xp = (user.pet.xp || 0) + 10;

    writeEconomy(message.guild.id, data);

    return message.reply(
      `😴 Your **${user.pet.name}** had a nice sleep.\nHP: **${user.pet.hp}/${user.pet.maxHp}**`
    );
  },
};
