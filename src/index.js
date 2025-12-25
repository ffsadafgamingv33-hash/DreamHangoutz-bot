const { Client, GatewayIntentBits, Collection, Partials, EmbedBuilder } = require('discord.js');
const Database = require('./database/db');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
client.cooldowns = new Collection();
client.db = new Database();

// Load redeem codes
const redeemCodes = require('./redeem_codes.json');
client.db.initializeRedeemCodes(redeemCodes);

const PREFIX = '+';

// Load commands from all command folders
const commandFolders = fs.readdirSync(path.join(__dirname, 'commands'));
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    if (command.name) {
      client.commands.set(command.name, command);
      if (command.aliases) {
        command.aliases.forEach(alias => client.commands.set(alias, command));
      }
    }
  }
}

// Track invites
client.invites = new Collection();

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} is online!`);
  console.log(`📊 Serving ${client.guilds.cache.size} servers`);
  
  // Cache invites for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      client.invites.set(guild.id, new Collection(invites.map(inv => [inv.code, inv.uses])));
    } catch (err) {
      console.log(`Could not fetch invites for ${guild.name}`);
    }
  }
  
  client.user.setActivity('+help | Ɗʀᴇᴀᴍ ୨୧ 卄ᴀɴɢᴏᴜᴛᴢ', { type: 3 });
});

// Handle new members for invite tracking
client.on('guildMemberAdd', async member => {
  try {
    const cachedInvites = client.invites.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();
    
    const usedInvite = newInvites.find(inv => {
      const cachedUses = cachedInvites?.get(inv.code) || 0;
      return inv.uses > cachedUses;
    });
    
    if (usedInvite) {
      client.db.addInvite(member.guild.id, usedInvite.inviterId, member.id, usedInvite.code);
    }
    
    client.invites.set(member.guild.id, new Collection(newInvites.map(inv => [inv.code, inv.uses])));
  } catch (err) {
    console.error('Error tracking invite:', err);
  }
});

// XP and message handling
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  
  // Award XP for chatting (with cooldown)
  const xpCooldownKey = `xp_${message.author.id}`;
  if (!client.cooldowns.has(xpCooldownKey)) {
    const xpGain = Math.floor(Math.random() * 10) + 5;
    const creditGain = Math.floor(Math.random() * 3) + 1;
    
    const levelUp = client.db.addXP(message.guild.id, message.author.id, xpGain);
    client.db.addCredits(message.guild.id, message.author.id, creditGain);
    
    if (levelUp) {
      const userData = client.db.getUser(message.guild.id, message.author.id);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎉 Level Up!')
        .setDescription(`Congratulations ${message.author}! You reached **Level ${userData.level}**!`)
        .setThumbnail(message.author.displayAvatarURL());
      message.channel.send({ embeds: [embed] }).catch(() => {});
    }
    
    client.cooldowns.set(xpCooldownKey, true);
    setTimeout(() => client.cooldowns.delete(xpCooldownKey), 60000);
  }
  
  // Command handling
  if (!message.content.startsWith(PREFIX)) return;
  
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.commands.get(commandName);
  if (!command) return;
  
  // Check permissions
  if (command.ownerOnly) {
    const settings = client.db.getGuildSettings(message.guild.id);
    if (message.author.id !== message.guild.ownerId && !settings?.owners?.includes(message.author.id)) {
      return message.reply('❌ This command is only for the server owner.');
    }
  }
  
  if (command.adminOnly) {
    if (!message.member.permissions.has('Administrator')) {
      return message.reply('❌ This command requires Administrator permissions.');
    }
  }
  
  if (command.modOnly) {
    if (!message.member.permissions.has('ManageMessages') && !message.member.permissions.has('Administrator')) {
      return message.reply('❌ This command requires Moderator permissions.');
    }
  }
  
  // Cooldown handling
  if (command.cooldown) {
    const cooldownKey = `${command.name}_${message.author.id}`;
    if (client.cooldowns.has(cooldownKey)) {
      const remaining = (client.cooldowns.get(cooldownKey) - Date.now()) / 1000;
      return message.reply(`⏰ Please wait ${remaining.toFixed(1)} seconds before using this command again.`);
    }
    client.cooldowns.set(cooldownKey, Date.now() + command.cooldown * 1000);
    setTimeout(() => client.cooldowns.delete(cooldownKey), command.cooldown * 1000);
  }
  
  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(`Error executing ${commandName}:`, error);
    message.reply('❌ There was an error executing that command.').catch(() => {});
  }
});

// Handle invite create/delete for tracking
client.on('inviteCreate', async invite => {
  const invites = client.invites.get(invite.guild.id) || new Collection();
  invites.set(invite.code, invite.uses);
  client.invites.set(invite.guild.id, invites);
});

client.on('inviteDelete', async invite => {
  const invites = client.invites.get(invite.guild.id);
  if (invites) {
    invites.delete(invite.code);
  }
});

const token = "BOT_TOKEN" ;
if (!token) {
  console.error('❌ DISCORD_BOT_TOKEN environment variable is not set!');
  process.exit(1);
}

client.login(token);
