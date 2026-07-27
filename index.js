const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN;

// يدعم + و !
const prefixes = ["+", "!"];

let balances = {};

client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  const prefix = prefixes.find(p => message.content.startsWith(p));
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  // +add أو !add
  if (cmd === "add") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ هذا الأمر للإدارة فقط.");

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount))
      return message.reply("استخدم: +add @user 100");

    balances[user.id] = (balances[user.id] || 0) + amount;

    message.reply(`✅ تم إضافة ${amount} روبكس إلى ${user}`);
  }

  // +bal أو !bal
  if (cmd === "bal") {
    const user = message.mentions.users.first() || message.author;
    const balance = balances[user.id] || 0;

    message.reply(`💰 رصيد ${user} هو ${balance} روبكس`);
  }
});

client.login(TOKEN);
