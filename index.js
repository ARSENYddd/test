"use strict";

const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

// Конфигурация для подключения к базе данных
const config = {
  connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("/home/runner/.postgresql/root.crt").toString(),
  },
};

// Функция для получения данных из API Rick and Morty
async function fetchData() {
  try {
    const response = await axios.get("https://rickandmortyapi.com/api/character");
    return response.data.results;
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
    return [];
  }
}

// Функция для сохранения данных в базу данных
async function storeData(characters) {
  const client = new pg.Client(config);

  try {
    await client.connect();

    // Создание таблицы, если она не существует
    await client.query(`
      CREATE TABLE IF NOT EXISTS characters (
        id SERIAL PRIMARY KEY,
        name TEXT,
        data JSONB
      );
    `);

    // Вставка данных в таблицу
    for (const character of characters) {
      await client.query(
        `INSERT INTO characters (name, data) VALUES ($1, $2)`,
        [character.name, character]
      );
    }

    console.log("Данные успешно вставлены");
  } catch (error) {
    console.error("Ошибка при сохранении данных:", error);
  } finally {
    await client.end();
  }
}

// Основная функция для выполнения скрипта
(async () => {
  const characters = await fetchData();
  await storeData(characters);
})();
