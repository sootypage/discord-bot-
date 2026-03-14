const { readEcon, writeEcon, ensureUser } = require("../../lib/economy");

module.exports = {
  name: "petwater",
  category: "Pets",
  aliases: ["petdrink"],

  async execute(message) {
    const data = readEcon(message.guild.id);
    const u = ensureUser(data, message.author.id);

    if (!u.pet) return message.reply("❌ You do not have a pet.");
    if (!u.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    u.pet.water = Math.min(100, (u.pet.water || 0) + 25);
    u.pet.hp = Math.min(u.pet.maxHp || 100, (u.pet.hp || 0) + 5);
    u.pet.xp = (u.pet.xp || 0) + 5;

    writeEcon(message.guild.id, data);

    return message.reply(
      `💧 You gave water to your **${u.pet.type}**.\nWater: **${u.pet.water}/100**\nHP: **${u.pet.hp}/${u.pet.maxHp}**`
    );
  },
};
