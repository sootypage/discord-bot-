const { EmbedBuilder } = require("discord.js");
const { readEconomy } = require("../../lib/economy");

module.exports = {
  name: "petstats",
  category: "Pets",
  aliases: ["pet", "mypet"],

  async execute(message) {
    const data = readEconomy(message.guild.id);
    const user = data.users?.[message.author.id];

    if (!user?.pet) return message.reply("❌ You do not have a pet.");

    const pet = user.pet;
    const nextLevelXp = (pet.level || 1) * 50;

    const embed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle(`🐾 ${message.author.username}'s Pet`)
      .addFields(
        { name: "Pet Type", value: String(pet.name || "Unknown"), inline: true },
        { name: "Status", value: pet.alive ? "Alive ✅" : "Dead 💀", inline: true },
        { name: "Level", value: String(pet.level || 1), inline: true },
        { name: "HP", value: `${pet.hp || 0}/${pet.maxHp || 100}`, inline: true },
        { name: "Food", value: `${pet.food || 0}/100`, inline: true },
        { name: "Water", value: `${pet.water || 0}/100`, inline: true },
        { name: "XP", value: `${pet.xp || 0}/${nextLevelXp}`, inline: true },
        { name: "Wins", value: String(pet.wins || 0), inline: true },
        { name: "Losses", value: String(pet.losses || 0), inline: true }
      );

    return message.reply({ embeds: [embed] });
  },
};
