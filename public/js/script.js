const relativeURL = '/api/quotes';
const getAllQuotesBtn = document.getElementById("get-all");
const getRandomQuoteBtn = document.getElementById("get-random");
const getQuotesByCharacterBtn = document.getElementById("get-by-character");
const quoteList = document.getElementById("quote-list");
const resourcePath = document.getElementById('resource-path');
let prevResourcePath = resourcePath.innerHTML;

const getQuotesByCharacter = character => {
  const quotePath = `${relativeURL}?character=${character}`;
  const request = axios.get(quotePath);
  return request.then(response => {
    //console.log(response.data);
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
  resetQuoteList();
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
  resetQuoteList();
  
  const character = document.getElementById('character').value;
  console.log(character);

  getQuotesByCharacter(character)
    .then(quotes => {
      prevResourcePath = quotes.length ? `<h2>GET /api/quotes?character=${quotes[0].name}</h2>` : `<h2>GET ...</h2>`;
      renderAllQuotes(quotes);
    })
    .catch(error => {
      console.log('rejecting');
      console.log(error);
      //console.log(error.response.status, error.response.data);
    });
  
  document.getElementById('character').value = '';
};

getQuotesByCharacterBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes?character=...</h2>';
};

getQuotesByCharacterBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};