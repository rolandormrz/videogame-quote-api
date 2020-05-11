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

const resetFields = () => {
  document.getElementById('id').value = '';
  document.getElementById('name').value = '';
  document.getElementById('quoteText').value = '';
  document.getElementById('title').value = '';
  document.getElementById('year').value = '';
};

quoteForm.onsubmit = e => {
  e.preventDefault();
  
  const { id, name, quoteText, title, year } = e.target;

  const newQuote = { 
    name: name.value,
    quoteText: quoteText.value,
    title: title.value,
    year: year.value  
  };

  const resourcePath = `${relativeURL}/${id.value}`

  axios.put(resourcePath, newQuote)
    .then(response => {
      const success = document.createElement('h3');
      success.style.lineHeight = '28px';
      success.innerHTML = `The quote located at id: ${response.data.quoteId} has been successfully updated! Below is the updated quote:`;
      
      quoteContainer.appendChild(success);

      renderSingleQuote(response.data);
    })
    .catch(error => quoteContainer.innerHTML = errorTemplate(error.response.status, error.response.data.error));

  resetFields();
};