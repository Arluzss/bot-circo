

const data = require('../../gameStore/data.json');
const dropChest = require('../../events/DropChest.js');
const isthereanydeal = require('../../gameStore/isthereanydeal.js');

let client = null;
let currentOfferIndex = 0;

let offersChannel = [];
let offerInterval = null;

function start(clientParam) {
    client = clientParam;
    dropChest.randomChestValue(client);
    isthereanydeal.getOfferByAPI();
}

function sendOffer() {
    console.log('Ofertas iniciadas');

    if (offerInterval) {
        clearInterval(offerInterval);
        console.log('Ofertas reiniciadas');
    }

    offerInterval = setInterval(() => {
        if (currentOfferIndex >= data.list.length) {
            currentOfferIndex = 0;
        }

        const offer = data.list[currentOfferIndex];
        const message = isthereanydeal.formatOfferMessage(offer);

        for (let i = 0; i < offersChannel.length; i++) {
            const channel = client.channels.cache.get(offersChannel[i]);

            if (channel) {
                channel.send(message);
                console.log(`Oferta enviada para canal ${offersChannel[i]}`);
            } else {
                console.error(`Canal com ID ${offersChannel[i]} não encontrado`);
            }

        }

        currentOfferIndex++;
    }, 0.3 * 60 * 1000); // 30 minutos
}

const offer = async (interaction) => {
    if (!interaction.member.permissions.has('Administrator')) {
        await interaction.reply('Você não tem permissão para executar este comando');
        return;
    }

    if (offersChannel[interaction.channel.id]) {
        await interaction.reply('Canal já registrado para receber ofertas');
        return;
    }

    offersChannel.push(interaction.channel.id);
    sendOffer();
    await interaction.reply('Canal registrado para receber ofertas, em 30 minutos você receberá a próxima oferta');
}

const active_events = async (interaction) => {
    if (!interaction.member.permissions.has('Administrator')) {
        await interaction.reply('Você não tem permissão para executar este comando');
        return;
    }

    if (dropChest.addChannels(interaction.channel.id) === 0) {
        await interaction.reply('Canal já registrado para receber eventos ativos');
        return;
    }
    await interaction.reply('Canal registrado para receber eventos ativos, em 30 minutos você receberá o próximo evento');
}

module.exports = {
    start,
    offer,
    active_events
}