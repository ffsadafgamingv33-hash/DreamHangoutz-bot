const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  aliases: ['commands', 'h'],
  description: 'View all commands',
  async execute(message, args, client) {
    const categories = {
      economy: {
        emoji: '🛒',
        name: 'Shop & Credits',
        commands: [
          '+shop - View official shop link',
          '+buy <item_id> - Purchase items (earn redeem codes!)',
          '+balance - Check your credits',
          '+balancetop - View credit leaderboard',
          '+inventory - View purchase history',
          '+daily - Claim daily credits',
          '+wallet - View all currencies',
          '+transfer @user <amount> - Send credits to others',
          '+ltctransfer @user <amount> - Send LTC to others',
          '+$transfer @user <amount> - Send $ to others',
          '+deposit <ltc/$> <credits> - Convert credits to currency',
          '+withdraw <ltc/$> <amount> - Convert currency to credits',
          '+redeem <code> - Redeem codes for credits',
          '+redeemshop view - Buy redeem codes (10CR=50k | 100CR=500k | 1kCR=1M)',
          '+futureshop - Reserve credits for future purchases'
        ]
      },
      leveling: {
        emoji: '📊',
        name: 'Stats & Progress',
        commands: [
          '+level - Check your XP level',
          '+level_leaderboard - XP leaderboard',
          'Earn XP & credits by chatting!'
        ]
      },
      gambling: {
        emoji: '🎰',
        name: 'Gambling',
        commands: [
          '+gamblehelp - Gambling guide',
          '+roulette <amount> <color> - Play roulette',
          '+dice <amount> - Roll dice',
          '+slots <amount> - Play slots',
          '+coinflip <amount> <h/t> - Flip a coin',
          '+crash <amount> - Crash game',
          '+gamblestats - Your gambling stats',
          '+gambletop - Gambling leaderboard'
        ]
      },
      invites: {
        emoji: '📨',
        name: 'Invite Tracking',
        commands: [
          '+invites - Your invite stats',
          '+invited - Members you invited',
          '+inviteinfo <code> - Info on invite code'
        ]
      },
      crates: {
        emoji: '📦',
        name: 'Crates',
        commands: [
          '+crateinfo - View all crate information',
          '+mykeys - View your crate keys',
          '+buycratekey <type> - Buy a crate key',
          '+opencrate <type> - Open a crate'
        ]
      },
      moderation: {
        emoji: '⚙️',
        name: 'Moderation',
        commands: [
          '+warn <user> <reason> - Warn a user',
          '+unwarn <user> - Remove last warn',
          '+history <user> - Show moderation history',
          '+clearhistory <user> - Wipe history (Admin)',
          '+mute <user> <time> <reason> - Mute a user'
        ]
      },
      games: {
        emoji: '🎮',
        name: 'Games',
        commands: [
          '+hangman - Play Hangman game (50 credits)',
          '+uwu [@user] - Uwu someone!'
        ]
      },
      admin: {
        emoji: '🔧',
        name: 'Admin',
        commands: [
          '+shopsetup - Setup shop (Admin)',
          '+addcred @user <amount> - Add credits (Admin)',
          '+removecred @user <amount> - Remove credits (Admin)',
          '+givedollar @user <amount> - Give $ (Owner)',
          '+giveltc @user <amount> - Give LTC Ł (Owner)',
          '+wl_vip <user> - Whitelist VIP (Admin)',
          '+unwl_vip <user> - Remove VIP whitelist (Admin)',
          '+list_wl_vip - List VIP whitelist (Admin)'
        ]
      },
      utility: {
        emoji: '❓',
        name: 'Utility',
        commands: [
          '+avatar [@user] - View user avatar',
          '+help - Show this help menu',
          '+uwu [@user] - Send uwu message'
        ]
      }
    };
    
    if (!args[0]) {
      const embed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle(' Ɗʀᴇᴀᴍ ୨୧ 卄ᴀɴɢᴏᴜᴛᴢ help menu ')
        .setDescription('Here are all the available command categories:')
        .addFields(
          Object.entries(categories).map(([key, cat]) => ({
            name: `${cat.emoji} ${cat.name}`,
            value: `\`+help ${key}\``,
            inline: true
          }))
        )
        .addFields({ 
          name: '💡 How to Earn Credits', 
          value: '• Chat in channels = XP & credits\n• Use +daily every 24h\n• Stay active for faster growth',
          inline: false 
        })
        .setFooter({ text: 'Use +help <category> for more info' })
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }
    
    const category = categories[args[0].toLowerCase()];
    if (!category) {
      return message.reply('❌ Invalid category! Use `+help` to see all categories.');
    }
    
    const embed = new EmbedBuilder()
      .setColor('#9B59B6')
      .setTitle(`${category.emoji} ${category.name} Commands`)
      .setDescription(category.commands.map(cmd => `• ${cmd}`).join('\n'))
      .setFooter({ text: 'Use +help to see all categories' })
      .setTimestamp();
    
    message.reply({ embeds: [embed] });
  }
};
