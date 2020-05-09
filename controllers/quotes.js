const quotesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');
const { validId, validName } = require('../utils/validation');

quotesRouter.get('/', (req, res, next) => {
  if(Object.keys(req.query).length === 0) {
    const query = 'SELECT * FROM game JOIN character ON game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId;';

    db.all(query, (error, rows) => {
      if(error) return next(error);
  
      res.json(rows);
    });
  }
  else {
    const name = req.query.name;
    if(!validName(name)) {
      return next({ name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
    }

    const query = 'SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE LOWER(name) LIKE LOWER($name);';

    db.all(query, { $name: name }, (error, rows) => {
      if(error) return next(error);
      console.log(rows);
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
  const query = 'SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId;';
  db.all(query, (error, rows) => {
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

  db.get("SELECT * FROM quote where quoteId = $id;", { $id: id}, (error, row) => {
    if(error) return next(error);

    if(row) {
      const query = 'SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $id;';
      
      db.get(query, { $id: id }, (error, row) => {
        if(error) return next(error);
        console.log('the result of performing the query', row);
        res.json(row);
      });
    }
    else {
      return next({ name: 'NotFound', message: 'no resource matching that id exists, unable to perform request' });
    }
  });
});

quotesRouter.post('/', (req, res, next) => {
  const { name, quoteText, title, year } = req.body;

  if(!name || !quoteText || !title || !year) {
    return next({ name: 'MissingProperties', message: 'missing properties' });
  }

  if(!validName(name)) {
    return next( { name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
  }

  db.get('SELECT * FROM game WHERE title = $title', { $title : title }, (error, gameRow) => {
    if(error) return next(error);

    if(gameRow) {
      db.get('SELECT * FROM game JOIN character ON $gameId = character.gameId WHERE character.name = $name', { $gameId: gameRow.gameId, $name: name }, (error, charRow) => {
        if(error) return next(error);

        if(charRow) {
          db.run('INSERT INTO quote (characterId, quoteText, year) VALUES ($characterId, $quoteText, $year);', { $characterId: charRow.characterId, $quoteText: quoteText, $year: year }, function(error) {
            if(error) return next(error);

            db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: this.lastID }, (error, row) => {
              if(error) return next(error);

              res.status(201).json(row);
            });
          });
        }
        else {
          db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: gameRow.gameId, $name: name }, function(error) {
            if(error) return next(error);
  
            db.run('INSERT INTO quote (characterId, quoteText, year) VALUES ($characterId, $quoteText, $year);', { $characterId: this.lastID, $quoteText: quoteText, $year: year }, function(error) {
              if(error) return next(error);
  
              db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: this.lastID }, (error, row) => {
                if(error) return next(error);
  
                res.status(201).json(row);
              });
            }); 
          });
        }
      });
    }
    else {
      db.run('INSERT INTO game (title) VALUES ($title);', { $title: title}, function(error) {
        if(error) return next(error);

        db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: this.lastID, $name: name }, function(error) {
          if(error) return next(error);

          db.run('INSERT INTO quote (characterId, quoteText, year) VALUES ($characterId, $quoteText, $year);', { $characterId: this.lastID, $quoteText: quoteText, $year: year }, function(error) {
            if(error) return next(error);

            db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: this.lastID }, (error, row) => {
              if(error) return next(error);

              res.status(201).json(row);
            });
          }); 
        });
      });
    }
  });
});

quotesRouter.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { name, quoteText, title, year } = req.body;

  if(!name || !quoteText || !title || !year) {
    return next({ name: 'MissingProperties', message: 'missing properties' });
  }

  if(!validId(id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  if(!validName(name)) {
    return next( { name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
  }
  
  db.get('SELECT * FROM game JOIN character ON game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
    if(error) return next(error);

    if(row) {
      db.get('SELECT * FROM game WHERE title = $title', { $title : title }, (error, gameRow) => {
        if(error) return next(error);
    
        if(gameRow) {
          db.get('SELECT * FROM game JOIN character ON $gameId = character.gameId WHERE character.name = $name', { $gameId: gameRow.gameId, $name: name }, (error, charRow) => {
            if(error) return next(error);
    
            if(charRow) {
              db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: charRow.characterId, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                if(error) return next(error);
    
                db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
                  if(error) return next(error);
    
                  res.json(row);
                });
              }); 
            }
            else {
              db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: gameRow.gameId, $name: name }, function(error) {
                if(error) return next(error);
                
                db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: this.lastID, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                  if(error) return next(error);
      
                  db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
                    if(error) return next(error);
      
                    res.json(row);
                  });
                }); 
              });
            }
          });
        }
        else {
          db.run('INSERT INTO game (title) VALUES ($title);', { $title: title }, function(error) {
            if(error) return next(error);
    
            db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: this.lastID, $name: name }, function(error) {
              if(error) return next(error);
    
              db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: this.lastID, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                if(error) return next(error);
    
                db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
                  if(error) return next(error);
    
                  res.json(row);
                });
              }); 
            });
          });
        }
      });
    }
    else {
      return next({ name: 'NotFound', message: 'no resource matching that id exists, unable to perform request' });
    }
  });
});

quotesRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  if(!validId(id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  db.get("SELECT * FROM quote where quoteId = $id;", { $id: id}, (error, row) => {
    if(error) return next(error);

    if(row) {
      db.run("DELETE FROM quote WHERE quoteId = $id;", { $id: id }, function(error) {
        if(error) return next(error);
    
        res.status(204).end();
      });
    }
    else {
      return next({ name: 'NotFound', message: 'no resource matching that id exists, unable to perform request' });
    }
  });
});

module.exports = quotesRouter;