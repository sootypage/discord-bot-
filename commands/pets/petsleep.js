const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");
const { readPets, writePets, getUserPets, findPet, addXp } = require("../../lib/pets");

module.exports = {
  name: "petsleep",
  category: "Pets",
  aliases: ["petrest"],

  async execute(message, args) {
    const data = readPets(message.guild.id);
    const pets = getUserPets(data, message.author.id);

    if (!pets.length) return message.reply("❌ You do not have any pets.");

    const petId = args[0];
    if (!petId) {
      const alivePets = pets.filter((p) => p.alive);
      if (!alivePets.length) return message.reply("❌ You have no alive pets.");

      const menu = new StringSelectMenuBuilder()
        .setCustomId(`petsleep:${message.author.id}`)
        .setPlaceholder("Choose a pet to sleep")
        .addOptions(
          alivePets.slice(0, 25).map((p) => ({
            label: `${p.nickname} (${p.type})`,
            value: p.id,
            description: `HP ${p.hp}/${p.maxHp}`,
          }))
        );

      return message.reply({
        content: "😴 Choose a pet to sleep:",
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    const pet = findPet(data, message.author.id, petId);
    if (!pet) return message.reply("❌ Pet not found.");
    if (!pet.alive) return message.reply("💀 That pet is dead.");

    const now = Date.now();
    const cooldown = 60 * 60 * 1000;
    if (now - (pet.lastSleep || 0) < cooldown) {
      const mins = Math.ceil((cooldown - (now - pet.lastSleep)) / 60000);
      return message.reply(`😴 ${pet.nickname} is not tired yet. Try again in **${mins} min**.`);
    }

    pet.lastSleep = now;
    pet.hp = Math.min(pet.maxHp, pet.hp + 20);
    pet.food = Math.max(0, pet.food - 10);
    pet.water = Math.max(0, pet.water - 10);
    addXp(pet, 10);

    writePets(message.guild.id, data);
    return message.reply(`😴 **${pet.nickname}** slept and now has **${pet.hp}/${pet.maxHp} HP**.`);
  },
};
