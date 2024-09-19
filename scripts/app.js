require('dotenv').config({ path: '../.env' });

const { Client, GatewayIntentBits } = require('discord.js');

const db = require('./postgres/query/queries.js');
const createTables = require('./postgres/createTables.js');
const interaction = require('./commands/interactionCommands.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

let messageCounts = {};

createTables.createTables();

client.once('ready', () => {
    console.log('Bot está online!');
    client.user.setActivity('!help', { type: 'PLAYING' });
    teste();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'hello') {
        await interaction.reply(`Olá, ${interaction.user.username}!`);
    } else if (commandName === 'server') {
        await interaction.reply(`Nome do servidor: ${interaction.guild.name}\nTotal de membros: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user_info') {
        await interaction.reply(`Seu nome de usuário: ${interaction.user.username}\nSua tag: ${interaction.user.tag}`);
    } else if (commandName === 'daily_money') {
        try {
            // Tenta dar as moedas diárias
            await db.dailyMoney(interaction.user.id, interaction.guild.id);
            await interaction.reply(`Você recebeu 100 moedas diárias!`);
        } catch (err) {
            console.error(err);
            // Responde com uma mensagem de erro se já tiver resgatado
            if (err.message === 'Já recebeu suas moedas diárias hoje') {
                await interaction.reply(`Você já recebeu suas moedas diárias hoje!`);
            } else {
                // Mensagem genérica para outros erros
                await interaction.reply(`Ocorreu um erro ao tentar resgatar suas moedas diárias.`);
            }
        }
    } else if (commandName === 'register') {
        try {
            await db.registerUser(interaction.user.id, interaction.user.username, interaction.guild.id);
            await db.createBank(interaction.user.id, interaction.guild.id);
            await interaction.reply(`Você foi registrado com sucesso!`);
        } catch (err) {
            console.error(err);
            await interaction.reply(`Você já está registrado!`);
        }
    } else if (commandName === 'xp') {
        let info = await db.getUserXP(interaction.user.id, interaction.guild.id);    
        await interaction.reply(`Você tem ${info} pontos de experiência.`);
    } else if (commandName === 'money_info') {
        let info = await db.getBalance(interaction.user.id, interaction.guild.id);
        await interaction.reply(info);
    }
});



client.on('guildCreate', (guild) => {
    interaction.commands(guild.id);
    db.registerGuild(guild.id, guild.name);
});

client.on('messageCreate', async message => {
    const userId = message.author.id
    const guildId = message.guild.id;
    
    if (message.author.bot) return;

    if (!messageCounts[userId]) {
        messageCounts[userId] = {};
    }

    if (!messageCounts[userId][guildId]) {
        messageCounts[userId][guildId] = 0;
    }

    messageCounts[userId][guildId]++;

});

client.login(process.env.TOKEN);

function teste(){
    setInterval(() => {
        if (Object.keys(messageCounts).length === 0) return;
        
        for (let userId in messageCounts) {
            for (let guildId in messageCounts[userId]) {
                db.addXP(BigInt(userId), BigInt(guildId), messageCounts[userId][guildId]);
            }
        }
        messageCounts = {};
    }, 0.4 * 60 * 1000);
}

