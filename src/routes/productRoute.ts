import express from 'express'
import { getProducts, getSingleProduct, getProductsByCat, createProduct, deleteProduct} from '../controllers/productController.js';
import { upload } from '../config/util.js';
const app = express.Router();

app.get('/', getProducts)
app.get('/:id', getSingleProduct);
app.get('/category/:cat', getProductsByCat);
app.post('/', upload.array('images', 5) ,createProduct);
app.post('/', deleteProduct)

export default app;