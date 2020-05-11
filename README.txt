A Restful API built using Express.js and SQLite. Stores quotes made by popular video game characters and supports basic CRUD operations.

Root URL for the application is localhost:3001.

Resources can be interacted by appending the URL below and using the appropriate HTTP verb.

URL                     verb        functionality
/api/quotes             GET         fetches all quote resources in the collection
/api/quotes             POST        creates a new quote resource
/api/quotes/:id         GET         fetches a single quotes resource
/api/quotes/:id         PUT         updates the quote resource with the specified id
/api/quotes/:id         DELETE      deletes the quote resource with the specified id
/api/quotes/random      GET         fetches a random quote resource