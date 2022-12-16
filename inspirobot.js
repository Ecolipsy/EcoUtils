module.exports = async function(){
    const res = await fetch("https://inspirobot.me/api?generate=true");
    const url = await res.text();
    return url;
}