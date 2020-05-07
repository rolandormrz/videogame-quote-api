const relativeURL = '/api/quotes';
const getAllQuotesBtn = document.getElementById("get-all");
const getRandomQuoteBtn = document.getElementById("get-random");
const getQuotesByCharacter = document.getElementById("get-by-character");
const quoteList = document.getElementById("quote-list");
const resourcePath = document.getElementById('resource-path');

const getAllQuotes = () => {
  const request = axios.get(relativeURL);
  return request.then(response => response.data);
};

const renderSingleQuote = quote => {
  const newQuote = createQuote(quote.name, quote.quote_text, quote.game_title, quote.year);
  quoteList.appendChild(newQuote);
};

const renderAllQuotes = quotes => {
  if(quotes.length > 0) {
    quotes.forEach(quote => {
      const newQuote = createQuote(quote.name, quote.quote_text, quote.game_title, quote.year);
      quoteList.appendChild(newQuote);
    });
  }
  else {
    quoteList.innerHTML = '<p>No quotes returned. Try another request</p>';
  }
};

const resetQuoteList = () => {
  quoteList.innerHTML = '';
};

const createQuote = (name, text, gameTitle, year) => {
  const newQuote = document.createElement('div');

  newQuote.className = 'quote';
  newQuote.innerHTML = `
    <div class='quote-text'>
      <p>${text}</p>
    </div>
    <div class="quote-info">
      <p>- ${name}, ${gameTitle} ${year}</p>
    </div>`;

  return newQuote;  
}

getAllQuotesBtn.onclick = () => {  
  resetQuoteList();
  getAllQuotes().then(quotes => renderAllQuotes(quotes));
};

getRandomQuoteBtn.onclick = () => {
  resetQuoteList();


};

getQuotesByCharacter.onclick = () => {
  resetQuoteList();

  console.log('get by character button clicked');
};