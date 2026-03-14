require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
} = require("discord.js");

const { handleTicketComponent } = require("./tickets/ticketComponents");

// Config (bad words)
const { getConfig } = require("./lib/config");

// Leveling
const {
  readLevels,
  writeLevels,
  ensureUser,
  xpNeeded,
} = require("./lib/leveling");

// Pets
const {
  readPets,
  writePets,
  findPet,
  getAlivePets,
  addXp,
  damageForPet,
  killPet,
} = require("./lib/pets");

// Economy
const {
  readEcon,
  writeEcon,
  ensureUser: ensureEconUser,
  formatMoney,
} = require("./lib/economy");

// ---- ENV checks ----
if (!process.env.DISCORD_TOKEN) {
  throw new Error("Missing DISCORD_TOKEN in .env");
}

const PREFIX = process.env.PREFIX || "!";

// ---- Discord client ----
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.GuildMember],
});

// ---- Load prefix commands from /commands (recursive) ----
client.commands = new Collection();
client.commandCategories = new Collection();

const COMMANDS_DIR = path.join(__dirname, "commands");
if (!fs.existsSync(COMMANDS_DIR)) {
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
}

function loadPrefixCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      loadPrefixCommands(fullPath);
      continue;
    }

    if (!file.name.endsWith(".js")) continue;

    try {
      delete require.cache[require.resolve(fullPath)];
      const cmd = require(fullPath);

      if (!cmd || typeof cmd !== "object") continue;

      if (!cmd.name || typeof cmd.execute !== "function") {
        console.warn(`⚠️ Skipped invalid command file: ${fullPath}`);
        continue;
      }

      const commandName = String(cmd.name).toLowerCase();
      client.commands.set(commandName, cmd);

      if (Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) {
          client.commands.set(String(alias).toLowerCase(), cmd);
        }
      }

      const category = cmd.category || "General";

      if (!client.commandCategories.has(category)) {
        client.commandCategories.set(category, []);
      }

      const current = client.commandCategories.get(category);
      if (!current.includes(commandName)) {
        current.push(commandName);
      }
    } catch (err) {
      console.error(`❌ Failed to load command file ${fullPath}:`, err);
    }
  }
}

loadPrefixCommands(COMMANDS_DIR);

// ---- Ready ----
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`✅ Loaded ${client.commands.size} command entries`);
  console.log(`✅ Prefix is ${PREFIX}`);
});

// ---- Helper ----
function randInt(min, max) {
  const a = Number(min);
  const b = Number(max);
  const lo = Number.isFinite(a) ? a : 5;
  const hi = Number.isFinite(b) ? b : 20;
  const m = Math.min(lo, hi);
  const M = Math.max(lo, hi);
  return Math.floor(Math.random() * (M - m + 1)) + m;
}

// ---- Message handler: Badwords + XP + Prefix Commands ----
client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;

    // 1) BAD WORD FILTER
    const cfg = getConfig(message.guild.id);
    const list = Array.isArray(cfg.badWords) ? cfg.badWords : [];

    if (
      list.length &&
      typeof message.content === "string" &&
      message.content.length
    ) {
      const content = message.content.toLowerCase();

      const hit = list.some((w) => {
        const word = String(w || "").trim().toLowerCase();
        return word && content.includes(word);
      });

      if (hit) {
        await message.delete().catch(() => {});
        return;
      }
    }

    // 2) XP SYSTEM
    const data = readLevels(message.guild.id);
    const settings = data.settings || {};
    const u = ensureUser(data, message.author.id);

    const now = Date.now();
    const cooldown = Number(settings.cooldownMs ?? 60000);

    if (now - u.lastMessage >= cooldown) {
      u.lastMessage = now;

      const gained = randInt(settings.xpMin ?? 5, settings.xpMax ?? 20);
      u.xp += gained;

      let leveledUp = false;

      while (u.xp >= xpNeeded(u.level)) {
        u.xp -= xpNeeded(u.level);
        u.level++;
        leveledUp = true;
      }

      writeLevels(message.guild.id, data);

      if (leveledUp) {
        const levelRoles = Array.isArray(settings.levelRoles)
          ? settings.levelRoles
          : [];

        if (levelRoles.length) {
          const member = await message.guild.members
            .fetch(message.author.id)
            .catch(() => null);

          if (member) {
            const rolesToGive = levelRoles
              .filter(
                (r) =>
                  Number(r.level) <= u.level &&
                  /^\d{17,20}$/.test(String(r.roleId || ""))
              )
              .map((r) => String(r.roleId));

            for (const roleId of rolesToGive) {
              if (!member.roles.cache.has(roleId)) {
                await member.roles.add(roleId).catch(() => {});
              }
            }
          }
        }

        const levelChannelId = settings.levelChannelId;
        const channel = levelChannelId
          ? message.guild.channels.cache.get(levelChannelId)
          : message.channel;

        channel
          ?.send(`🎉 ${message.author} leveled up to **Level ${u.level}**!`)
          .catch(() => {});
      }
    }

    // 3) PREFIX COMMANDS
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = (args.shift() || "").toLowerCase();

    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`❌ ${PREFIX}${commandName} error:`, err);
      await message.reply("❌ Error running that command.").catch(() => {});
    }
  } catch (err) {
    console.error("❌ messageCreate error:", err);
  }
});

