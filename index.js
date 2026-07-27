const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";
const TOKEN = process.env.TOKEN;

let balances = {};

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "add") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ الإدارة فقط.");

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount))
      return message.reply("استعمل: !add @user 100");

    balances[user.id] = (balances[user.id] || 0) + amount;

    message.reply(`✅ تم إضافة ${amount} روبكس إلى ${user}`);
  }

  if (cmd === "bal") {
    const user = message.mentions.users.first() || message.author;
    message.reply(`💰 رصيد ${user} هو ${balances[user.id] || 0} روبكس`);
  }
});

client.login(TOKEN);
