const inspirobot = require("../inspirobot");

module.exports = class{
    static name = "inspirobot";
    static description = "Sends an inspirational quote generated by an ai. (https://inspirobot.me)";
    static category = "Fun";
    static async exec(int){
        const url = await inspirobot();
        int.reply({files: [url]});
    }
}