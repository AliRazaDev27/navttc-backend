import express from 'express'
import { getProducts, getSingleProduct, getProductsByCat, createProduct, deleteProduct} from '../controllers/productController.js';
const app = express.Router();

app.get('/', getProducts)
app.get('/:id', getSingleProduct);
app.get('/category/:cat', getProductsByCat);
app.post('/', createProduct);
app.post('/', deleteProduct)

export default app;