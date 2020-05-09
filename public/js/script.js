const relativeURL = '/api/quotes';
const getAllQuotesBtn = document.getElementById("get-all");
const getRandomQuoteBtn = document.getElementById("get-random");
const getByIdBtn = document.getElementById('get-by-id');
const getQuotesByNameBtn = document.getElementById("get-by-name");
const quoteContainer = document.getElementById("quote-container");
const resourcePath = document.getElementById('resource-path');
let prevResourcePath = resourcePath.innerHTML;

const getQuotesByName = name => {
  const quotePath = `${relativeURL}?name=${name}`;
  const request = axios.get(quotePath);
  return request.then(response => {
    return response.data;
  });
};

const getQuoteById = id => {
  const quotePath = `${relativeURL}/${id}`;
  const request = axios.get(quotePath);
  return request.then(response => {
    console.log(response);
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
  const newQuote = quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year);
  quoteContainer.appendChild(newQuote);
};

const renderAllQuotes = quotes => {
  if(quotes.length > 0) {
    quotes.forEach(quote => {
      const newQuote = quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year);
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

const quoteTemplate = (name, quoteText, title, year) => {
  const newQuote = document.createElement('div');

  newQuote.className = 'quote';
  newQuote.innerHTML = `
    <div class='quote-text'>
      <p>${quoteText}</p>
    </div>
    <div class="quote-info">
      <p>- ${name}, ${title} ${year}</p>
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

getQuotesByNameBtn.onclick = () => {
  resetQuoteContainer();
  
  const name = document.getElementById('input-field').value;

  getQuotesByName(name)
    .then(quotes => {
      prevResourcePath = quotes.length ? `<h2>GET /api/quotes?name=${quotes[0].name}</h2>` : `<h2>GET ...</h2>`;
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
  
  document.getElementById('input-field').value = '';
};

getQuotesByNameBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes?name=...</h2>';
};

getQuotesByNameBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};

getByIdBtn.onclick = () => {
  resetQuoteContainer();
  
  const id = document.getElementById('input-field').value;
  
  if(id) {
    getQuoteById(id)
      .then(quote => {
        prevResourcePath = `<h2>GET /api/quotes/${id}</h2>`;
        renderSingleQuote(quote);
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
  }
  else {
    quoteContainer.innerHTML = '<p style="padding: 1.1rem; line-height: 28px;">Input field empty. Please specify an ID to attempt the request.</p>';
  }

  document.getElementById('input-field').value = '';
};

getByIdBtn.onmouseover = () => {
  resourcePath.innerHTML = '<h2>GET /api/quotes/...</h2>';
};

getByIdBtn.onmouseout = () => {
  resourcePath.innerHTML = prevResourcePath;
};