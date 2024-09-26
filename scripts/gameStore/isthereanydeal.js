require('dotenv').config({ path: '../../dev.env' });

const fs = require('fs');

const apiKey = process.env.ANYDEAL_API_TOKEN;
const country = 'BR';
const limit = 15;
const sort = '-trending';
const nondeals = false;
const mature = false;
const shops = '50,61'; //Steam e nuuvem
const filter = 'N4IgDgTglgxgpiAXKAtlAdk9BXANrgGhBQEMAPJAJgFYBfIgZwAsB7MBpAbQDYBGA6gAYAurSA=='; // abaixo de 25 reais

const url = `https://api.isthereanydeal.com/deals/v2?key=${apiKey}&country=${country}&limit=${limit}&sort=${sort}&nondeals=${nondeals}&mature=${mature}&shops=${shops}&filter=${filter}`;

function formatOfferMessage(offer) {
  return `
**${offer.title}**
Loja: ${offer.deal.shop.name}
Preço: R$${offer.deal.price.amount} (Desconto: ${offer.deal.cut}%)
Preço Regular: R$${offer.deal.regular.amount}
Menor Preço na Loja: R$${offer.deal.storeLow.amount}
Menor Preço Histórico: R$${offer.deal.historyLow.amount}
Link: ${offer.deal.url}
API: https://api.isthereanydeal.com/
`;
}

async function deals() {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function getOfferByAPI() {
  console.log('API de ofertas iniciada');
  setInterval(() => {
      deals().then((offers) => {
          fs.writeFile('./gameStore/data.json', JSON.stringify(offers, null, 2), (err) => {
              if (err) {
                  console.error('Erro ao escrever o arquivo JSON', err);
              } else {
                  console.log('Arquivo data.json criado com sucesso');
              }
          });
      }).catch((err) => {
          console.error('Erro ao obter ofertas da API', err);
      });
  }, 30 * 60 * 1000); // 1 minuto
}

module.exports = {
  deals,
  formatOfferMessage,
  getOfferByAPI
};