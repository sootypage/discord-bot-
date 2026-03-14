const { readEcon, writeEcon, ensureUser } = require("../../lib/economy");

module.exports = {
  name: "petfeed",
  category: "Pets",
  aliases: [],

  async execute(message) {
    const data = readEcon(message.guild.id);
    const u = ensureUser(data, message.author.id);

    if (!u.pet) return message.reply("❌ You do not have a pet.");
    if (!u.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    u.pet.food = Math.min(100, (u.pet.food || 0) + 25);
    u.pet.hp = Math.min(u.pet.maxHp || 100, (u.pet.hp || 0) + 5);
    u.pet.xp = (u.pet.xp || 0) + 5;

    writeEcon(message.guild.id, data);

    return message.reply(
      `🍖 You fed your **${u.pet.type}**.\nFood: **${u.pet.food}/100**\nHP: **${u.pet.hp}/${u.pet.maxHp}**`
    );
  },
};
