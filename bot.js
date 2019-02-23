const Discord = require('discord.js');
const Sequelize = require('sequelize');
const {prefix, token} = require("./config.json");

const client = new Discord.Client();

const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	operatorsAliases: false,
	storage: 'database.sqlite',
});

const Stickers = sequelize.define('stickers', {
	username: Sequelize.STRING,
	stickers: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
	sticker_appearance: {
		type: Sequelize.STRING,
		defaultValue: ":star:",
		allowNull: false,
	},
});

helpMessage = `Sticker Bot Commands:\n`; 
helpMessage += `   !s add - Gives you a sticker\n`;
helpMessage += `   !s remove - Takes away one of your stickers\n`;
helpMessage += `   !s count - Displays the number of stickers you have\n`;
helpMessage += `   !s view - View your lovely stickers!\n`;
helpMessage += `   !s customize :emoji: - Changes the appearance of your stickers\n`;
helpMessage += `   !s appearance - View your current sticker appearance\n`;
helpMessage += `   You can perform any of these commands on another user by mentioning them at the end\n`;

client.on("ready", () => {
	// Stickers.sync({ force: true });
});

client.on('message', async message => {
	if (message.author.bot || message.channel.type !== "text" || !message.guild) return;
  	if (message.content.startsWith(prefix)) {
    	let fullCommand = message.content.substr(3); // Remove the !s
		let splitCommand = fullCommand.split(" "); // Split the message up in to pieces for each space
		let primaryCommand = splitCommand[0]; // The first word directly after the exclamation is the command
		let args = splitCommand.slice(1); // All other words are arguments/parameters/options for the command
		let user = message.author.username; 
		
		// Determine if the command should be applied to the person who called it,
		// or a user passed as an argument
		if (message.mentions.members.first()) {
			user = message.mentions.members.first().user.username;
		}
		
		let record = await Stickers.findOne({ where: { username: user } });
		
		if (!record) {
			try {
				record = await Stickers.create({
					username: user,
				});
			} catch (e) {
				message.reply(`Error!`);
				return;
			}
		}
		
		switch (primaryCommand) {
			case "add":
				record.increment('stickers');
				message.channel.send(`${user} has earned a sticker!`);
				break;
			case "remove":
				if (record.stickers > 0) {
					record.decrement('stickers');
					message.channel.send(`${user} has lost a sticker!`);
				} else {
					message.channel.send(`${user} doesn't have any stickers to remove!`);
				}
				break;
			case "count":
				if (record.stickers == 0) {
					message.channel.send(`${user} doesn't have any stickers!`);
				} else if (record.stickers == 1) {
					message.channel.send(`${user} has one sticker!`);
				} else {
					message.channel.send(`${user} has ${record.stickers} stickers!`);
				}
				break;
			case "customize":
				var sticker = args[0];
				if (!sticker) {
					message.channel.send(`Invalid entry. Please try again.`);
					return;
				}
				const affectedRows = await Stickers.update({ sticker_appearance: args[0] }, { where: { username: user } });
				if (affectedRows > 0) {
					message.channel.send(`${user}'sstickers have been changed to ${args[0]}`);
				} else {
					message.channel.send(`Error! Sticker appearance was not changed.`);
				}
				break;
			case "appearance":
				message.channel.send(`${user}'s stickers look like this -> ${record.sticker_appearance}`);
				break;
			case "view":
				if (record.stickers == 0) {
					message.channel.send(`${user} has no stickers!`);
				} else {
					var expanded_stickers = "";
					for (var i = 0; i < record.stickers; i++) {
						expanded_stickers += record.sticker_appearance;
					}
					message.channel.send(`Viewing ${user}'s sticker chart!\n${expanded_stickers}`);
				}
				break;
			case "help":
				message.channel.send(helpMessage);
				break;
			case "ping":
				message.reply('Pong!');
				break;
			default:
				message.channel.send('Command not found.');
				break;
		} 
  	}
});

client.login(token);
