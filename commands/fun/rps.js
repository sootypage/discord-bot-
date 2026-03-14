module.exports = {
  name: "rps",
  category: "Fun",
  aliases: ["rockpaperscissors"],

  async execute(message, args) {
    const userChoice = String(args[0] || "").toLowerCase();
    const choices = ["rock", "paper", "scissors"];

    if (!choices.includes(userChoice)) {
      return message.reply("❌ Choose `rock`, `paper`, or `scissors`.");
    }

    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result = "It's a tie!";
    if (
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper")
    ) {
      result = "You win!";
    } else if (userChoice !== botChoice) {
      result = "You lose!";
    }

    await message.reply(
      `You chose **${userChoice}**\nI chose **${botChoice}**\n\n${result}`
    );
  },
};
