import express from "express";

const app = express.Router();

app.delete('/:id', (request, response) => {
  const id = request.params.id
  const name = request.query.name;
  console.log(request.body);
  response.send(`User ${id} and ${name} deleted`)
})

export default app;