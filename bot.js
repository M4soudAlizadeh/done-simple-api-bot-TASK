const Telegraf = require("telegraf");
const bot = new Telegraf("2009903752:AAHdUeH6V0gKwRk3uQs_GSyu8eQrJuEddlQ");
const axios = require("axios");
const fs = require("fs");

const help = `
  *Simple Api:*
  /fortune - get a fortune cookie
  /cat - get a random cat pick
  /cat \`(text)\` - get cat image with text
  /dogbreeds - get list of dog breeds
  /dogs \`(breed)\` - get image of dog breed`;
bot.command(["help", "start"], (ctx) => {
  return ctx.telegram.sendMessage(ctx.chat.id, help, {
    parse_mode: "markdown",
  });
});

bot.command("fortune", async (ctx) => {
  try {
    const res = await axios.get("http://yerkee.com/api/fortune");
    const result = res.data.fortune;
    ctx.reply(result);
  } catch (err) {
    console.log(err);
  }
});

bot.command("cat", async (ctx) => {
  const input = ctx.message.text;
  const inputArray = input.split(" ");

  if (inputArray.length == 1) {
    try {
      const res = await axios.get("https://aws.random.cat/meow");
      const image = res.data.file;
      ctx.replyWithPhoto(image);
    } catch (err) {
      console.log(err);
    }
  } else {
    inputArray.shift();
    const other = inputArray.join(" ");
    ctx.replyWithPhoto(`https://cataas.com/cat/says/${other}`);
  }
});

bot.command("dogbreeds", (ctx) => {
  const breed = fs.readFileSync("./dogbreeds.json", "utf8");
  const breedlist = JSON.parse(breed);

  let message = "dog breeds: \n";
  breedlist.forEach((ele) => {
    message += `- ${ele}\n`;
  });
  ctx.reply(message);
});

bot.command("dogs", async (ctx) => {
  const input = ctx.message.text.split(" ");
  if (input.length !== 2) {
    ctx.reply("you must give us a name of dog breed");
    return;
  }
  let breedinput = input[1];
  const breed = fs.readFileSync("./dogbreeds.json", "utf8");
  const breedlist = JSON.parse(breed);
  if (breedlist.includes(breedinput)) {
    try {
      ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
      const res = await axios.get(
        `https://dog.ceo/api/breed/${breedinput}/images/random`
      );
      const result = res.data.message;
      ctx.replyWithPhoto(result);
    } catch (err) {
      console.log(err);
    }
  } else {
    const suggestion = breedlist.filter((ele) => ele.startsWith(breedinput));
    if (suggestion.length == 0) {
      return ctx.reply("we cannot find breed");
    }
    let message = "Did you mean: \n ";
    suggestion.forEach((ele) => (message += `-${ele}\n`));
    ctx.reply(message);
  }
});

bot.launch();
