const { REST, Routes, PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "clear-slash",
  category: "Admin",
  aliases: ["clearslash", "removeslash"],

  async execute(message) {
    if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return message.reply("❌ You must be an administrator to use this command.");
    }

    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;

    if (!token || !clientId) {
      return message.reply("❌ CLIENT_ID or DISCORD_TOKEN missing in .env");
    }

    const rest = new REST({ version: "10" }).setToken(token);

    try {
      if (guildId) {
        await rest.put(
          Routes.applicationGuildCommands(clientId, guildId),
          { body: [] }
        );
      }

      await rest.put(Routes.applicationCommands(clientId), { body: [] });

      await message.reply("✅ Cleared registered slash commands.");
      console.log("✅ Slash commands cleared.");
    } catch (err) {
      console.error(err);
      await message.reply("❌ Failed to clear slash commands.");
    }
  },
};
