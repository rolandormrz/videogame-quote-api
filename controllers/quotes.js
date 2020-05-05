const quotesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');
const { sendCreatedQuote } = require('../queries');

quotesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id', (error, rows) => {
    if(error) next(error);

    res.json(rows);
  });
});

quotesRouter.get('/characters', (req, res, next) => {
  db.all('SELECT * FROM character', (error, rows) => {
    if(error) next(error);

    res.json(rows);
  });
});

quotesRouter.get('/random', (req, res, next) => {
  db.all('SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id', (error, rows) => {
    if(error) next(error);

    const randomIndex = Math.floor(Math.random() * rows.length);
    const randomQuote = rows[randomIndex];

    res.json(randomQuote);
  });
});

quotesRouter.get('/:name', (req, res, next) => {
  const name = req.params.name;
  const query = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE name = $name";
  
  db.all(query, { $name: name }, (error, rows) => {
    if(error) next(error);

    res.json(rows);
  });
});

quotesRouter.post('/', (req, res, next) => {
  let newQuote = { ...req.body };
  let selectMatchingCharQuote = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id";
  let insertQuoteQuery = "INSERT INTO quote (character_id, quote_text, game_title, year) VALUES ($id, $text, $game_title, $year)";
  
  //console.log(quote);
  db.get("SELECT * FROM character WHERE name = $name", { $name: newQuote.name }, (error, rowExists) => {
    // problem with query
    if(error) next(error);

    if(rowExists) {
      db.run(insertQuoteQuery, { $id: rowExists.id, $text: newQuote.text, $game_title: newQuote.game_title, $year: newQuote.year }, function(error) {
        if(error) next(error);

        db.get(selectMatchingCharQuote, { $id: this.lastID }, (error, row) => {
          if(error) next(error);

          res.status(201).json(row);
        });
      });
    }
    else {
      db.run("INSERT INTO character (name) VALUES ($name)", { $name: newQuote.name }, function(error) {
        if(error) next(error);

        db.run(insertQuoteQuery, { $id: this.lastID, $text: newQuote.text, $game_title: newQuote.game_title, $year: newQuote.year }, function(error) {
          if(error) next(error);
          
          db.get(selectMatchingCharQuote, { $id: this.lastID }, (error, row) => {
            if(error) next(error);

            res.status(201).json(row);
          });
        });
      });
    }
  });
});

quotesRouter.put('/:id', (req, res, next) => {
  const { quote_text, game_title, year } = req.body;
  const updateQuery = "UPDATE quote SET quote_text = $quote_text, game_title = $game_title, year = $year WHERE id = $id";
  
  db.run(updateQuery, { $quote_text: quote_text, $game_title: game_title, $year: year, $id: req.params.id }, function(error) {
    if(error) next(error);

    db.get("SELECT * FROM quote WHERE id = $id", { $id: req.params.id }, (error, row) => {
      if(error) next(error);

      res.json(row);
    });
  });
});

module.exports = quotesRouter;