// ---- Interaction router (tickets + help dropdown + pet dropdowns) ----
client.on("interactionCreate", async (interaction) => {
  try {
    if (!(interaction.isStringSelectMenu() || interaction.isButton())) return;

    const handled = await handleTicketComponent(interaction);
    if (handled) return;

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "help_category_select"
    ) {
      const category = interaction.values[0];
      const names = interaction.client.commandCategories.get(category) ?? [];
      const lines = names.map((n) => `${PREFIX}${n}`).join("\n") || "No commands.";

      return interaction.reply({
        content: `📂 **${category}** commands:\n\`\`\`\n${lines}\n\`\`\``,
        ephemeral: true,
      });
    }

    if (!interaction.isStringSelectMenu()) return;

    const parts = String(interaction.customId || "").split(":");
    const action = parts[0];
    const ownerId = parts[1];
    const extraId = parts[2];

    if (!ownerId) return;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: "❌ That dropdown is not for you.",
        ephemeral: true,
      });
    }

    const selectedPetId = interaction.values[0];

    // ---- petfeed dropdown ----
    if (action === "petfeed") {
      const data = readPets(interaction.guild.id);
      const pet = findPet(data, interaction.user.id, selectedPetId);

      if (!pet || !pet.alive) {
        return interaction.reply({
          content: "❌ Pet not found or dead.",
          ephemeral: true,
        });
      }

      pet.food = Math.min(100, Number(pet.food || 0) + 25);
      pet.hp = Math.min(Number(pet.maxHp || 100), Number(pet.hp || 0) + 5);
      addXp(pet, 5);

      writePets(interaction.guild.id, data);

      return interaction.reply({
        content: `🍖 Fed **${pet.nickname}**. Food: **${pet.food}/100** | HP: **${pet.hp}/${pet.maxHp}**`,
        ephemeral: true,
      });
    }

    // ---- petwater dropdown ----
    if (action === "petwater") {
      const data = readPets(interaction.guild.id);
      const pet = findPet(data, interaction.user.id, selectedPetId);

      if (!pet || !pet.alive) {
        return interaction.reply({
          content: "❌ Pet not found or dead.",
          ephemeral: true,
        });
      }

      pet.water = Math.min(100, Number(pet.water || 0) + 25);
      pet.hp = Math.min(Number(pet.maxHp || 100), Number(pet.hp || 0) + 5);
      addXp(pet, 5);

      writePets(interaction.guild.id, data);

      return interaction.reply({
        content: `💧 Gave water to **${pet.nickname}**. Water: **${pet.water}/100** | HP: **${pet.hp}/${pet.maxHp}**`,
        ephemeral: true,
      });
    }

    // ---- petsleep dropdown ----
    if (action === "petsleep") {
      const data = readPets(interaction.guild.id);
      const pet = findPet(data, interaction.user.id, selectedPetId);

      if (!pet || !pet.alive) {
        return interaction.reply({
          content: "❌ Pet not found or dead.",
          ephemeral: true,
        });
      }

      const now = Date.now();
      const cooldown = 60 * 60 * 1000;

      if (now - Number(pet.lastSleep || 0) < cooldown) {
        const mins = Math.ceil((cooldown - (now - Number(pet.lastSleep || 0))) / 60000);
        return interaction.reply({
          content: `😴 ${pet.nickname} is not tired yet. Try again in **${mins} min**.`,
          ephemeral: true,
        });
      }

      pet.lastSleep = now;
      pet.hp = Math.min(Number(pet.maxHp || 100), Number(pet.hp || 0) + 20);
      pet.food = Math.max(0, Number(pet.food || 0) - 10);
      pet.water = Math.max(0, Number(pet.water || 0) - 10);
      addXp(pet, 10);

      writePets(interaction.guild.id, data);

      return interaction.reply({
        content: `😴 **${pet.nickname}** slept and now has **${pet.hp}/${pet.maxHp} HP**.`,
        ephemeral: true,
      });
    }

    // ---- petrevive dropdown ----
    if (action === "petrevive") {
      const data = readPets(interaction.guild.id);
      const pet = findPet(data, interaction.user.id, selectedPetId);

      if (!pet) {
        return interaction.reply({
          content: "❌ Pet not found.",
          ephemeral: true,
        });
      }

      if (pet.alive) {
        return interaction.reply({
          content: "✅ That pet is already alive.",
          ephemeral: true,
        });
      }

      const econ = readEcon(interaction.guild.id);
      const u = ensureEconUser(econ, interaction.user.id);
      const cost = 250;

      if (u.wallet < cost) {
        return interaction.reply({
          content: `❌ You need **$${formatMoney(cost)}** to revive that pet.`,
          ephemeral: true,
        });
      }

      u.wallet -= cost;
      pet.alive = true;
      pet.deadAt = 0;
      pet.hp = Math.max(25, Math.floor(Number(pet.maxHp || 100) / 2));
      pet.food = Math.max(25, Number(pet.food || 0));
      pet.water = Math.max(25, Number(pet.water || 0));

      writeEcon(interaction.guild.id, econ);
      writePets(interaction.guild.id, data);

      return interaction.reply({
        content: `✨ Revived **${pet.nickname}** for **$${formatMoney(cost)}**.`,
        ephemeral: true,
      });
    }

    // ---- petbattle dropdown ----
    if (action === "petbattle") {
      const targetId = extraId;
      const data = readPets(interaction.guild.id);

      const yourPet = findPet(data, interaction.user.id, selectedPetId);
      const enemyPet = getAlivePets(data, targetId)[0] || null;

      if (!yourPet || !yourPet.alive) {
        return interaction.reply({
          content: "❌ Pet not found or dead.",
          ephemeral: true,
        });
      }

      if (!enemyPet) {
        return interaction.reply({
          content: "❌ That user has no alive pets.",
          ephemeral: true,
        });
      }

      let attackerHp = Number(yourPet.hp || 0);
      let defenderHp = Number(enemyPet.hp || 0);

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
        yourPet.wins = Number(yourPet.wins || 0) + 1;
        enemyPet.losses = Number(enemyPet.losses || 0) + 1;
        addXp(yourPet, 25);
      } else if (winner === "defender") {
        enemyPet.wins = Number(enemyPet.wins || 0) + 1;
        yourPet.losses = Number(yourPet.losses || 0) + 1;
        addXp(enemyPet, 25);
      }

      writePets(interaction.guild.id, data);

      const embed = new EmbedBuilder()
        .setColor(winner === "attacker" ? 0x2ecc71 : 0xe74c3c)
        .setTitle("⚔️ Pet Battle")
        .setDescription(
          `**${interaction.user.username}** used **${yourPet.nickname}**\n` +
          `Enemy pet: **${enemyPet.nickname}**`
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
            value: rounds.slice(0, 10).join("\n").slice(0, 1024) || "No battle log.",
          }
        );

      return interaction.reply({
        embeds: [embed],
        ephemeral: true,
      });
    }
  } catch (err) {
    console.error("❌ interactionCreate router error:", err);
  }
});

// ---- Extra error handling ----
client.on("error", (err) => {
  console.error("❌ Client error:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught exception:", err);
});

// ---- Start ----
(async () => {
  await client.login(process.env.DISCORD_TOKEN);
})();
