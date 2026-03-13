const fs = require("fs");

const path = require("path");

function walkDir(dir) {

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const files = [];

  for (const entry of entries) {

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {

      files.push(...walkDir(full));

    } else if (entry.isFile() && entry.name.endsWith(".js")) {

      files.push(full);

    }

  }

  return files;

}

function loadCommands(commandsPath) {

  if (!fs.existsSync(commandsPath)) {

    fs.mkdirSync(commandsPath, { recursive: true });

  }

  const commandFiles = walkDir(commandsPath);

  const commands = new Map();

  const categories = new Map();

  for (const filePath of commandFiles) {

    try {

      delete require.cache[require.resolve(filePath)];

      const cmd = require(filePath);

      if (!cmd?.name || typeof cmd.execute !== "function") {

        console.warn(`⚠️ Skipping invalid command: ${path.relative(commandsPath, filePath)}`);

        continue;

      }

      const rel = path.relative(commandsPath, filePath).replaceAll("\\", "/");

      const parts = rel.split("/");

      const category = cmd.category || (parts.length >= 2 ? parts[0] : "other");

      cmd.category = category;

      cmd.name = String(cmd.name).toLowerCase();

      if (commands.has(cmd.name)) {

        console.warn(`⚠️ Duplicate command name "${cmd.name}" in ${rel} (skipping)`);

        continue;

      }

      commands.set(cmd.name, cmd);

      if (Array.isArray(cmd.aliases)) {

        for (const alias of cmd.aliases) {

          const aliasName = String(alias).toLowerCase();

          if (!commands.has(aliasName)) {

            commands.set(aliasName, cmd);

          }

        }

      }

      if (!categories.has(category)) {

        categories.set(category, []);

      }

      const arr = categories.get(category);

      if (!arr.includes(cmd.name)) {

        arr.push(cmd.name);

      }

    } catch (err) {

      console.error(`❌ Failed to load ${path.relative(commandsPath, filePath)}:`, err);

    }

  }

  for (const [cat, arr] of categories) {

    arr.sort();

  }

  return { commands, categories };

}

module.exports = { loadCommands };
