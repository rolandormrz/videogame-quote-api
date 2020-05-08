const relativeURL = '/api/quotes';
const createQuoteForm = document.getElementById('create-quote-form');
const quoteContainer = document.getElementById('quote-container');

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

const renderSingleQuote = quote => {
  const newQuote = quoteTemplate(quote.name, quote.quote_text, quote.game_title, quote.year);
  quoteContainer.appendChild(newQuote);
};

const resetFields = () => {
  document.getElementById('name').value = '';
  document.getElementById('text').value = '';
  document.getElementById('gameTitle').value = '';
  document.getElementById('year').value = '';
};

createQuoteForm.onsubmit = e => {
  e.preventDefault();
  
  const { name, text, gameTitle, year } = e.target;

  const newQuote = { 
    name: name.value,
    text: text.value,
    gameTitle: gameTitle.value,
    year: year.value  
  };

  axios.post(relativeURL, newQuote)
    .then(response => {
      console.log(response);
      const success = document.createElement('h3');
      success.innerHTML = `Quote was successfully added to the database! Navigate to the home-page to view the quote either by name: (${response.data.name}) or by id: (${response.data.id})!`;
      quoteContainer.appendChild(success);

      renderSingleQuote(response.data);
    })
    .catch(error => {
      quoteContainer.innerHTML = `
        <div class="error">
          <div class="error-info">
            <p>An error occurred while attempting your request: </p>
            <p>Status Code: ${error.response.status}</p>
            <p>Message: ${error.response.data.error}</p>
          </div>
        </div>`;
    });

  resetFields();
};