const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const prefixes = ["+", "!"];
const TOKEN = process.env.TOKEN;

client.once("ready", () => {
  console.log(`${client.user.tag} is Online!`);
});

async function getBalance(userId) {
  const { data } = await supabase
    .from("balances")
    .select("balance")
    .eq("user_id", userId)
    .single();

  return data ? data.balance : 0;
}

async function setBalance(userId, balance) {
  await supabase
    .from("balances")
    .upsert({
      user_id: userId,
      balance: balance
    });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const prefix = prefixes.find(p => message.content.startsWith(p));
  if (!prefix) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

      // +add / !add
  if (cmd === "add") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ هذا الأمر للإدارة فقط.");

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount) || amount <= 0)
      return message.reply("استعمل: +add @user 100");

    const oldBalance = await getBalance(user.id);
    const newBalance = oldBalance + amount;

    await setBalance(user.id, newBalance);

    const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("✅ تمت الإضافة")
      .setDescription(
        `تم إضافة **${amount}** روبكس إلى ${user}\n\nالرصيد الجديد: **${newBalance}**`
      );

    return message.reply({ embeds: [embed] });
  }

  // +bal / !bal
  if (cmd === "bal") {
    const user = message.mentions.users.first() || message.author;

    const balance = await getBalance(user.id);

    const embed = new EmbedBuilder()
      .setColor("Blue")
      .setTitle("💰 الرصيد")
      .setDescription(`${user} يمتلك **${balance}** روبكس`);

    return message.reply({ embeds: [embed] });
                     }

            // +remove / !remove
  if (cmd === "remove") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ هذا الأمر للإدارة فقط.");

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user || isNaN(amount) || amount <= 0)
      return message.reply("استعمل: +remove @user 100");

    const oldBalance = await getBalance(user.id);
    const newBalance = Math.max(0, oldBalance - amount);

    await setBalance(user.id, newBalance);

    const embed = new EmbedBuilder()
      .setColor("Red")
      .setTitle("➖ تم الخصم")
      .setDescription(
        `تم خصم **${amount}** روبكس من ${user}\n\nالرصيد الجديد: **${newBalance}**`
      );

    return message.reply({ embeds: [embed] });
  }

  // +set / !set
  if (cmd === "set") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
      return message.reply("❌ هذا الأمر للإدارة فقط.");

    const user = message.mentions.users.first();
    const amount = parseInt(args[
