import express from 'express'
import { getProducts } from '../controllers/productController.js';
const app = express.Router();

app.get('/', getProducts)

export default app;