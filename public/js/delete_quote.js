const relativeURL = '/api/quotes';
const quoteForm = document.getElementById('quote-form');
const quoteContainer = document.getElementById('quote-container');

const renderSingleQuote = quote => {
  const newQuote = quoteTemplate(quote.name, quote.quoteText, quote.title, quote.year);
  quoteContainer.appendChild(newQuote);
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

quoteForm.onsubmit = event => {
  event.preventDefault();
  
  const id = event.target.id.value;
  const quotePath = `${relativeURL}/${id}`;

  axios.delete(quotePath)
    .then(response => {
      const success = document.createElement('h3');
      success.innerHTML = `Quote was successfully removed from the database!`;
      quoteContainer.appendChild(success);
    })
    .catch(error => quoteContainer.innerHTML = errorTemplate(error.response.status, error.response.data.error));

  document.getElementById('id').value = '';
  quoteContainer.innerHTML = '';
};