const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "untimeout",
  category: "Moderation",
  aliases: ["unmute"],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
      return message.reply("❌ You do not have permission to remove timeouts.");
    }

    const user = message.mentions.users.first();
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    if (!user) return message.reply("❌ Mention a user to untimeout.");

    const member = await message.guild.members.fetch(user.id).catch(() => null);
    if (!member) return message.reply("❌ I can’t find that member.");
    if (!member.moderatable) return message.reply("❌ I can’t edit that user (role hierarchy / permissions).");

    await member.timeout(null, reason);

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `✅ **Untimeout** — ${user.tag} (${user.id})\nBy: ${message.author.tag}\nReason: ${reason}`,
    });

    await message.reply(`✅ Removed timeout from ${user.tag}`);
  },
};
