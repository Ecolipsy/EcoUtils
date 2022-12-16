// Import stuff and declare important variables
const { Client } = require("discord.js");
const fs = require("fs");
const client = new Client({intents: 3276799});
const token = fs.readFileSync("token.txt").toString().trim();
const commands = [];
global.embedColor = 0x005080;
global.startDate = Date.now();
global.commands = commands;

// Command handler stuff
function load(){
    const commandDir = fs.readdirSync("commands");
    commandDir.forEach((commandFile) => {
        if(!commandFile.endsWith(".js")) return console.log(`Skipping ${commandFile} because it's non-js.`);
        const module = require("./commands/" + commandFile);
        if(!module.name) return console.log(`Skipping ${commandFile} because it has no name.`);
        console.log(`Loading ${module.name} (${commandFile})`);
        module.commandFile = commandFile;
        commands.push(module);
    });
}
global.load = load;
function reload(){
    commands.forEach(cmd => {
        delete require.cache[require.resolve(cmd.commandFile)];
        commands.splice(commands.indexOf(cmd), 1);
    });
    load();
}
global.reload = reload;

// Need to use complicated method because map method seems to fuck itself
function find(commandName){
    var cmd = null;
    commands.forEach(command => {
        if(command.name === commandName) cmd = command;
    });
    return cmd;
}

// Load application commands and stuff
client.on("ready", () => {
    console.log("Ready!");
    load();
    client.guilds.cache.forEach(guild => {
        console.log("Loading commands on " + guild.name + "...");
        const apiCommands = commands.map((cmd) => {return {name: cmd.name, description: cmd.description, options: cmd.args}});
        guild.commands.set(apiCommands);
    });
});
client.on("guildMemberAdd", (member) => {
    if(member.id !== client.user.id) return;
    const guild = member.guild;
    console.log("Loading commands on " + guild.name + "...");
    const apiCommands = commands.map((cmd) => {return {name: cmd.name, description: cmd.description, options: cmd.args}});
    guild.commands.set(apiCommands);
});

// Handle commands
client.on("interactionCreate", (int) => {
    const command = find(int.commandName);
    if(!command) int.reply("Looks like the command doesn't exist somehow");
    command.exec(int);
});

// Login to API
client.login(token);