// run this file once to create the initial database containing the character and quote tables

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');

db.serialize(() => {
  // drops tables 
  db.run("DROP TABLE IF EXISTS game")
  db.run("DROP TABLE IF EXISTS character");
  db.run("DROP TABLE IF EXISTS quote");
  
  // create tables
  db.run(
    `CREATE TABLE game (
      gameId INTEGER PRIMARY KEY,
      title TEXT NOT NULL UNIQUE
    )`);

  db.run(
    `CREATE TABLE character (
      characterId INTEGER PRIMARY KEY,
      gameId INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY(gameId) REFERENCES game(gameId)
    )`);

  db.run(
    `CREATE TABLE quote (
      quoteId INTEGER PRIMARY KEY,
      characterId INTEGER NOT NULL,
      quoteText TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      FOREIGN KEY(characterId) REFERENCES character(characterId)
    )`);

  console.log('successfully created the game, character and quote tables');

  // insert dummy data
  db.run("INSERT INTO game (title) VALUES ('Mortal Kombat')");
  db.run("INSERT INTO character (gameId, name) VALUES (1, 'Scorpion')");
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (1, 'Get over here!', 1992)");

  db.run("INSERT INTO game (title) VALUES ('Half-Life 2')");
  db.run("INSERT INTO character (gameId, name) VALUES (2, 'G-Man')");
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (2, 'The right man in the wrong place can make all the difference in the world.', 2004)");

  db.run("INSERT INTO game (title) VALUES ('Metal Gear Solid')");
  db.run("INSERT INTO character (gameId, name) VALUES (3, 'Solid Snake')");
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (3, 'Don''t regret your past, learn from it. Regrets just make a person weaker.', 1998)");
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (3, 'I''m just a man who''s good at what he does. Killing.', 1998)",);
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (3, 'A strong man doesn''t need to read the future. He makes his own.', 1998)");
  db.run("INSERT INTO quote (characterId, quoteText, year) VALUES (3, 'There''s no happiness to be found in death... no peace either. I''m leaving here alive.', 1998)");
  
  // log data from the two tables
  console.log('data in the game table');
  db.each("SELECT * FROM game", (err, row) => {
    console.log(`${row.gameId} ${row.title}`);
  });

  console.log('data in character table');
  db.each("SELECT * FROM character", (err, row) => {
    console.log(`${row.characterId} ${row.gameId} ${row.name}`);
  });

  console.log('data in quote table');
  db.each("SELECT * FROM quote", (err, row) => {
    console.log(`${row.quoteId} ${row.characterId} ${row.quoteText}, ${row.year}`);
  });

  db.close();
});