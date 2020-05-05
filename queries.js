const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./videogame_quotes.db');

const selectAllQuotes = 'SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id';
const selectAllCharacters = 'SELECT * FROM character';

const sendCreatedQuote = id => {
  db.get("SELECT * FROM character JOIN quote ON character.id = quote.character_id WHERE quote.id = $id ", { $id: id }, (error, row) => {
    if(error) {
      console.log('error when performing select query', error);
      return res.status(500).json(error);
    }
    res.status(201).json(row);
  });
};


module.exports = { selectAllQuotes, selectAllCharacters, sendCreatedQuote };