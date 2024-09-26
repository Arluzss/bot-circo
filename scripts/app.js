require('dotenv').config({ path: '../dev.env' });

const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const db = require('./postgres/query/queries.js');
const createTables = require('./postgres/createTables.js');
const addCommands = require('./commands/interactionCommands.js');

const userInteraction = require('./commands/roles/userInteraction.js');
const adminInteraction = require('./commands/roles/adminInteraction.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

createTables.createTables();

client.once('ready', () => {
    console.log('Bot está online!');

    client.guilds.cache.forEach(async guild => {
        await addCommands.commands(guild.id);
        await db.registerGuild(guild.id, guild.name);
    });

    adminInteraction.start(client);
    userInteraction.addXP();
});

client.on('interactionCreate', async interaction => {

    if (interaction.customId === 'meu_botao') {
        await interaction.deferUpdate();
        const button = new ButtonBuilder()
            .setCustomId('meu_botao')
            .setLabel('Já clicado!')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true); // Desabilita o botão

        const row = new ActionRowBuilder()
            .addComponents(button);

        userInteraction.redeemChest(interaction.user.id, interaction.guild.id);
        await interaction.message.edit({ components: [row] });
    }

    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (userInteraction[commandName]) {
        userInteraction[commandName](interaction);
    }

    if (adminInteraction[commandName]) {
        adminInteraction[commandName](interaction);
    }

});

client.on('guildCreate', (guild) => {
    addCommands.commands(guild.id);
    db.registerGuild(guild.id, guild.name);
});

client.on('messageCreate', async message => {
    userInteraction.countMessages(message);
});

client.login(process.env.TOKEN);