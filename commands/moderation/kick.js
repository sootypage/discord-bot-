const { PermissionFlagsBits } = require("discord.js");
const { getConfig } = require("../../lib/config");
const { sendModLog } = require("../../lib/modlog");

module.exports = {
  name: "kick",
  category: "Moderation",
  aliases: [],

  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return message.reply("❌ You do not have permission to kick members.");
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply("❌ Mention a user to kick.");

    const reason = args.slice(1).join(" ").trim() || "No reason provided";
    const member = await message.guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return message.reply("❌ I can’t find that member in this server.");
    }
    if (!member.kickable) {
      return message.reply("❌ I can’t kick that user (role hierarchy / permissions).");
    }

    await member.kick(reason);

    const cfg = getConfig(message.guild.id);
    await sendModLog({
      guild: message.guild,
      channelId: cfg.modLogChannelId,
      content: `👢 **Kick** — ${user.tag} (${user.id})\nBy: ${message.author.tag}\nReason: ${reason}`,
    });

    await message.reply(`✅ Kicked ${user.tag}`);
  },
};
