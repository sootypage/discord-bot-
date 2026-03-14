const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "unban",
  category: "Moderation",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply("❌ You do not have permission to unban members.");
    }

    const userId = String(args[0] || "");
    const reason = args.slice(1).join(" ").trim() || "No reason provided";

    if (!/^\d{17,20}$/.test(userId)) {
      return message.reply("❌ That doesn’t look like a valid user ID.");
    }

    await message.guild.members.unban(userId, reason);

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `✅ **Unban** — ${userId}\nBy: ${message.author.tag}\nReason: ${reason}`,
    });

    await message.reply(`✅ Unbanned **${userId}**`);
  },
};
