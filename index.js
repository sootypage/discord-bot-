require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  InteractionType,
} = require("discord.js");

const { loadCommands } = require("./handlers/commandLoader");
const { handleTicketComponent } = require("./tickets/ticketComponents");

// Config (bad words)
const { getConfig } = require("./lib/config");

// Leveling
const { readLevels, writeLevels, ensureUser, xpNeeded } = require("./lib/leveling");

// ---- ENV checks ----
if (!process.env.DISCORD_TOKEN) throw new Error("Missing DISCORD_TOKEN in .env");
if (!process.env.CLIENT_ID) throw new Error("Missing CLIENT_ID in .env");
if (!/^\d{17,20}$/.test(process.env.CLIENT_ID)) {
  throw new Error("CLIENT_ID must be the numeric Application ID (a snowflake).");
}

const GUILD_ID = process.env.GUILD_ID;

// ---- Discord client ----
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,

    // Needed for badword filter + XP
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.GuildMember],
});

// ---- Load commands from /commands (recursive) ----
const COMMANDS_DIR = path.join(__dirname, "commands");
if (!fs.existsSync(COMMANDS_DIR)) fs.mkdirSync(COMMANDS_DIR, { recursive: true });

const { commands: commandMap, commandData, categories } = loadCommands(COMMANDS_DIR);

// expose to commands (used by /help dropdown)
client.commands = commandMap;
client.commandCategories = categories;

// ---- Register slash commands ----
async function registerCommands() {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  if (GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, GUILD_ID), {
      body: commandData,
    });
    console.log(`✅ Registered ${commandData.length} GUILD commands for ${GUILD_ID}`);
  } else {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commandData,
    });
    console.log(`✅ Registered ${commandData.length} GLOBAL commands (can take time to appear)`);
  }
}

// ---- Events ----
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`✅ Loaded ${commandMap.size} command files`);
});

function randInt(min, max) {
  const a = Number(min);
  const b = Number(max);
  const lo = Number.isFinite(a) ? a : 5;
  const hi = Number.isFinite(b) ? b : 20;
  const m = Math.min(lo, hi);
  const M = Math.max(lo, hi);
  return Math.floor(Math.random() * (M - m + 1)) + m;
}

// ---- Message handler: Badwords + XP ----
client.on("messageCreate", async (message) => {
  try {
    if (!message.guild) return;
    if (message.author.bot) return;

    // 1) BAD WORD FILTER
    const cfg = getConfig(message.guild.id);
    const list = Array.isArray(cfg.badWords) ? cfg.badWords : [];

    if (list.length && typeof message.content === "string" && message.content.length) {
      const content = message.content.toLowerCase();

      // simple contains match
      const hit = list.some((w) => {
        const word = String(w || "").trim().toLowerCase();
        return word && content.includes(word);
      });

      if (hit) {
        await message.delete().catch(() => {});
        // stop here; don't grant XP for badword messages
        return;
      }
    }

    // 2) XP SYSTEM (file-based, configurable)
    const data = readLevels(message.guild.id);

    // NEW structure: data.settings
    const settings = data.settings || {};
    const u = ensureUser(data, message.author.id);

    const now = Date.now();
    const cooldown = Number(settings.cooldownMs ?? 60000);

    if (now - u.lastMessage < cooldown) return;
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
      // Give XP roles (levelRoles: [{ level: 5, roleId: "..." }])
      const levelRoles = Array.isArray(settings.levelRoles) ? settings.levelRoles : [];
      if (levelRoles.length) {
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member) {
          const rolesToGive = levelRoles
            .filter((r) => Number(r.level) <= u.level && /^\d{17,20}$/.test(String(r.roleId || "")))
            .map((r) => String(r.roleId));

          for (const roleId of rolesToGive) {
            if (!member.roles.cache.has(roleId)) {
              await member.roles.add(roleId).catch(() => {});
            }
          }
        }
      }

      const levelChannelId = settings.levelChannelId;
      const channel =
        levelChannelId
          ? message.guild.channels.cache.get(levelChannelId)
          : message.channel;

      channel?.send(`🎉 ${message.author} leveled up to **Level ${u.level}**!`);
    }
  } catch (err) {
    console.error("❌ messageCreate (badwords/xp) error:", err);
  }
});

// ---- Interaction router ----
client.on("interactionCreate", async (interaction) => {
  try {
    // Slash commands
    if (interaction.type === InteractionType.ApplicationCommand && interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;

      try {
        await cmd.execute(interaction);
      } catch (err) {
        console.error(`❌ /${interaction.commandName} error:`, err);
        const msg = "❌ Error running that command.";
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
        } else {
          await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
        }
      }
      return;
    }

    // Tickets dropdown + close button
    if (interaction.isStringSelectMenu() || interaction.isButton()) {
      const handled = await handleTicketComponent(interaction);
      if (handled) return;

      // Help dropdown
      if (interaction.isStringSelectMenu() && interaction.customId === "help_category_select") {
        const category = interaction.values[0];
        const names = client.commandCategories.get(category) ?? [];
        const lines = names.map((n) => `/${n}`).join("\n") || "No commands.";

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

// ---- Start ----
(async () => {
  await registerCommands();
  await client.login(process.env.DISCORD_TOKEN);
})();