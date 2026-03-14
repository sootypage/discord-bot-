const { readEcon, writeEcon, ensureUser } = require("../../lib/economy");

module.exports = {
  name: "petsleep",
  category: "Pets",
  aliases: ["petrest"],

  async execute(message) {
    const data = readEcon(message.guild.id);
    const u = ensureUser(data, message.author.id);

    if (!u.pet) return message.reply("❌ You do not have a pet.");
    if (!u.pet.alive) return message.reply("💀 Your pet is dead. Use `!petrevive`.");

    const now = Date.now();
    const cooldown = 60 * 60 * 1000;
    const lastSleep = Number(u.pet.lastSleep || 0);

    if (now - lastSleep < cooldown) {
      const mins = Math.ceil((cooldown - (now - lastSleep)) / 60000);
      return message.reply(`😴 Your pet is not tired yet. Try again in **${mins} min**.`);
    }

    u.pet.lastSleep = now;
    u.pet.hp = Math.min(u.pet.maxHp || 100, (u.pet.hp || 0) + 20);
    u.pet.food = Math.max(0, (u.pet.food || 0) - 10);
    u.pet.water = Math.max(0, (u.pet.water || 0) - 10);
    u.pet.xp = (u.pet.xp || 0) + 10;

    writeEcon(message.guild.id, data);

    return message.reply(
      `😴 Your **${u.pet.type}** had a nice sleep.\nHP: **${u.pet.hp}/${u.pet.maxHp}**`
    );
  },
};
