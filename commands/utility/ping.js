module.exports = {
  name: "ping",
  category: "Basic",
  aliases: [],

  async execute(message) {
    await message.reply("🏓 Pong!");
  },
};
