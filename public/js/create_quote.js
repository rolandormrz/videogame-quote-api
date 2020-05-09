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

const resetFields = () => {
  document.getElementById('name').value = '';
  document.getElementById('quoteText').value = '';
  document.getElementById('title').value = '';
  document.getElementById('year').value = '';
};

quoteForm.onsubmit = e => {
  e.preventDefault();
  
  const { name, quoteText, title, year } = e.target;

  const newQuote = { 
    name: name.value,
    quoteText: quoteText.value,
    title: title.value,
    year: year.value  
  };

  axios.post(relativeURL, newQuote)
    .then(response => {
      console.log(response);
      const success = document.createElement('h3');
      success.style.lineHeight = '28px';
      success.innerHTML = `Quote was successfully added to the database! Navigate to the home-page to retrieve the quote either by name: ( ${response.data.name} ) or by id: ( ${response.data.quoteId} )!`;
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