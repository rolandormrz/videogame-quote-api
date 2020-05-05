// run this file once to create the initial database containing the character and quote tables

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');

db.serialize(() => {
  // drops tables 
  db.run("DROP TABLE IF EXISTS character");
  db.run("DROP TABLE IF EXISTS quote");
  
  // create tables
  db.run('CREATE TABLE character (id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE)');
  db.run('CREATE TABLE quote (id INTEGER PRIMARY KEY, character_id INTEGER NOT NULL, quote_text TEXT NOT NULL UNIQUE, game_title TEXT NOT NULL, year INTEGER NOT NULL)');

  console.log('successfully created the character and quote tables');

  // insert dummy data
  db.run("INSERT INTO character (name) VALUES ('Scorpion')");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (1, 'Get over here!', 'Mortal Kombat', 1992)");

  db.run("INSERT INTO character (name) VALUES ('G-Man')");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (2, 'The right man in the wrong place can make all the difference in the world.', 'Half-Life 2', 2004)");

  db.run("INSERT INTO character (name) VALUES ('Solid Snake')");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (3, 'Don''t regret your past, learn from it. Regrets just make a person weaker.', 'Metal Gear Solid', 1998)");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (3, 'I''m just a man who''s good at what he does. Killing.', 'Metal Gear Solid', 1998)");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (3, 'A strong man doesn''t need to read the future. He makes his own.', 'Metal Gear Solid', 1998)");
  db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES (3, 'There''s no happiness to be found in death... no peace either. I''m leaving here alive.', 'Metal Gear Solid', 1998)");
  
  // log data from the two tables
  console.log('data in character table');
  db.each("SELECT * FROM character", (err, row) => {
    console.log(`${row.id} ${row.name}`);
  });

  console.log('data in quote table');
  db.each("SELECT * FROM quote", (err, row) => {
    console.log(`${row.id} ${row.character_id} ${row.quote_text} ${row.game_title} ${row.year}`);
  });

  db.close();
});