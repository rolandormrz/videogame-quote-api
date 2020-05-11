const relativeURL = '/api/quotes';
const getAllQuotesBtn = document.getElementById("get-all");
const getRandomQuoteBtn = document.getElementById("get-random");
const getByIdBtn = document.getElementById('get-by-id');
const getQuotesByNameBtn = document.getElementById("get-by-name");
const quoteContainer = document.getElementById("quote-container");
const resourcePath = document.getElementById('resource-path-display');
let prevResourcePath = resourcePath.innerHTML;

const loadMoreBtn = document.getElementById("load-more");

let quotesArray = [];
let quotesToShowOnClick = 5;
let lastDisplayedQuote = 0;

const load = () => {
  for(let i = lastDisplayedQuote; i < lastDisplayedQuote + quotesToShowOnClick; i++) {
    if(i >= quotesArray.length) {

      loadMoreBtn.style.visibility = 'hidden';
      break;
    }

    quoteContainer.appendChild(quotesArray[i]);
  }
  
  lastDisplayedQuote += quotesToShowOnClick;

  if(lastDisplayedQuote >= quotesArray.length) {
    loadMoreBtn.style.visibility = 'hidden';
  }
};

loadMoreBtn.onclick = load;

const renderSingleQuote = quote => {
  const newQuote = quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year);
  quoteContainer.appendChild(newQuote);
};


const renderQuotes = quotes => {
  if(quotes.length > 0) {
    if(quotes.length <= 10) {
      quotes.forEach(quote => quoteContainer.appendChild(quote));
    }
    else {
      let i = 0;
      while(i < 10) {
        quoteContainer.appendChild(quotes[i]);
        i++;
      }
      lastDisplayedQuote = i;
      loadMoreBtn.style.visibility = 'visible';
    }
  }
  else {
    quoteContainer.innerHTML = '<p style="padding: 1.1rem; line-height: 28px;">No quotes returned. Try another request</p>';
  }
}

const resetQuoteContainer = () => {
  quoteContainer.innerHTML = '';
  loadMoreBtn.style.visibility = 'hidden';
};

// --- reusable templates for rendering quotes and error messages ---
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

const errorTemplate = (status, message) => {
  return `<div class="error">
          <div class="error-info">
            <p>An error occurred when attempting your request: </p>
            <p>Status Code: ${status}</p>
            <p>Message: ${message}</p>
          </div>
        </div>`;
};

// --- set onclick handlers for all four buttons ---
getAllQuotesBtn.onclick = () => {  
  resetQuoteContainer();
  prevResourcePath = '<h2>GET /api/quotes</h2>';

  axios.get(relativeURL).then(response => {
    quotesArray = response.data.map(quote => quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year));
    
    renderQuotes(quotesArray);
  });
};

getRandomQuoteBtn.onclick = () => {
  resetQuoteContainer();
  const randomQuotePath = `${relativeURL}/random`;
  prevResourcePath = '<h2>GET /api/quotes/random</h2>';
  axios.get(randomQuotePath).then(response => renderSingleQuote(response.data));
};

getQuotesByNameBtn.onclick = () => {
  resetQuoteContainer();
  
  const name = document.getElementById('input-field').value;
  const quotePath = `${relativeURL}?name=${name}`;

  axios.get(quotePath)
    .then(response => {
      prevResourcePath = response.data.length ? `<h2>GET /api/quotes?name=${response.data[0].name}</h2>` : `<h2>GET ...</h2>`;
      quotesArray = response.data.map(quote => quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year));
      renderQuotes(quotesArray);
    })
    .catch(error => quoteContainer.innerHTML = errorTemplate(error.response.status, error.response.data.error));
  
  document.getElementById('input-field').value = '';
};

getByIdBtn.onclick = () => {
  resetQuoteContainer();
  
  const id = document.getElementById('input-field').value;
  const quotePath = `${relativeURL}/${id}`;

  if(id) {
    axios.get(quotePath)
      .then(response => {
        prevResourcePath = `<h2>GET /api/quotes/${id}</h2>`;
        renderSingleQuote(response.data);
      })
      .catch(error => quoteContainer.innerHTML = errorTemplate(error.response.status, error.response.data.error));
  }
  else {
    quoteContainer.innerHTML = '<p style="padding: 1.1rem; line-height: 28px;">Input field empty. Please specify an ID to attempt the request.</p>';
  }

  document.getElementById('input-field').value = '';
};

// --- sets up the resource-path-display container to render the resource path used when the mouse hovers over a button ---
const setResourcePathDisplay = (button, text) => {
  button.onmouseover = () => resourcePath.innerHTML = `<h2>${text}</h2>`;
  button.onmouseout = () => resourcePath.innerHTML = prevResourcePath;
};

setResourcePathDisplay(getAllQuotesBtn, 'GET /api/quotes');
setResourcePathDisplay(getRandomQuoteBtn, 'GET /api/quotes/random');
setResourcePathDisplay(getQuotesByNameBtn, 'GET /api/quotes?name=...');
setResourcePathDisplay(getByIdBtn, 'GET /api/quotes/...');