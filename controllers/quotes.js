// this file contains all routes associated with the base path /api/quotes

const quotesRouter = require('express').Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');
const { validName, validId } = require('../utils/validation');

quotesRouter.get('/', (req, res, next) => {
  // if no query string is specified return all quotes
  if(Object.keys(req.query).length === 0) {
    const query = 'SELECT * FROM game JOIN character ON game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId;';

    db.all(query, (error, rows) => {
      if(error) return next(error);
  
      res.json(rows);
    });
  }
  // if a query string is used, use the name property to return all quotes associated with that name
  else {
    const name = req.query.name;
    if(!validName(name)) {
      return next({ name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
    }

    const query = 'SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE LOWER(name) LIKE LOWER($name);';

    db.all(query, { $name: name }, (error, rows) => {
      if(error) return next(error);

      res.json(rows);
    });
  }
});

// returns all characters in the database
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

// retrieve the quotes associated with the id passed in, if the id doesn't exist in the database return an error
quotesRouter.get('/:id', (req, res, next) => {
  const id = req.params.id;

  if(!validId(id)) {
    return next({ name: 'ValidationError', message: 'id can only contain digits' });
  }

  db.serialize(() => {
    db.get("SELECT * FROM quote where quoteId = $id;", { $id: id}, (error, row) => {
      if(error) return next(error);

      if(!row) {
        return next({ name: 'NotFound', message: 'no resource matching that id exists, unable to perform request' });
      }
    });

    const query = 'SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $id;';

    db.get(query, { $id: id }, (error, row) => {
      if(error) return next(error);

      res.json(row);
    });
  });  
});

// creates a new quote in the /api/quotes route
quotesRouter.post('/', (req, res, next) => {
  const { name, quoteText, title, year } = req.body;

  // select a row from the game table where it's title field equals the title property from the request obj
  db.get('SELECT * FROM game WHERE title = $title', { $title : title }, (error, gameRow) => {
    if(error) return next(error);

    // if a row with the title exists in the game table
    if(gameRow) {
      // select the row from the character table where its gameId field matches the gameId from the previous query and its name equals the name from the request obj
      db.get('SELECT * FROM game JOIN character ON $gameId = character.gameId WHERE character.name = $name', { $gameId: gameRow.gameId, $name: name }, (error, charRow) => {
        if(error) return next(error);

        // if a row exists in the character table with a gameId and name column matching the parameters made in the previous query
        if(charRow) {
          // insert into the quote table the quoteText from the request obj and the characterId returned from the previous query
          db.run('INSERT INTO quote (characterId, quoteText, year) VALUES ($characterId, $quoteText, $year);', { $characterId: charRow.characterId, $quoteText: quoteText, $year: year }, function(error) {
            if(error) return next(error);

            // select and return the newly created row using the quoteId from the previous query
            db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: this.lastID }, (error, row) => {
              if(error) return next(error);

              res.status(201).json(row);
            });
          });
        }
        else {
          // insert into the character table the gameId from the previous query and the name from the request obj
          db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: gameRow.gameId, $name: name }, function(error) {
            if(error) return next(error);
            // insert into the quote table the quoteText from the request obj and the characterId returned from the previous query
            db.run('INSERT INTO quote (characterId, quoteText, year) VALUES ($characterId, $quoteText, $year);', { $characterId: this.lastID, $quoteText: quoteText, $year: year }, function(error) {
              if(error) return next(error);
  
              // select and return the newly created row using the quoteId from the previous query
              db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: this.lastID }, (error, row) => {
                if(error) return next(error);
  
                res.status(201).json(row);
              });
            }); 
          });
        }
      });
    }
    // no row with the title from the request obj exists in the game table, data is new to the database so insert
    // into the three tables and return the newly created row
    else {
      db.serialize(() => {
        db.run('INSERT INTO game (title) VALUES ($title);', { $title: title}, function(error) {
          if(error) return next(error);
        });

        db.run('INSERT INTO character (gameId, name) VALUES ((SELECT gameId FROM game WHERE title = $title), $name);', { $title: title, $name: name }, function(error) {
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

// updates the quote matching the id in the path, if the id doesn't exist returns an error
quotesRouter.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const { name, quoteText, title, year } = req.body;

  if(!validName(name)) {
    return next( { name: 'ValidationError', message: 'name can only contain letters, digits and spaces' });
  }
  
  // initial query checks if a quote matching the id from the request obj exists in the quote table
  db.get('SELECT * FROM game JOIN character ON game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
    if(error) return next(error);

    // if a row exists checks if a row in the game table exists with the title from the request obj
    if(row) {
      db.get('SELECT * FROM game WHERE title = $title', { $title : title }, (error, gameRow) => {
        if(error) return next(error);
    
        // if a row in the game table exists check if a row with the gameId from the previous query and the name from the request obj exists in the character table
        if(gameRow) {
          db.get('SELECT * FROM game JOIN character ON $gameId = character.gameId WHERE character.name = $name', { $gameId: gameRow.gameId, $name: name }, (error, charRow) => {
            if(error) return next(error);
    
            // updates the quote matching the id from the request obj using the characterId form the previous query and the new data from the request obj
            if(charRow) {
              db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: charRow.characterId, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                if(error) return next(error);
    
                // get and return the newly updated quote
                db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
                  if(error) return next(error);
    
                  res.json(row);
                });
              }); 
            }
            // if no row exists with the gameId from previous query and name from the request obj, insert the gameId and name into the character table
            else {
              db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: gameRow.gameId, $name: name }, function(error) {
                if(error) return next(error);
                
                // updates the quote matching the id from the request obj using the characterId form the previous query and the new data from the request obj
                db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: this.lastID, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                  if(error) return next(error);
      
                  // get and return the newly updated quote
                  db.get('SELECT * FROM game JOIN character on game.gameId = character.gameID JOIN quote ON quote.characterId = character.characterId WHERE quote.quoteId = $quoteId;', { $quoteId: id }, (error, row) => {
                    if(error) return next(error);
      
                    res.json(row);
                  });
                }); 
              });
            }
          });
        }
        // no row with the title from the request obj exists in the database, data is new to the database so insert into the title
        // and character tables and update the quote in the quote table using the id specified in the request obj
        else {
          db.run('INSERT INTO game (title) VALUES ($title);', { $title: title }, function(error) {
            if(error) return next(error);
    
            db.run('INSERT INTO character (gameId, name) VALUES ($gameId, $name);', { $gameId: this.lastID, $name: name }, function(error) {
              if(error) return next(error);
    
              db.run("UPDATE quote SET characterId = $characterId, quoteText = $quoteText, year = $year WHERE quoteId = $quoteId;", { $characterId: this.lastID, $quoteText: quoteText, $quoteId: id, $year: year }, function(error) {
                if(error) return next(error);
    
                // get and return the newly updated quote
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

// deletes the quote associated with the id passed in, if the id doesn't exist in the database return an error
quotesRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  db.serialize(() => {
    db.get("SELECT * FROM quote where quoteId = $id;", { $id: id}, (error, row) => {
      if(error) return next(error);

      if(!row) {
        return next({ name: 'NotFound', message: 'no resource matching that id exists, unable to perform request' });
      }
    });

    db.run("DELETE FROM quote WHERE quoteId = $id;", { $id: id }, function(error) {
      if(error) return next(error);
  
      res.status(204).end();
    });
  });
});

module.exports = quotesRouter;