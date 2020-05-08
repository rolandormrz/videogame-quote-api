const relativeURL = '/api/quotes';
const getAllQuotesBtn = document.getElementById("get-all");
const getRandomQuoteBtn = document.getElementById("get-random");
const getQuotesByCharacterBtn = document.getElementById("get-by-character");
const quoteContainer = document.getElementById("quote-container");
const resourcePath = document.getElementById('resource-path');
let prevResourcePath = resourcePath.innerHTML;

const getQuotesByCharacter = character => {
  const quotePath = `${relativeURL}?character=${character}`;
  const request = axios.get(quotePath);
  return request.then(response => {
    return response.data;
  });
};

const getAllQuotes = () => {
  const request = axios.get(relativeURL);
  return request.then(response => response.data);
};

const getRandomQuote = () => {
  const randomQuotePath = `${relativeURL}/random`;
  const request = axios.get(randomQuotePath);
  return request.then(response => response.data);
}

const renderSingleQuote = quote => {
  const newQuote = quoteTemplate(quote.name, quote.quote_text, quote.game_title, quote.year);
  quoteContainer.appendChild(newQuote);
};

const renderAllQuotes = quotes => {
  if(quotes.length > 0) {
    quotes.forEach(quote => {
      const newQuote = quoteTemplate(quote.name, quote.quote_text, quote.game_title, quote.year);
      quoteContainer.appendChild(newQuote);
    });
  }
  else {
    quoteContainer.innerHTML = '<p style="padding: 1.1rem; line-height: 28px;">No quotes returned. Try another request</p>';
  }
};

const resetQuoteContainer = () => {
  quoteContainer.innerHTML = '';
};

const quoteTemplate = (name, text, gameTitle, year) => {
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
};


getAllQuotesBtn.onclick = () => {  
  resetQuoteContainer();
  prevResourcePath = '<h2>GET /api/quotes</h2>';
  getAllQuotes().then(quotes => renderAllQuotes(quotes));
};

getAllQuotesBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes</h2>';
};

getAllQuotesBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};

getRandomQuoteBtn.onclick = () => {
  resetQuoteContainer();
  prevResourcePath = '<h2>GET /api/quotes/random</h2>';
  getRandomQuote().then(randomQuote => renderSingleQuote(randomQuote));
};

getRandomQuoteBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes/random</h2>';
};

getRandomQuoteBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};

getQuotesByCharacterBtn.onclick = () => {
  resetQuoteContainer();
  
  const character = document.getElementById('character').value;
  console.log(character);

  getQuotesByCharacter(character)
    .then(quotes => {
      prevResourcePath = quotes.length ? `<h2>GET /api/quotes?character=${quotes[0].name}</h2>` : `<h2>GET ...</h2>`;
      renderAllQuotes(quotes);
    })
    .catch(error => {
      quoteContainer.innerHTML = `
        <div class="error">
          <div class="error-info">
            <p>An error occurred when attempting your request: </p>
            <p>Status Code: ${error.response.status}</p>
            <p>Message: ${error.response.data.error}</p>
          </div>
        </div>`;
    });
  
  document.getElementById('character').value = '';
};

getQuotesByCharacterBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes?character=...</h2>';
};

getQuotesByCharacterBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};