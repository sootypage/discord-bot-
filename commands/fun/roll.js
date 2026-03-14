module.exports = {
  name: "roll",
  category: "Fun",
  aliases: [],

  async execute(message, args) {
    const max = Number(args[0] || 100);

    if (!Number.isInteger(max) || max < 1) {
      return message.reply("❌ Give a valid max number above 0.");
    }

    const result = Math.floor(Math.random() * max) + 1;
    await message.reply(`🎲 You rolled **${result}** (1-${max})`);
  },
};
