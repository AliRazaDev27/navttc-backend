import express from 'express'
import { getProducts, getSingleProduct, getProductsByCat,getProductMetadata, createProduct, deleteProduct, updateProduct, deleteProductImage} from '../controllers/productController.js';
import { upload } from '../config/util.js';
const app = express.Router();

app.get('/', getProducts)
app.get('/metadata', getProductMetadata);
app.get('/category/:cat', getProductsByCat);
app.get('/:slug', getSingleProduct);
app.post('/', upload.array('images', 5) ,createProduct);
app.put('/:id', upload.array('images', 5), updateProduct);
app.delete('/:id', deleteProduct)
app.delete('/:id/:image', deleteProductImage)

export default app;