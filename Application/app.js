var redis = require("ioredis");
var store = redis.createClient({ host: "127.0.0.1", port: 6379 });

var gamesAssets = require("../ReinoDelMal");//load games assets
var Engine = require("../SCUNMEngine");
var demoEngine = new Engine(gamesAssets.Demo);//create a engine for every game asset
var SCUNMBot = require("../SCUNMBot");
var botTokenAuth = process.env.BOT_TOKEN;
var myGameBot = new SCUNMBot(botTokenAuth, { polling: true }, demoEngine, store);//create bot for demo engine