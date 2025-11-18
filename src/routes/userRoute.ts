import express from "express";

const app = express.Router();

app.get('/', (request, response) => {
  response.send('All users fetched')
})

app.get('/:id', (request, response) => {
  const id = request.params.id
  response.send(`User ${id} fetched`)
})

app.post('/', (request, response) => {
  console.log(request.body);
  response.send(`User created`)
})

app.put('/:id', (request, response) => {
  const id = request.params.id
  console.log(request.body);
  response.send(`User ${id} updated`)
})

app.delete('/:id', (request, response) => {
  const id = request.params.id
  const name = request.query.name;
  console.log(request.body);
  response.send(`User ${id} and ${name} deleted`)
})

export default app;