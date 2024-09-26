const db = require('../../postgres/query/queries.js');
const dropChest = require('../../events/DropChest.js');

let messageCounts = {};

const hello = (interaction) => {
    interaction.reply(`Olá, ${interaction.user.username}!`);
    console.log("hello");
}

const server = (interaction) => {
    interaction.reply(`Nome do servidor: ${interaction.guild.name}\nTotal de membros: ${interaction.guild.memberCount}`);
    console.log("server");
}

const user_info = (interaction) => {
    interaction.reply(`Seu username: ${interaction.user.username}\nSeu ID: ${interaction.user.id}`);
    console.log("user_info");
}

const register = async (interaction) => {
    try {

        await db.registerUser(interaction.user.id, interaction.user.username, interaction.guild.id);
        await db.createBank(interaction.user.id, interaction.guild.id);

        interaction.reply(`Você foi registrado com sucesso!`);
    } catch (err) {
        console.error(err);
        if (err.message === 'Usuário já registrado') {
            await interaction.reply(`Você já está registrado!`);
            return;
        }
    }
    console.log("register");
}

const daily_money = async (interaction) => {
    try {
        await db.dailyMoney(interaction.user.id, interaction.guild.id);
        await interaction.reply(`Você recebeu 100 moedas diárias!`);
    } catch (err) {
        console.error(err);
        if (err.message === '1') {
            await interaction.reply(`Usuario não registrado!`);
        } else {
            await interaction.reply(`Ocorreu um erro ao tentar resgatar suas moedas diárias.`);
        }
    }
    console.log("daily_money");
}

const money_info = async (interaction) => {
    try {
        let info = await db.getBalance(interaction.user.id, interaction.guild.id);
        await interaction.reply(`Você tem ${info} moedas.`);
    } catch (err) {
        console.error("erro: tal" + err);
        if (err.message === '1') {
            await interaction.reply(`Você não está registrado!`);
            return;
        }
    }
}

const xp = async (interaction) => {
    try {
        if (messageCounts[interaction.user.id] && messageCounts[interaction.user.id][interaction.guild.id]) {
            await interaction.reply(`Você tem ${messageCounts[interaction.user.id][interaction.guild.id]} pontos de experiência.`);
            console.log("xp");
            return;
        }
        let info = await db.getUserXP(interaction.user.id, interaction.guild.id);
        await interaction.reply(`Você tem ${info} pontos de experiência.`);
        console.log("xp");
    } catch (err) {
        console.error(err);
        if (err.message === '1') {
            await interaction.reply(`Você não está registrado!`);
            return;
        }
    }
}

    function addXP() {
        setInterval(() => {
            if (Object.keys(messageCounts).length === 0) return;

            for (let userId in messageCounts) {
                for (let guildId in messageCounts[userId]) {
                    db.addXP(BigInt(userId), BigInt(guildId), messageCounts[userId][guildId]);
                }
            }
            messageCounts = {};
        }, 15 * 60 * 1000);
    }

    function countMessages(message) {
        if (message.author.bot) return;

        if (!messageCounts[message.author.id]) {
            messageCounts[message.author.id] = {};
        }

        if (!messageCounts[message.author.id][message.guild.id]) {
            messageCounts[message.author.id][message.guild.id] = 0;
        }

        messageCounts[message.author.id][message.guild.id]++;
    }

    function redeemChest(user_id, guild_id) {
        dropChest.redeemChest(user_id, guild_id);
    }

    module.exports = {
        hello,
        server,
        user_info,
        register,
        daily_money,
        money_info,
        xp,
        addXP,
        countMessages,
        redeemChest
    }