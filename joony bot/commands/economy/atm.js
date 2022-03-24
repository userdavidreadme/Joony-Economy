let Discord = require('discord.js')
const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: process.env.dbhost,
    user: process.env.dbuser,
    port: 3306,
    password: process.env.dbpass,
    database: process.env.db,
});

module.exports = {
    name: "atm",
    aliases: ['convert'],
    category: 'economy',
    /**
   * @param {Discord.Message} message
   * @param {Array} args
   */
    async execute(message) {
        let diamond = await GetDiamond(message.author.id)
        let money = await GetMoney(message.author.id)
        let totaldiamond = money / 10000
        let embed = new Discord.MessageEmbed()
        .setAuthor({name: `${message.author.username} Welcome to your ATM 🏧`})
        .setDescription('Start your Converting by reacting to 💎\nExchange Rate ⏩ COINS to DIAMOND')
        .addField(`Current Exchange`,`<:Coin:935379171897643120> 10K ⏩ 1💎`)
        .setColor('BLURPLE')
        message.channel.send({embeds: [embed]}).then(msg=> {
            msg.react('💎')
            const filter = (reaction, user) => {
                return reaction.emoji.name === '💎' && user.id === message.author.id;
            }
            const collector = msg.createReactionCollector({
                filter, 
                max: 1,
                time: 10000,
            })
            collector.on('collect', async(reaction) => {
                message.channel.send(`How much diamonds would you like to convert with your current coins.\nYou currently have <:Coin:935379171897643120> ${ShortCoins(money)}\nYou currently have 💎 ${ShortCoins(diamond)}\nYou can currently make 💎 ${totaldiamond}`).then(msg=> {
                    const msg_filter = (m) => m.author.id === message.author.id;
                    message.channel.awaitMessages({ filter: msg_filter, max: 1}).then((collected) => {
                        let msgs = collected.first()
                        let msgcontent = msgs.content
                        let diamondsstated = parseInt(msgcontent) * 10000
                        let diamondxd = parseInt(msgcontent) + 1
                        let diamonds = diamond + parseInt(diamondxd)
                        let updatemon = money - diamondsstated 
                        if (Number.isNaN(Number(msgcontent))) {
                            return message.channel.send(`❌ You have not provided a number. Please execute the command again, and ensure that it is a number.`)
                        } else {
                            if (diamonds >= money) {
                                message.channel.send(`${message.author.username}, you cannot afford this!`)
                            } else {
                                let embed = new Discord.MessageEmbed()
                                .setAuthor({name: `${message.author.username}'s ATM SUCCESSFUL ✅`})
                                .setDescription(`You have converted ${diamondxd} for ${diamondsstated}!\nYou now have ${ShortCoins(updatemon)}, and ${diamonds} 💎 converted.`)
                                .setColor('BLUE')
                                msg.channel.send({embeds: [embed]})
                                UpdateDiamond(message.author.id, diamonds)
                                UpdateMoney(message.author.id, updatemon)
                            }
                        }
                    })
                })
            })
        })
    }        
}
async function UpdateMoney(id, Money) {
    (await connection).query(`UPDATE Plants SET Money="${Money}" WHERE UserID = "${id}"`)
    return true;
}
async function UpdateDiamond(id, Diamond) {
    (await connection).query(`UPDATE Plants SET Diamond="${Diamond}" WHERE UserID = "${id}"`)
    return true;
}

async function GetDiamond(id) {
    let data = await(await connection).query(`SELECT * FROM Plants WHERE UserID = "${id}"`)
    return data[0][0] ? data[0][0]["Diamond"] : undefined
}
function ShortCoins(Coins) {
    if (isNaN(Coins)) throw new Error('Coins cannot be a character')
    if (Coins <= 1000 ) return Math.round(Coins * 10) / 10
    if (Coins >= 1000000000) return (Math.round((Coins / 1000000000) * 10) / 10) + `B`
    if (Coins >= 1000000) return (Math.round((Coins / 1000000) * 10) / 10) + `M`
    if (Coins > 1000)  return (Math.round((Coins / 1000) * 10) / 10) + `K` 
  }

async function GetMoney(id) {
    let data = await(await connection).query(`SELECT * FROM Plants WHERE UserID = "${id}"`)

    return data[0][0] ? data[0][0]["Money"] : undefined
}   