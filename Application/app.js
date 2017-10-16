var redis = require("iorejson");
// var store = redis.createClient({ host: "127.0.0.1", port: 6379 });
var store = new redis();
store.connect();

var gamesAssets = require("../ReinoDelMal");//load games assets
var Engine = require("../SCUNMEngine");
var demoEngine = new Engine(gamesAssets.Demo);//create a engine for every game asset
var SCUNMBot = require("../SCUNMBot");
var botTokenAuth = process.env.BOT_TOKEN;
// publicar redis al bot
demoEngine.setStore(store);
var myGameBot = new SCUNMBot(botTokenAuth, { polling: true }, demoEngine, store);