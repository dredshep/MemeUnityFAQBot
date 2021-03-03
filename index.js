const { Telegraf } = require('telegraf');
const conf = require('sharon-storage');
const { token } = require('./secrets.json');
const bot = new Telegraf(token);
bot.command('add', ctx => {
	ctx.reply(`Send a reply to >this message< with the following structure:

/my_custom_command - Command description
The text you want me to reply with.

It can be multiline, or be formatted with html.`);
});
const validateText = (text) => text.startsWith('/') &&
	text.split(' ')?.[1] === "-" &&
	text.split('\n').length > 1;
const addResponse = (text, confirmed) => {
	const pushIt = (commandObject) => {
		const stringified = JSON.stringify(commandObject, null, 2);
		conf.set("commands." + commandObject.command, { response: commandObject.response, description: commandObject.description });
		setCommands();
	};
	if (validateText(text)) {
		const commandLine = text.split(' - ');
		const command = commandLine[0];
		const secondPart = commandLine[1].split('\n');
		const description = secondPart[0];
		const response = secondPart.slice(1).join('\n');
		const commandObject = { command, description, response };
		const existingCommand = conf.get("commands." + command);
		if (existingCommand && !confirmed)
			return { ok: false, exists: true, command };
		pushIt(commandObject);
		return { ok: true, command };
	}
	return { ok: false, invalid: true };
};
const isArray = (arr) => Array.isArray(arr);
const hasStuff = (arr) => isArray(arr) && arr.length > 0;

const listOfAdmins = conf.get('admins')
if (!hasStuff || !listOfAdmins.includes(1615985312)) conf.set('admins', [1615985312])

const isAdmin = (id) => {
	const admins = conf.get('admins');
	return hasStuff(admins) && admins.includes(id);
};

const isEditor = (id) => {
	const editors = conf.get('editors');
	return hasStuff(editors) && editors.includes(id);
};

const setCommands = () => {
	const commandObject = conf.get('commands');
	if (commandObject) {
		const commands = Object.keys(commandObject);
		const BotCommandArray = commands.map(command => {
      if (commandObject?.[command] !== null) {
				const { description } = commandObject[command];
				return { command, description };
			}
		}).filter(x => x);
    BotCommandArray.push({command: "help", description: "Get a list of all available commands."})
    BotCommandArray.push({command: "add", description: "Add a new command/response to the bot."})
    BotCommandArray.push({command: "authorize", description: "Gives the right to modify the bot's admins and editors."})
    BotCommandArray.push({command: "editor", description: "Gives the right to modify the bot's command/response sets."})
		bot.telegram.setMyCommands(BotCommandArray).catch(console.error);
	}
};



bot.command('help', ctx => {
  ctx.reply(`/add - Add a new command/response to the bot.
/delete_your_command - deletes a command called /your_command (use it to delete any custom command)

/user_id gives you your ID. If used as a response, it gives you the replied-to person's ID.
/chat_id gives you the curren chat's ID. If used in private messages, it's your own ID.

/editor ID - Make someone an editor by their ID
/editor (as a reply to someone) make a replied-to person an editor
/authorize ID - /admin (as a reply) - same as editor, but someone who can modify editors and admins
`)
})

const append = (list, adderino) => list.concat([adderino]);
const confAppend = (selector, adderino) => {
	const list = conf.get(selector);
	if (hasStuff(list)) {
		conf.set(selector, append(list, adderino));
	}
	else {
		conf.set(selector, [adderino]);
	}
};
const remove = (list, removerino) => list.filter(items => items !== removerino);
const confRemove = (selector, removerino) => {
	const list = conf.get(selector);
	if (hasStuff(list)) {
		conf.set(selector, remove(list, removerino));
	}
};
bot.command('user_id', ctx => ctx.reply(String(ctx.message.reply_to_message?.from?.id || ctx.from.id)));
bot.command('chat_id', ctx => ctx.reply(String(ctx.chat.id)));
bot.command('authorize', ctx => {
	const repliedToId = ctx.message.reply_to_message?.from?.id;
	if (isAdmin(ctx.from.id)) {
		const args = ctx.message.text.split(' ');
		if (args.length > 1) {
			const newAdmin = Number(args[1]);
			if (newAdmin) {
				confAppend('admins', newAdmin);
				ctx.reply(`Added ${newAdmin} to the list of users authorized to modify me.`);
			}
		}
		else if (repliedToId) {
			confAppend('admins', repliedToId);
			ctx.reply(`Added ${repliedToId} to the list of users authorized to modify me.`);
		}
	}
	else {
	    ctx.reply("You're unauthorized to authorize.");
	}
});
bot.command('unauthorize', ctx => {
	const repliedToId = ctx.message.reply_to_message?.from?.id;
	if (isAdmin(ctx.from.id)) {
		const args = ctx.message.text.split(' ');
		if (args.length > 1) {
			const oldAdmin = Number(args[1]);
			if (oldAdmin) {
				confRemove('admins', oldAdmin);
				ctx.reply(`Removed ${oldAdmin} to the list of users authorized to modify me.`);
			}
		}
		else if (repliedToId) {
			confRemove('admins', repliedToId);
			ctx.reply(`Removed ${repliedToId} to the list of users authorized to modify me.`);
		}
	}
	else {
		ctx.reply("You're unauthorized to unauthorize.");
	}
});

