const plants = require('../../imported values/plants')
let Discord = require('discord.js');
const mysql = require('mysql2/promise');
require('dotenv').config();
const connection = mysql.createPool({
    host: process.env.dbhost,
    user: process.env.dbuser,
    port: process.env.dbport,
    password: process.env.dbpass,
    database: process.env.db,
});
module.exports = {
    name: "luck",
    category: "economy",
    description: "Rolling plants",
    cooldown: "2",
    /**
   * @param {Discord.Message} message
   * @param {Array} args
   */
    async execute(message, args) {
        let luckperms = await GetEnchant(message.author.id, 'Luck') 
        var rarities = [{
            type: "lemon",
            chance: 400
          }, {
            type: "cherries",
            chance: 400
          }, {
            type: "blueberry",
            chance: 400
          }, {
            type: "orange",
            chance: 400
          }, {
            type: "tomato",
            chance: 400
          }, {
            type: "watermelon",
            chance: 400
          }, {
            type: "potato",
            chance: 200
          }, {
            type: "eggplant",
            chance: 200
          }, {
            type: "corn",
            chance: 200
          }, {
            type: "mushroom",
            chance: 200
          }, {
            type: "avocado",
            chance: 200
          }, {
            type: "coconut",
            chance: 50
          }, {
            type: "passionfruit",
            chance: 50
          }, {
            type: "chestnut",
            chance: 50
          }, {
            type: "mango",
            chance: 50
          }, {
            type: "pineapple",
            chance: 40
          }, {
            type: "dragonfruit",
            chance: 40
          }, {
            type: "raspberry",
            chance: 3
          }];
        function pickRandom() {
            let randomdialogue = ['<:Shovel:947344172845793300> You start digging..\nAfter hours, You find a sacred plant!\n',`<:Shovel:947344172845793300> That was fast! `, `☺️ Seems like you found a plant! Are you gonna claim it? `,`🤲 Nice! That's a great plant..Maybe? `]
            let answer = randomdialogue[Math.floor((Math.random() * randomdialogue.length))];
            // Calculate chances for common
            var filler = 6000 - rarities.map(r => r.chance).reduce((sum, current) => sum + current);
            if (filler <= 0) {
              console.log("chances sum is higher than 20000!");
              return;
            }
            var probability = rarities.map((r, i) => Array(r.chance === 0 ? filler : r.chance).fill(i)).reduce((c, v) => c.concat(v), []);
          
            // Pick one
            var pIndex = Math.floor(Math.random() * 6000);
            let rarity = rarities[probability[pIndex]];
            let answrr = rarity.type
            let value = plants[answrr]['coin']
            let info = plants[answrr]['info']
            let rare = plants[answrr]['rarity'] 
            let name = plants[answrr]['name']
            let embed = new Discord.MessageEmbed()
            .setTitle(`LUCK 🌴☘👩‍🌾🤑 ENCHANTMENT! BRING THE ENCHANTRESS! ${answer}You got ${name} 🌴`)
            .setDescription(`${info}\n${rare}\nProduces <:Coin:935379171897643120> ${value} per harvest\nReact ✅ to claim`)
            .setColor('AQUA')
            .setImage(plants[answrr]['picture'])
            .setFooter({ text: `${message.author.username} can claim the lucky plant!`})
            message.channel.send({embeds: [embed]}).then(msg => {
                msg.react('✅')
                const filter = (reaction, user) => {
                    return reaction.emoji.name === '✅' && user.id === message.author.id;
                }
                const collector = msg.createReactionCollector({
                    filter, 
                    max: 1,
                    time: 10000,
                })
                collector.on('collect', async(reaction) => {
                    AddPlant(message.member.id, answrr, 500)
                    msg.channel.send(`${message.member}, You claimed ${plants[answrr]['name']}`)
                    let plant = await GetPlant(message.member.id)
                    if (answrr === plant) return message.reply(`Hey ${message.member}! You already have this plant! You refused to claim this plant, as you already have the plant.`)
                    if (plant) {
                        message.channel.send(`${message.member}, You reacted with ✅ but you already have a ☘ Plant! Would you like to replace your previous plant for the current plant [${answrr}]?\nDon't react to cancel, and ✅ to replace [EXPIRES_10_SECONDS].`).then(msg => {
                            msg.react('✅')
                            const filter = (reaction, user) => {
                                return reaction.emoji.name === '✅' && user.id === message.author.id;
                            }
                            const collector = msg.createReactionCollector({
                                filter, 
                                max: 1,
                                time: 10000,
                            })
                            collector.on('collect', async (reaction) => {
                                msg.delete()
                                UpdatePlant(message.member.id, answrr)
                                let embed = new Discord.MessageEmbed()
                                .setDescription(`Your previous plant ${plant} was killed by a pesticide, and it was replaced with ${answrr} ☺`)
                                .setThumbnail(message.member.user.displayAvatarURL({dynamic: true}))
                                .setColor('BLURPLE')
                                message.member.send({embeds: [embed]})
                            })
                        })
                    }
                })
            })
          }
        let verification = Math.floor(Math.random() * 30)
        let GetBypass = await GetUserID(message.author.id)
        if (verification > 27) {
            if (GetBypass === 'Bypass') {
              return message.reply('You bypassed the captcha, as you were whitelisted ✅')
            } else {
              let number1 = Math.floor(Math.random() * 20)
              let number2 = Math.floor(Math.random() * 20)
              let answer = number1 + number2 
              message.channel.send(`${message.author}, [ANTI-MACRO-CHECK] This is a random check to prevent macroing.\n**What is \`${number1}\` + \`${number2}\` =**\nType your answer in this format: EXAMPLE: \`.verify 13\``).then(msg => {
                  const msg_filter = (m) => m.author.id === message.author.id;
                  message.channel.awaitMessages({ filter: msg_filter, max: 1}).then((collected) => {
                      let noice = collected.first()
                      if (noice.content.includes(answer)) {
                          return msg.edit('✅ Verification approved. Have fun playing!')
                      } else {
                          AddBlacklist(message.author.id, 'Blacklisted')
                          return message.channel.send('❌ You have failed the verification test. **You have been blacklisted permanately.**\nIf you think the blacklist was unfair or mistaken, and would love to provide context, you can appeal.\nAppeal Server link: https://discord.gg/FUN6xD2PZh')
                      }
                  })
              }) 
            }
        } else {
            let money = await GetMoney(message.author.id)
            let roll = money - 2000
            if (money < 500) {
                message.channel.send(`Oh no! You can't afford this, you only have <:Coin:935379171897643120> \`0\``)
            } else {
                if (luckperms === 'Luck') {
                    UpdateMoney(message.author.id, roll)
                    pickRandom()
                } else {
                    return message.reply(`You do not own this`)
                }
            }   
        }
        }
    }
