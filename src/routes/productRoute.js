import express from 'express'
const app = express.Router();


app.get('/', (request, response) => {
  console.log(request.body);
  const page = request.body["page"]
  const limit = request.body["limit"]
  response.send(`Product page:${page} and limit:${limit}`)
})

// app.get('/',getProducts);


export default app;