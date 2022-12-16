const fs = require("fs");

module.exports = class{
    static name = "rule";
    static description = "Looks up an internet rule.";
    static category = "Misc";
    static args = [
        {
            name: "rule",
            description: "The rule to look up.",
            type: 4,
            required: true
        }
    ];
    static async exec(int){
        const ruleNumber = int.options.getInteger("rule");
        const rules = fs.readFileSync("./internetrules.txt").toString().split("\n");
        const rule = rules[ruleNumber-1];
        if(!rule || rule.trim() === "") return int.reply("This rule seems to not exist or is empty.");
        int.reply(`Rule ${ruleNumber}: ${rule}`);
    }
}