const quotesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');
const { validId, validName } = require('../utils/validation');

quotesRouter.get('/', (req, res, next) => {
  if(Object.keys(req.query).length === 0) {
    db.all('SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id;', (error, rows) => {
      if(error) return next(error);
  
      res.json(rows);
    });
  }
  else {
    const name = req.query.character;
    if(!validName(name)) {
      return next({ name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
    }

    const query = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE name = $name;";

    db.all(query, { $name: name }, (error, rows) => {
      if(error) return next(error);

      res.json(rows);
    });
  }
});

quotesRouter.get('/characters', (req, res, next) => {
  db.all('SELECT * FROM character;', (error, rows) => {
    if(error) return next(error);

    res.json(rows);
  });
});

quotesRouter.get('/random', (req, res, next) => {
  db.all('SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id;', (error, rows) => {
    if(error) return next(error);

    const randomIndex = Math.floor(Math.random() * rows.length);
    const randomQuote = rows[randomIndex];

    res.json(randomQuote);
  });
});

quotesRouter.get('/:id', (req, res, next) => {
  const id = req.params.id;
  if(!validId(id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  const query = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id;";
  
  db.all(query, { $id: id }, (error, rows) => {
    if(error) return next(error);

    res.json(rows);
  });
});

quotesRouter.post('/', (req, res, next) => {
  const { name, text, game_title, year } = req.body;

  if(!validName(name)) {
    return next( { name: 'ValidationError', message: 'name can only contain letters, digits and spaces' })
  }

  let selectMatchingCharQuote = "SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id;";
  let insertQuoteQuery = "INSERT INTO quote (character_id, quote_text, game_title, year) VALUES ($id, $text, $game_title, $year);";
  
  db.get("SELECT * FROM character WHERE name = $name;", { $name: name }, (error, rowExists) => {
    // problem with query
    if(error) return next(error);

    if(rowExists) {
      db.run(insertQuoteQuery, { $id: rowExists.id, $text: text, $game_title: game_title, $year: year }, function(error) {
        if(error) return next(error);

        db.get(selectMatchingCharQuote, { $id: this.lastID }, (error, row) => {
          if(error) return next(error);

          res.status(201).json(row);
        });
      });
    }
    else {
      db.run("INSERT INTO character (name) VALUES ($name);", { $name: name }, function(error) {
        if(error) return next(error);

        db.run(insertQuoteQuery, { $id: this.lastID, $text: text, $game_title: game_title, $year: year }, function(error) {
          if(error) return next(error);
          
          db.get(selectMatchingCharQuote, { $id: this.lastID }, (error, row) => {
            if(error) return next(error);

            res.status(201).json(row);
          });
        });
      });
    }
  });
});

quotesRouter.put('/:id', (req, res, next) => {
  if(!validId(req.params.id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  const { quote_text, game_title, year } = req.body;
  console.log(typeof req.params.id);
  const updateQuery = "UPDATE quote SET quote_text = $quote_text, game_title = $game_title, year = $year WHERE id = $id;";
  
  db.run(updateQuery, { $quote_text: quote_text, $game_title: game_title, $year: year, $id: req.params.id }, function(error) {
    if(error) return next(error);

    db.get("SELECT * FROM quote WHERE id = $id;", { $id: req.params.id }, (error, row) => {
      if(error) return next(error);

      res.json(row);
    });
  });
});

quotesRouter.delete('/:id', (req, res, next) => {
  if(!validId(req.params.id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  const deleteQuery = "DELETE FROM quote WHERE id = $id;";
  db.run(deleteQuery, { $id: req.params.id }, function(error) {
    if(error) return next(error);

    res.status(204).end();
  });
});

module.exports = quotesRouter;