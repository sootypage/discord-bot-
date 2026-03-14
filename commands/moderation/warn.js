const { PermissionFlagsBits } = require("discord.js");
const { getConfig, saveConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "warn",
  category: "Moderation",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ You do not have permission to warn members.");
    }

    const user = message.mentions.users.first();
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    if (!user) return message.reply("❌ Mention a user to warn.");

    const cfg = getConfig(message.guild.id);
    cfg.warnings ||= {};
    cfg.warnings[user.id] ||= [];
    cfg.warnings[user.id].push({
      by: message.author.id,
      reason,
      at: Date.now(),
    });
    saveConfig(message.guild.id, cfg);

    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `⚠️ **Warn** — ${user.tag} (${user.id})\nBy: ${message.author.tag}\nReason: ${reason}\nTotal warnings: ${cfg.warnings[user.id].length}`,
    });

    await message.reply(`✅ Warned ${user.tag}. Total warnings: **${cfg.warnings[user.id].length}**`);
  },
};
