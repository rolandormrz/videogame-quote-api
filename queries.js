const selectAllQuotes = 'SELECT * FROM Character JOIN Quote ON Character.id = Quote.character_id';
const selectAllCharacters = 'SELECT * FROM character';


module.exports = { selectAllQuotes, selectAllCharacters };