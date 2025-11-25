import express from 'express'
import { getProducts, getSingleProduct, getProductsByCat,getProductMetadata, createProduct, deleteProduct} from '../controllers/productController.js';
import { upload } from '../config/util.js';
const app = express.Router();

app.get('/', getProducts)
app.get('/metadata', getProductMetadata);
app.get('/category/:cat', getProductsByCat);
app.get('/:id', getSingleProduct);
app.post('/', upload.array('images', 5) ,createProduct);
app.post('/', deleteProduct)

export default app;