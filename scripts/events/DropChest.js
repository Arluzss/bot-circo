const db = require('../postgres/query/queries.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

let interval = null;
let eventsChannel = [];
let value = 0;

function randomChestValue(client) {
    if (interval) {
        clearInterval(interval);
    }

    interval = setInterval(() => {
        if (Math.random() > 0.5 && eventsChannel.length > 0) {
            value = Math.floor(Math.random() * 100);
            eventsChannel.forEach(guild => {

                const button = new ButtonBuilder()
                    .setCustomId('meu_botao')
                    .setLabel('Clique aqui!')
                    .setStyle(ButtonStyle.Primary); // Estilos: Primary, Secondary, Success, Danger, Link

                // Cria a linha de ação com o botão
                const row = new ActionRowBuilder()
                    .addComponents(button);

                // Envia a mensagem com o botão no canal especificado
                // await channel.send({ content: 'Aqui está seu botão:', components: [row] });
                client.channels.cache.get(guild).send({ content: 'Aqui está seu botão:', components: [row] });
            });
        }

    }, 20 * 60 * 1000);
}

function addChannels(channel) {
    if (eventsChannel.includes(channel)) {
        return 0;
    }
    eventsChannel.push(channel);
}

function redeemChest(user_id, guild_id) {
    console.log(`Cofre resgatado com sucesso! ${value} moedas para o usuário ${user_id} no servidor ${guild_id}`);
    db.addMoney(user_id, guild_id, value);
}

module.exports = {
    redeemChest,
    randomChestValue,
    addChannels
}; 