const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const {
  readPets,
  writePets,
  getAlivePets,
  findPet,
  addXp,
  damageForPet,
  killPet,
} = require("../../lib/pets");

module.exports = {
  name: "petbattle",
  category: "Pets",
  aliases: ["petfight", "petbuttle"],

  async execute(message, args) {
    const target = message.mentions.users.first();
    if (!target) return message.reply("Usage: `!petbattle @user [yourPetId]`");
    if (target.id === message.author.id) return message.reply("❌ You cannot battle yourself.");

    const data = readPets(message.guild.id);
    const yourAlivePets = getAlivePets(data, message.author.id);
    const enemyPet = getAlivePets(data, target.id)[0] || null;

    if (!yourAlivePets.length) return message.reply("❌ You have no alive pets.");
    if (!enemyPet) return message.reply("❌ That user has no alive pets.");

    const yourPetId = args.find((a) => !a.startsWith("<@"));
    if (!yourPetId) {
      const menu = new StringSelectMenuBuilder()
        .setCustomId(`petbattle:${message.author.id}:${target.id}`)
        .setPlaceholder("Choose your pet")
        .addOptions(
          yourAlivePets.slice(0, 25).map((p) => ({
            label: `${p.nickname} (${p.type})`,
            value: p.id,
            description: `Lvl ${p.level} • HP ${p.hp}/${p.maxHp} • DMG ${damageForPet(p)}`,
          }))
        );

      return message.reply({
        content: `⚔️ Choose a pet to battle **${target.username}**.`,
        components: [new ActionRowBuilder().addComponents(menu)],
      });
    }

    const yourPet = findPet(data, message.author.id, yourPetId);
    if (!yourPet || !yourPet.alive) {
      return message.reply("❌ That pet was not found or is dead.");
    }

    let attackerHp = yourPet.hp;
    let defenderHp = enemyPet.hp;

    const attackerDamage = damageForPet(yourPet);
    const defenderDamage = damageForPet(enemyPet);

    const rounds = [];
    let winner = null;

    for (let i = 1; i <= 10; i++) {
      const hit1 = attackerDamage + Math.floor(Math.random() * 6);
      defenderHp -= hit1;
      rounds.push(`**Round ${i}** — ${yourPet.nickname} hits **${enemyPet.nickname}** for **${hit1}**`);

      if (defenderHp <= 0) {
        winner = "attacker";
        break;
      }

      const hit2 = defenderDamage + Math.floor(Math.random() * 6);
      attackerHp -= hit2;
      rounds.push(`**Round ${i}** — ${enemyPet.nickname} hits **${yourPet.nickname}** for **${hit2}**`);

      if (attackerHp <= 0) {
        winner = "defender";
        break;
      }
    }

    yourPet.hp = Math.max(0, attackerHp);
    enemyPet.hp = Math.max(0, defenderHp);

    if (yourPet.hp <= 0) killPet(yourPet);
    if (enemyPet.hp <= 0) killPet(enemyPet);

    if (winner === "attacker") {
      yourPet.wins++;
      enemyPet.losses++;
      addXp(yourPet, 25);
    } else if (winner === "defender") {
      enemyPet.wins++;
      yourPet.losses++;
      addXp(enemyPet, 25);
    }

    writePets(message.guild.id, data);

    const embed = new EmbedBuilder()
      .setColor(winner === "attacker" ? 0x2ecc71 : 0xe74c3c)
      .setTitle("⚔️ Pet Battle")
      .setDescription(
        `**${message.author.username}** used **${yourPet.nickname}**\n` +
        `**${target.username}** defended with **${enemyPet.nickname}**`
      )
      .addFields(
        {
          name: "Result",
          value:
            winner === "attacker"
              ? `🏆 **${yourPet.nickname}** won`
              : winner === "defender"
              ? `💀 **${enemyPet.nickname}** won`
              : "Draw",
        },
        {
          name: "Final HP",
          value:
            `${yourPet.nickname}: **${yourPet.hp}/${yourPet.maxHp}**\n` +
            `${enemyPet.nickname}: **${enemyPet.hp}/${enemyPet.maxHp}**`,
        },
        {
          name: "Battle Log",
          value: rounds.slice(0, 10).join("\n").slice(0, 1024),
        }
      );

    return message.reply({ embeds: [embed] });
  },
};
