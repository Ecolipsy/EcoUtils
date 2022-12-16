const weatherLang = require("../weathericons.json");
require("dotenv").config();
const HI = require("heat-index");

async function getCoords(placeName){
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${placeName}&limit=1&appid=${process.env.OPENWEATHERMAP_KEY}`;
  const res = await fetch(url);
  const dArr = await res.json();
  const d = dArr[0];
  console.log(d);
  return {lat: d.lat, lon: d.lon, name: d.name}
}

async function getWeather(lat, lon){
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  try{
    const res = await fetch(url);
    const d = await res.json();
    return d.properties.timeseries[1];
  } catch(e){
    return null;
  }
};

function simplify(weatherObject){
  return {temp: weatherObject.data.instant.details.air_temperature, airPressure: weatherObject.data.instant.details.air_pressure_at_sea_level, cloudAreaFraction: weatherObject.data.instant.details.cloud_area_fraction, windDirection: weatherObject.data.instant.details.wind_from_direction, windSpeed: weatherObject.data.instant.details.wind_speed, weatherSymbol: weatherObject.data.next_1_hours.summary.symbol_code, humidity: weatherObject.data.instant.details.relative_humidity}
}

async function isValidPlace(place){
  try{
    await getCoords(place);
    return true;
  } catch(e){
    console.log(e);
    return false;
  }
}

async function getSimplifiedWeather(placeName){
  if(!(await isValidPlace(placeName))) return null;
  const coords = await getCoords(placeName);
  console.log(coords);
  const weather = await getWeather(coords.lat, coords.lon);
  const simpleWeather = simplify(weather);
  simpleWeather["placeName"] = coords.name;
  return simpleWeather;
}

const lang = {
  n: "North",
  ne: "North East",
  e: "East",
  se: "South East",
  s: "South",
  sw: "South West",
  w: "West",
  nw: "North West"
}

const compass = require("../compass.json");
function getWindDirection(degrees){
  var pole;
  if(degrees >= compass.n && degrees < compass.ne) pole = "n";
  if(degrees >= compass.ne && degrees < compass.e) pole = "ne";
  if(degrees >= compass.e && degrees < compass.se) pole = "e";
  if(degrees >= compass.se && degrees < compass.s) pole = "se";
  if(degrees >= compass.s && degrees < compass.sw) pole = "s";
  if(degrees >= compass.sw && degrees < compass.w) pole = "sw";
  if(degrees >= compass.w && degrees < 360) pole = "w";
  return lang[pole];
}

const windSpeeds = require("../windspeeds.json");
function getWindName(speed){
  const keys = Object.keys(windSpeeds);
  var speedName;
  keys.forEach(key => {
    const currObject = windSpeeds[key];
    var nextObject = windSpeeds[keys[keys.indexOf(key)+1]];
    if(!nextObject) nextObject = currObject;
    if(speed >= currObject && speed <= nextObject) speedName = key;
  });
  return speedName;
}

module.exports = class{
  static name = "weather";
  static description = "Check the weather anywhere in the world!";
  static category = "Utilities";
  static args = [
    {
      name: "place",
      description: "The place to get the weather from",
      type: 3,
      required: true 
    }
  ];
  static async exec(int){
    const place = int.options.getString("place");
    const weather = await getSimplifiedWeather(place);
    if(!weather){
      int.reply("This place is invalid.");
      return;
    }
    console.log(weather);
    const weatherCode = weather.weatherSymbol;
    const weatherName = weatherLang[weatherCode.split("_")[0]];
    const weatherIconName = weatherCode + ".png";
    const heatIndex = HI.heatIndex({temperature: weather.temp, humidity: weather.humidity}).toFixed(2);
    console.log(`Heat Index: ${heatIndex}`);
    const embed = {
      title: `Weather in ${weather.placeName}`,
      description: `This is the current weather and temperature in ${weather.placeName}:`,
      color: global.embedColor,
      fields: [
        {name: "Temperature", value: `${weather.temp.toFixed(2)}°C`, inline: true},
        {name: "Temperature Feels Like", value: `${heatIndex}°C`, inline: true},
        {name: "Humidity", value: `${weather.humidity}%`, inline: true},
        {name: "Weather", value: weatherName, inline: true},
        {name: "Weather Symbol", value: weather.weatherSymbol, inline: true},
        {name: "Wind Direction", value: `${weather.windDirection} (${getWindDirection(weather.windDirection)})`, inline: true},
        {name: "Wind Speed", value: `${weather.windSpeed} m/s (${getWindName(weather.windSpeed)})`, inline: true},
        {name: "Sky's Cloud Percentage", value: `${weather.cloudAreaFraction}%`, inline: true},
        {name: "Air Pressure", value: `${weather.airPressure} millibars`, inline: true}
      ],
      footer: {text: "Weather API by met.no, geolocation by storm.no"},
      thumbnail: {url: "attachment://" + weatherIconName}
    };
    int.reply({embeds: [embed], files: ["./png/" + weatherIconName]});
  }
}