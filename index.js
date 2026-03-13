require("dotenv").config();

const fs = require("fs");

const path = require("path");

const {

  Client,

  GatewayIntentBits,

  Partials,

  Collection,

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

    const args = message.content

      .slice(PREFIX.length)

      .trim()

      .split(/\s+/);

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

// ---- Interaction router (tickets + help dropdown) ----

client.on("interactionCreate", async (interaction) => {

  try {

    if (interaction.isStringSelectMenu() || interaction.isButton()) {

      const handled = await handleTicketComponent(interaction);

      if (handled) return;

      if (

        interaction.isStringSelectMenu() &&

        interaction.customId === "help_category_select"

      ) {

        const category = interaction.values[0];

        const names = interaction.client.commandCategories.get(category) ?? [];

        const lines =

          names.map((n) => `${PREFIX}${n}`).join("\n") || "No commands.";

        return interaction.reply({

          content: `📂 **${category}** commands:\n\`\`\`\n${lines}\n\`\`\``,

          ephemeral: true,

        });

      }

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