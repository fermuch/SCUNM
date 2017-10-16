module.exports = function (token, options, engine, store) {

	var TelegramBot = require("node-telegram-bot-api");
	var verbsKeyboard = createKeyboard(engine.verbs);

	bot = new TelegramBot(token, options);

	setEvents(bot, engine, store, verbsKeyboard);

	/*bot.setWebHook(options.webHook.url + "/bot" + token, {
		certificate: options.webHook.cert,
		max_connections: options.webHook.maxconn,
		allowed_updates: ["message", "callback_query"]
	});*/

	return bot;
};

function createKeyboard(verbArray) {
	var verbsKeyboardMarkUp = [];

	var part = 3;
	for (var i = 0; i < verbArray.length; i += part) {
		verbsKeyboardMarkUp.push(verbArray.slice(i, i + part).map(function (verb) { return { text: verb }; }));
	}

	return {
		keyboard: verbsKeyboardMarkUp,
		resize_keyboard: true,
		one_time_keyboard: false
	};
}

function createInlineButtons(selection) {
	if (!selection || !selection.list) return null;
	var actorsKeyboardMarkUp = [];

	var part = 2;
	for (var i = 0; i < selection.list.length; i += part) {
		actorsKeyboardMarkUp.push(selection.list.slice(i, i + part).map(function (actor) { return { text: actor.name, callback_data: selection.command + " " + actor.id }; }));
	}

	return {
		inline_keyboard: actorsKeyboardMarkUp
	};
}

function parseQueryData(data) {
	var cmndLst = data.split(" ");
	cmndLst.forEach(function (value, indx) {
		cmndLst[indx] = cmndLst[indx].replace("_", " "); //from "pick_up silver_coin" to ["pick up", "silver coin" ]
	});
	return cmndLst;
}

function setEvents(bot, engine, store, verbsKeyboard) {

	bot.onText(/^\/start$/, async function (msg, match) {
		var userId = msg.from.id;
		var storeKey = userId + ":" + engine.name();
		var gameState = await store.get(storeKey, '.');
		if (!gameState) {
			store.set(storeKey, '.', engine.initialState);
			gameState = engine.initialState;
		}
		engine.setState(gameState);
		var outPut = await engine.continue();
		if (outPut.imgURL) {
			await bot.sendDocument(userId, outPut.imgURL);
		}
		await bot.sendMessage(userId, outPut.text, {
			reply_markup: verbsKeyboard
		});
	});

	bot.onText(/^\/restart$/, async function (msg) {
		var userId = msg.from.id;
		var storeKey = userId + ":" + engine.name();
		engine.reset();
		store.set(storeKey, '.', engine.getState());
		var outPut = await engine.continue();
		if (outPut.imgURL) {
			await bot.sendDocument(userId, outPut.imgURL);
		}
		await bot.sendMessage(userId, outPut.text, {
			reply_markup: verbsKeyboard
		});
	});

	// engine.verbs => Object.keys(engine.assets.globalCommands)
	Object.keys(engine.assets.globalCommands).forEach(function (verb) {
		bot.onText(new RegExp("^" + verb), async function (msg) {
			var userId = msg.from.id;
			var storeKey = userId + ":" + engine.name();
			console.info(
				`[${msg.from.first_name} ${msg.from.last_name} (${msg.from.id})]`,
				msg.text || msg.data
			);
			var gameState = await store.get(storeKey, '.');
			engine.setState(gameState);
			const argv = parseQueryData(msg.text);
			var outPut;
			if (argv.length > 1) {
				console.info({argv});
				outPut = await engine.execCommand.apply(engine, [verb, argv]);
			} else {
				outPut = await engine.execCommand(verb);
			}
			if (engine.updatedState) { store.set(storeKey, '.', engine.getState());}
			var inlineButtons = createInlineButtons(outPut.selection);
			if (outPut.imgURL) {
				await bot.sendDocument(userId, outPut.imgURL);
			}
			console.info(`[bot ${msg.from.id}] ${outPut.text}`);
			await bot.sendMessage(userId, outPut.text, {
				reply_markup: inlineButtons
			});
		});
	});

	bot.on("callback_query", async function (msg) {
		var userId = msg.from.id;
		var storeKey = userId + ":" + engine.name();
		console.info(
			`[${msg.from.first_name} ${msg.from.last_name} (${msg.from.id})]`,
			msg.text || msg.data
		);
		var gameState = await store.get(storeKey, '.');
		engine.setState(gameState);
		var clientQuery = parseQueryData(msg.data);
		var outPut = await engine.execCommand.apply(engine, clientQuery);
		if (engine.updatedState) { store.set(storeKey, '.', engine.getState()); }
		var inlineButtons = createInlineButtons(outPut.selection);
		if (outPut.imgURL) {
			await bot.sendDocument(userId, outPut.imgURL);
		}
		console.info(`[bot ${msg.from.id}] ${outPut.text}`);
		await bot.sendMessage(userId, outPut.text, {
			reply_markup: inlineButtons
		});
		bot.answerCallbackQuery(msg.id);
	});


}