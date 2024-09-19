require('dotenv').config({ path: '../../../.env' });
const pool = require('../postgres.js');

async function registerGuild(guild_id, name) {
  const client = await pool.connect();
  try {
    const sql = `
    INSERT INTO guilds (guild_id, name)
    SELECT $1, $2
    WHERE NOT EXISTS (SELECT 1 FROM guilds WHERE guild_id = $1);
    `;

    await client.query(sql, [guild_id, name]);
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function registerUser(user_id, name_user, guild_id) {
  const client = await pool.connect();

  try {
    const sql = `
    INSERT INTO users (users_id, name, xp, bank, guild_id)
    SELECT $1, $2, 0, 0, $3
    WHERE NOT EXISTS (
      SELECT 1 FROM users WHERE users_id = $1 AND guild_id = $3
    ) AND EXISTS (
      SELECT 1 FROM guilds WHERE guild_id = $3
    );
    `;

    await client.query(sql, [user_id, name_user, guild_id]);
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function getUserXP(user_id, guild_id) {
  const client = await pool.connect();
  try {
    const sql = `
    SELECT xp FROM users WHERE users_id = $1 AND guild_id = $2;
    `;
    
    const result = await client.query(sql, [user_id, guild_id]);
    return result.rows[0].xp;
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function addXP(user_id, guild_id, xp) {
  const client = await pool.connect();
  try {
    const sql = `
    UPDATE users SET xp = xp + $1 WHERE users_id = $2 AND guild_id = $3;
    `;
    await client.query(sql, [xp, user_id, guild_id]);
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function createBank(user_id, guild_id) {
  const client = await pool.connect();
  try {
    const sql = `
    INSERT INTO bank (users_id, guild_id, balance)
    SELECT $1, $2, 0
    WHERE NOT EXISTS (
      SELECT 1 FROM bank WHERE users_id = $1 AND guild_id = $2
    );
    `;
    await client.query(sql, [user_id, guild_id]);
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function getBalance(user_id, guild_id) {
  const client = await pool.connect();
  try {
    const sql = `
    SELECT balance FROM bank WHERE users_id = $1 AND guild_id = $2;
    `;
    const result = await client.query(sql, [user_id, guild_id]);

    return "Seu saldo atual: " + result.rows[0].balance;
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
  } finally {
    client.release();
  }
}

async function dailyMoney(user_id, guild_id) {
  const client = await pool.connect();
  try {

    const checkSql = `
    SELECT date FROM bank WHERE users_id = $1 AND guild_id = $2;
    `;
    const result = await client.query(checkSql, [user_id, guild_id]);

    if (result.rows.length > 0) {
      const lastDaily = result.rows[0].date;
      const now = new Date();
      const lastDailyDate = new Date(lastDaily);
      const hoursDifference = Math.abs(now - lastDailyDate) / 36e5;

      if (hoursDifference < 24) {
        throw new Error('Já recebeu suas moedas diárias hoje');
      }
    }

    const updateSql = `
    UPDATE bank SET balance = balance + 100, date = CURRENT_TIMESTAMP WHERE users_id = $1 AND guild_id = $2;
    `;

    await client.query(updateSql, [user_id, guild_id]);
  } catch (err) {
    console.error('Erro ao executar o arquivo SQL', err.stack);
    throw err;
  } finally {
    client.release();
  }
}

process.on('exit', () => {
  pool.end(() => {
  });
});

process.on('SIGINT', () => {
  process.exit();
});

process.on('SIGTERM', () => {
  process.exit();
});

module.exports = {
  registerGuild,
  registerUser,
  getUserXP,
  addXP,
  createBank,
  dailyMoney,
  getBalance
};