async function GetEnchant(id, enchant) {
    let data = await(await connection).query(`SELECT * FROM Enchantment WHERE UserID = "${id}"`)
        
    return data[0][0] ? data[0][0][enchant] : undefined
}

async function GetUserID(id) {
    let data = await(await connection).query(`SELECT * FROM Blacklist WHERE UserID = "${id}"`)
    
    return data[0][0] ? data[0][0]["Bypass"] : undefined
}
async function GetPlant(id) {
    let data = await(await connection).query(`SELECT * FROM Plants WHERE UserID = "${id}"`)

    return data[0][0] ? data[0][0]["Plant"] : undefined
} 
async function UpdatePlant(id, plant) {
        (await connection).query(`UPDATE Plants SET Plant="${plant}" WHERE UserID="${id}"`)
    return true;
}

async function AddPlant(id, plant, money) {
    let lol = await GetPlant(id)
    if (lol === undefined) {
        (await connection).query(`INSERT INTO Plants (UserID, Plant, Money) VALUES ("${id}", "${plant}", "${money}")`)
    }
    return true;
}

async function AddBlacklist(id, Answer) {
    (await connection).query(`INSERT INTO Blacklist (UserID, Answer) VALUES ("${id}", "${Answer}")`)
return true;
}

async function GetMoney(id) {
    let data = await(await connection).query(`SELECT * FROM Plants WHERE UserID = "${id}"`)
    return data[0][0] ? data[0][0]["Money"] : undefined
}

function ShortCoins(Coins) {
    if (isNaN(Coins)) throw new Error('Coins cannot be a character')
    if (Coins <= 1000 ) return Math.round(Coins * 10) / 10
    if (Coins >= 1000000000) return (Math.round((Coins / 1000000000) * 10) / 10) + `B`
    if (Coins >= 1000000) return (Math.round((Coins / 1000000) * 10) / 10) + `M`
    if (Coins > 1000)  return (Math.round((Coins / 1000) * 10) / 10) + `K` 
  }

  async function UpdateMoney(id, coin) {
    (await connection).query(`UPDATE Plants SET Money="${coin}" WHERE UserID = "${id}"`)
    return true;
}