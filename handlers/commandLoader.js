const fs = require("fs");
const path = require("path");

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkDir(full));
    else if (e.isFile() && e.name.endsWith(".js")) files.push(full);
  }
  return files;
}

function loadCommands(commandsPath) {
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true });

  const commandFiles = walkDir(commandsPath);

  const commands = new Map();      // name -> command module
  const commandData = [];          // for registration
  const categories = new Map();    // category -> [commandName]

  for (const filePath of commandFiles) {
    try {
      delete require.cache[require.resolve(filePath)];
      const cmd = require(filePath);

      if (!cmd?.data?.name || typeof cmd.execute !== "function") {
        console.warn(`⚠️ Skipping invalid command: ${path.relative(commandsPath, filePath)}`);
        continue;
      }

      // category = first folder inside /commands
      const rel = path.relative(commandsPath, filePath).replaceAll("\\", "/");
      const parts = rel.split("/");
      const category = parts.length >= 2 ? parts[0] : "other";
      cmd.category = cmd.category ?? category;

      if (commands.has(cmd.data.name)) {
        console.warn(`⚠️ Duplicate command name "${cmd.data.name}" in ${rel} (skipping)`);
        continue;
      }

      commands.set(cmd.data.name, cmd);
      commandData.push(cmd.data.toJSON());

      if (!categories.has(cmd.category)) categories.set(cmd.category, []);
      categories.get(cmd.category).push(cmd.data.name);
    } catch (err) {
      console.error(`❌ Failed to load ${path.relative(commandsPath, filePath)}:`, err);
    }
  }

  for (const [cat, arr] of categories) arr.sort();

  return { commands, commandData, categories };
}

module.exports = { loadCommands };