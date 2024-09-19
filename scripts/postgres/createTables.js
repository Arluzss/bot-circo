const pool = require('./postgres.js');

const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    users_id BIGINT,
    name VARCHAR(255) NOT NULL,
    xp INTEGER DEFAULT 0,
    guild_id BIGINT NOT NULL,
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id),
    UNIQUE (users_id, guild_id)
);
`;

const CREATE_GUILD_TABLE = `
CREATE TABLE IF NOT EXISTS guilds (
    guild_id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);
`;

const CREATE_BANK_TABLE = `
CREATE TABLE IF NOT EXISTS bank (
    id SERIAL PRIMARY KEY,
    users_id BIGINT,
    guild_id BIGINT,
    balance INTEGER DEFAULT 0,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (users_id, guild_id) REFERENCES users(users_id, guild_id)
);
`;

const createTables = async () => {
    const client = await pool.connect();
    try {
        await client.query(CREATE_GUILD_TABLE);
        await client.query(CREATE_USERS_TABLE);
        await client.query(CREATE_BANK_TABLE);
        console.log('Tabelas criadas com sucesso');
    } catch (err) {
        console.error('Erro ao executar o arquivo SQL', err.stack);
    } finally {
        client.release();
    }
};

exports.createTables = createTables;