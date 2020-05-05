const quotesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');

quotesRouter.get('/', (req, res) => {
  db.all('SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id', (error, rows) => {
    res.json(rows);
  });
});

quotesRouter.get('/characters', (req, res) => {
  db.all('SELECT * FROM character', (error, rows) => {
    res.json(rows);
  });
});

quotesRouter.get('/:name', (req, res) => {
  const name = req.params.name;
  const query = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE name = $name";
  
  db.all(query, { $name: name }, (error, rows) => {
    res.json(rows);
  });
});

quotesRouter.post('/', (req, res) => {
  let newQuote = { ...req.body };

  /*
  db.run("INSERT INTO character (name) VALUES ($name)", { $name: newQuote.name }, 
    function(error) {
      if(error) {
        console.log(error);
        return res.status(400).end();
      }
    });
  */

  //console.log(quote);
  db.get("SELECT * FROM character WHERE name = $name", { $name: newQuote.name }, (error, row) => {
    if(row) {
      console.log(row);
      db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES ($id, $text, $game_title, $year)", 
        { $id: row.id, $text: newQuote.text, $game_title: newQuote.game_title, $year: newQuote.year },
        function(error) {
          console.log(`last id is ${this.lastID}`)
          db.all("SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id ", { $id: this.lastID }, (error, createdRow) => {
            res.status(201).json(createdRow);
          });
        }
      );
      
      console.log('done');
    }
    else {
      console.log('no existing entry in character table, creating a new one');
      db.run("INSERT INTO character (name) VALUES ($name)", { $name: newQuote.name }, 
        function(error) {
          newQuote.id = this.lastID;
          console.log('creating quote');
          db.run("INSERT INTO quote (character_id, quote_text, game_title, year) VALUES ($character_id, $text, $game_title, $year)", 
            { $character_id: this.lastID, $text: newQuote.text, $game_title: newQuote.game_title, $year: newQuote.year },
            function(error) {
              console.log(this.lastId);
              db.get("SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id ", { $id: this.lastID }, (error, row) => {
                res.status(201).json(row);
              });
            }
          );
        }
      );
    }
  });
});

module.exports = quotesRouter;