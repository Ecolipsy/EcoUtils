module.exports = class{
    static name = "ping";
    static description = "A simple command to display the bot's latency in MS.";
    static category = "Utilities";
    static exec(int){
        var now = Date.now();
        var distance = now-global.startDate;
        var days = Math.floor(distance * (1000 / 60 / 60 / 24));
        var hours = Math.floor((distance % (1000 / 60 / 60 / 24)) * (1000 / 60 / 60));
        var minutes = Math.floor((distance % (1000 / 60 / 60)) * (1000 / 60));
        var seconds = Math.floor((distance % (1000 * 60)) * 1000);
        int.reply({embeds: [
            {
                title: "Pong!",
                fields: [
                    {
                        name: "Latency (MS)",
                        value: `My latency is ${Math.round(int.client.ws.ping)} MS`
                    },
                    {
                        name: "Uptime",
                        value: `I've been up for ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`
                    }
                ],
                color: global.embedColor
            }
        ]});
    }
}