const allowList = ["381505230715486220"];
module.exports = class{
    static name = "eval";
    static description = "Evaluates and executes a JavaScript string.";
    static category = "Utility";
    static args = [
        {
            name: "code",
            description: "The JS code to execute.",
            required: true,
            type: 3
        }
    ];
    static async exec(int){
        if(!allowList.includes(int.user.id)) return int.reply({content: `You do not have permission to run eval.`, ephemeral: true});
        const code = int.options.getString("code");
        try{
            const result = eval(code);
            int.reply({content: `\`\`\`js\n${result}\n\`\`\``, ephemeral: true}).catch(e => {int.reply({content: `\`\`\`js\n${e.stack}\n\`\`\``, ephemeral: true})});
        } catch(e){
            int.reply({content: `\`\`\`js\n${e.stack}\n\`\`\``, ephemeral: true}).catch(e => {int.reply({content: `\`\`\`js\n${e.stack}\n\`\`\``, ephemeral: true})});
        }
    }
}