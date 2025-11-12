import express from 'express'
import productRouter from "./src/routes/productRoute.js";
import userRouter from "./src/routes/userRoute.js";

const app = express()
const port = 3000

app.use(express.static('public'))
app.use(express.static('assets'))
app.use(express.json());

app.get('/', (request, response) => {
  response.send('Hello World!')
})


app.use("/products", productRouter);
app.use("/users", userRouter);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
