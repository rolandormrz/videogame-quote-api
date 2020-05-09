const relativeURL = '/api/quotes';
const quoteForm = document.getElementById('quote-form');
const quoteContainer = document.getElementById('quote-container');


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

const renderSingleQuote = quote => {
  const newQuote = quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year);
  quoteContainer.appendChild(newQuote);
};

quoteForm.onsubmit = e => {
  e.preventDefault();
  
  const id = e.target.id.value;
  const quotePath = `${relativeURL}/${id}`;
  console.log('resource path: ', quotePath);

  axios.delete(quotePath)
    .then(response => {
      const success = document.createElement('h3');
      success.innerHTML = `Quote was successfully removed from the database!`;
      quoteContainer.appendChild(success);
    })
    .catch(error => {
      quoteContainer.innerHTML = `
        <div class="error">
          <div class="error-info">
            <p>An error occurred while attempting your request:</p>
            <p>Status Code: ${error.response.status}</p>
            <p>Message: ${error.response.data.error}</p>
          </div>
        </div>`;
    });

  document.getElementById('id').value = '';
};