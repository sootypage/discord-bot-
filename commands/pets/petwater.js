const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { readPets, writePets, getUserPets, findPet, addXp } = require("../../lib/pets");

module.exports = {
  name: "petwater",
  category: "Pets",
  aliases: ["petdrink"],

  async execute(message, args) {
    const data = readPets(message.guild.id);
    const pets = getUserPets(data, message.author.id);

    if (!pets.length) return message.reply("❌ You do not have any pets.");

    const petId = args[0];
    if (!petId) {
      const alivePets = pets.filter((p) => p.alive);
      if (!alivePets.length) return message.reply("❌ You have no alive pets.");

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`petwater:${message.author.id}`)
        .setPlaceholder("Choose a pet to give water")
        .addOptions(
          alivePets.slice(0, 25).map((p) => ({
            label: `${p.nickname} (${p.type})`,
            value: p.id,
            description: `Water ${p.water}/100 • HP ${p.hp}/${p.maxHp}`,
          }))
        );

      return message.reply({
        content: "💧 Choose a pet to water:",
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    const pet = findPet(data, message.author.id, petId);
    if (!pet) return message.reply("❌ Pet not found.");
    if (!pet.alive) return message.reply("💀 That pet is dead.");

    pet.water = Math.min(100, pet.water + 25);
    pet.hp = Math.min(pet.maxHp, pet.hp + 5);
    addXp(pet, 5);

    writePets(message.guild.id, data);
    return message.reply(`💧 Gave water to **${pet.nickname}**. Water: **${pet.water}/100**`);
  },
};
