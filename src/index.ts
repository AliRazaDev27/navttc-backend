import express from 'express'
import productRouter from "./routes/productRoute.ts";
import userRouter from "./routes/userRoute.ts";
import authRouter from "./routes/authRoute.ts";
import { config } from 'dotenv';
import db from './config/db.ts';
import cookieParser from 'cookie-parser'
import morgan from 'morgan';
import cors from 'cors';

const app = express()
const port = 3000

config();
db();

app.use(cors())
app.use(express.static('public'))
app.use(express.static('assets'))
app.use(cookieParser())
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (request, response) => {
  const backendInfo = `
    Backend Information:
    - This is a simple Express.js backend for the NAVTTC course.
    - It provides basic API functionalities for managing products and users.

    Supported Features:
    - Product Management: Retrieve a list of all products.
    - User Management: Delete users from the system.

    Available Endpoints:
    - GET /products
      - Description: Retrieves a complete list of all available products.
      - Usage: curl http://localhost:3000/products

    - DELETE /users/:id
      - Description: Deletes a specific user based on their unique ID.
      - Usage: curl -X DELETE http://localhost:3000/users/123
  `;
  response.send(backendInfo);
});

app.use("/auth", authRouter);
app.use("/products", productRouter);
app.use("/users", userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
