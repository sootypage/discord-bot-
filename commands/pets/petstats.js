const { EmbedBuilder } = require("discord.js");
const {
  readPets,
  writePets,
  getUserPets,
  findPet,
  xpNeeded,
  damageForPet,
  DELETE_DEAD_AFTER_MS,
} = require("../../lib/pets");

module.exports = {
  name: "petstats",
  category: "Pets",
  aliases: ["pet", "mypet"],

  async execute(message, args) {
    const data = readPets(message.guild.id);
    const pets = getUserPets(data, message.author.id);

    if (!pets.length) {
      return message.reply("❌ You do not have any pets.");
    }

    let pet = null;
    const petId = args[0];
    if (petId) pet = findPet(data, message.author.id, petId);
    if (!pet) pet = pets[0];

    writePets(message.guild.id, data);

    let deathText = "Alive ✅";
    if (!pet.alive) {
      const remaining = Math.max(
        0,
        Math.ceil((DELETE_DEAD_AFTER_MS - (Date.now() - (pet.deadAt || 0))) / 1000)
      );
      deathText = `Dead 💀 (${remaining}s until deletion)`;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00b894)
      .setTitle(`🐾 ${pet.nickname}`)
      .setDescription(`Type: **${pet.type}**\nID: \`${pet.id}\``)
      .addFields(
        { name: "Status", value: deathText, inline: true },
        { name: "Level", value: String(pet.level), inline: true },
        { name: "XP", value: `${pet.xp}/${xpNeeded(pet.level)}`, inline: true },
        { name: "HP", value: `${pet.hp}/${pet.maxHp}`, inline: true },
        { name: "Food", value: `${pet.food}/100`, inline: true },
        { name: "Water", value: `${pet.water}/100`, inline: true },
        { name: "Damage", value: String(damageForPet(pet)), inline: true },
        { name: "Wins", value: String(pet.wins || 0), inline: true },
        { name: "Losses", value: String(pet.losses || 0), inline: true }
      );

    return message.reply({ embeds: [embed] });
  },
};