bot.command('editor', ctx => {
	const repliedToId = ctx.message.reply_to_message?.from?.id;
	if (isAdmin(ctx.from.id)) {
		const args = ctx.message.text.split(' ');
		if (args.length > 1) {
			const newEditor = Number(args[1]);
			if (newEditor) {
				confAppend('editors', newEditor);
				ctx.reply(`Added ${newEditor} to the list of users authorized to modify my responses.`);
			}
		}
		else if (repliedToId) {
			confAppend('editors', repliedToId);
			ctx.reply(`Added ${repliedToId} to the list of users authorized to modify my responses.`);
		}
	}
	else {
	    ctx.reply("You're unauthorized to authorize.");
	}
});
bot.command('uneditor', ctx => {
	const repliedToId = ctx.message.reply_to_message?.from?.id;
	if (isAdmin(ctx.from.id)) {
		const args = ctx.message.text.split(' ');
		if (args.length > 1) {
			const oldEditor = Number(args[1]);
			if (oldEditor) {
				confRemove('editors', oldEditor);
				ctx.reply(`Removed ${oldEditor} to the list of users authorized to modify my responses.`);
			}
		}
		else if (repliedToId) {
			confRemove('editors', repliedToId);
			ctx.reply(`Removed ${repliedToId} to the list of users authorized to modify my responses.`);
		}
	}
	else {
		ctx.reply("You're unauthorized to unauthorize.");
	}
});

bot.on('text', async (ctx) => {
	const repliedTo = ctx.message.reply_to_message;
	const text = ctx.message.text;
	const repliedToText = repliedTo?.text;
	const authorized = isAdmin(ctx.from.id) || isEditor(ctx.from.id);
	// Organic add
	if (authorized && repliedToText?.startsWith('Send a reply to >this message<')) {
		if (repliedTo?.from?.id === (await bot.telegram.getMe()).id) {
			if (validateText(text)) {
				const add = addResponse(text, false);
				if (!add.ok && add.exists)
					ctx.reply(`The command ${add.command} already exists. To confirm that you would like to replace the command's response, please reply /confirm to >your message< that contains the command/response to be added.`);
				else if (add.ok) ctx.reply(`Alright, added that response. If you want to remove this command in the future, just send me this command: /delete_${add.command?.slice(1)}`);
			}
			else {
				ctx.reply("Malformatted reply. Make sure your message's first line is /some_command - some description, and that the message has more than one line!");
			}
		}
	}
	// confirm
	if (authorized && text.match(/^\/confirm(?:@.+)?$/) && repliedToText) {
		const add = addResponse(repliedToText, true);
		if (add.ok) {
			ctx.reply(`Alright, added that response. If you want to remove this command in the future, just send me this command: /delete_${add.command?.slice(1)}`);
		}
		else {
			ctx.reply("The message you replied to doesn't seem to be valid. :( Make sure your message's first line is /some_command - some description, and that the message has more than one line!");
		}
	}
	if (authorized && text.match(/^\/delete_.+/)) {
		const command = "/" + text.split('_').slice(1).join('_');
		const commandExists = conf.get("commands." + command);
		if (!commandExists) {
			ctx.reply("I cannot find the command " + command + ". If you think there's an error, contact my maker and we'll try to fix it.");
		}
		else {
			conf.set("commands." + command, null);
			ctx.reply(`Ok, done, command ${command} has been deleted`);
			setCommands()
		}
	}
	const commandsThatAreNotQuestions = "authorize unauthorize user_id chat_id confirm delete add".split(' ').map(t => '/' + t);
	const commandIsNotAQuestion = commandsThatAreNotQuestions.filter(t => text.startsWith(t)).length > 0;
	if (text.startsWith('/') && !commandIsNotAQuestion) {
		const command = text.match(/^\/(.+)/)?.[1];
		if (command) {
			const question = conf.get("commands./" + command.split('@')[0]);
			if (question) {
				ctx.replyWithHTML(question.response);
			}
		}
	}
});

bot.launch();

