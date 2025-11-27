import type { Request, Response } from "express";
import type { FilterQuery, SortOrder } from 'mongoose';
import type { IProduct } from '../models/productModel.js'; // Note the .js extension for ES Modules
import Product from '../models/productModel.js'; // Note the .js extension for ES Modules

interface ProductQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  category?: string;
  subCategory?: string;
  brand?: string;
  colors?: string; // "red,blue"
  sizes?: string;  // "M,L"
  inStock?: string; // "true"
}

// Get all products
const getProducts = async (req:Request<{},{},{},ProductQueryParams>, res:Response) => {
  try {
    // 1. Destructure Query Params
    const {
      search,
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      category,
      subCategory,
      brand,
      colors, // Expecting colorCodes "#FF0000,#0000FF"
      sizes,  // Expecting "M,XL"
      sort,
      inStock // Optional: "true" to only show available items
    } = req.query;

    let colorCodes = ""
    if(colors){
    colorCodes = decodeURIComponent(colors);
    console.log("Decoded color codes:", colorCodes);
    }

    // 2. Initialize the Filter Object with Mongoose Type
    // FilterQuery<IProduct> ensures we can't filter by fields that don't exist in IProduct
    const filter: FilterQuery<IProduct> = {
      isActive: true, // Always filter soft-deleted
    };
    // --- Search Logic ---
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // --- Direct Matches ---
    if (category) filter.category = category as any; // Cast needed if using strict Union types in interface
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = brand;

    // --- Price Range ---
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // --- Nested Variants Logic (Colors & Sizes) ---
    // Note: TypeScript might complain about string keys for nested paths 
    // if StrictQuery is on, but this is valid Mongoose syntax.
    
    if (colorCodes) {
      const colorList = colorCodes.split(',');
      (filter as any)['variants.colorCode'] = { $in: colorList };
    }

    if (sizes) {
      const sizeList = sizes.split(',');
      (filter as any)['variants.size'] = { $in: sizeList };
    }

    // --- Stock Logic ---
    if (inStock === 'true') {
      (filter as any)['variants.stock'] = { $gt: 0 };
    }

    // --- Pagination Calculations ---
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // --- Sorting Logic ---
    // Record<string, SortOrder> is the standard Mongoose sort type
    let sortOptions: Record<string, SortOrder> = { createdAt: -1 };
    
    if (sort) {
      const sortFields = sort.split(',').join(' ');
      // In Mongoose 6+, we can pass the string directly, 
      // but for strict typing, we can leave it as is or parse it.
      // This simple approach works for passing string like "-price"
      sortOptions = sortFields as any; 
    }

    // --- Execution ---
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-description'); // Type-safe exclusion

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalProducts / limitNum),
      data: products,
    });
  } catch (error:any) {
    // Proper Error Handling
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message,
    });
  }
};
// Get a single product by ID
const getSingleProduct = async (request: Request, response: Response) => {
  try {
    const productSlug = request.params?.slug;
    if (!productSlug) {
      return response.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    const product = await Product.findOne({ slug: productSlug });
    if (!product) {
      return response.status(404).json({
        success: false,
        message: `Product ${productSlug} not found`,
      });
    }

    return response.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Get Single Product Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error finding product",
      error: errMsg,
    });
  }
};

// Get products by category
const getProductsByCat = async (request: Request, response: Response) => {
  try {
    const category = request.params?.cat;
    if (!category) {
      return response.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    const products = await Product.find({ category });
    return response.status(200).json({
      success: true,
      message: `Products in category ${category} retrieved successfully`,
      data: products,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Get Products by Category Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error finding products by category",
      error: errMsg,
    });
  }
};

// Create a new product
const createProduct = async (request: Request, response: Response) => {
  try {
    const {title,description,price,discountPercentage,brand,category,tags,variants,rating,numReviews} = request.body;
    const baseURL = request.protocol + '://' + request.get('host') + '/';
    const thumbnail = request.files && baseURL+(request.files as Express.Multer.File[])[0]?.path;
    const images = request.files ? (request.files as Express.Multer.File[]).map(file => baseURL+file.path) : [];
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const savedProduct = await Product.create({
      title,
      slug,
      description,
      price,
      discountPercentage,
      brand,
      category,
      tags,
      variants: JSON.parse(variants),
      rating,
      numReviews,
      thumbnail,
      images});
    return response.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Create Product Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error creating product",
      error: errMsg,
    });
  }
};

// Delete a product by ID
const deleteProduct = async (request: Request, response: Response) => {
  try {
    const productId = request.params?.id;
    if (!productId) {
      return response.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return response.status(404).json({
        success: false,
        message: `Product with id ${productId} not found`,
      });
    }

    return response.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Delete Product Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error deleting product",
      error: errMsg,
    });
  }
};

export const getProductMetadata = async (req: Request, res: Response) => {
  try{
    // get all distinct categories,subCategories, brands, colors, sizes & tags
    console.log("Fetching product metadata...");
    const categories = await Product.distinct('category');
    const subCategories = await Product.distinct('subCategory');
    const brands = await Product.distinct('brand');
    const colors = await Product.distinct('variants.color');
    const colorCode = await Product.distinct('variants.colorCode');
    const sizes = await Product.distinct('variants.size');
    res.status(200).json({
      success: true,
      data: {
        categories,
        subCategories,
        brands,
        colors,
        colorCode,
        sizes,
      },
    });
  }catch(error:any){
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
}

export const updateProduct = async (request: Request, response: Response) => {
  try{
    const productId = request.params?.id;
    if (!productId) {
      return response.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }
    if(request.files && (request.files as Express.Multer.File[]).length > 0){
      const images = (request.files as Express.Multer.File[]).map(file => file.path);
      request.body.images = images;
    }
    const oldImages = (await Product.findById(productId))?.images || [];
    if(oldImages.length > 0){
      request.body.images = [...oldImages,...(request.body.images || [])];
    }
    const updatedProduct = await Product.findByIdAndUpdate(productId, request.body, { new: true });
    if (!updatedProduct) {
      return response.status(404).json({
        success: false,
        message: `Product with id ${productId} not found`,
      });
    }
    return response.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  }
  catch(error:unknown){
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Update Product Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error updating product",
      error: errMsg,
    });
  }
}

export const deleteProductImage = async (request: Request, response: Response) => {
  try {
    const productId = request.params?.id;  
    const image = request.params?.image;
    if(!image) throw new Error("Image URL is required");
    const imageToDelete = decodeURIComponent(image);
    if (!productId || !imageToDelete) {
      return response.status(400).json({
        success: false,
        message: "Product id and image url is required",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return response.status(404).json({
        success: false,
        message: `Product with id ${productId} not found`,
      });
    }
    const images = product.images.filter(image => image !== imageToDelete);
    product.images = images;
    await product.save();
    // delete image from uploads folder
    const fs = await import('fs');
    const path = imageToDelete.replace(request.protocol + '://' + request.get('host') + '/', '');
    fs.unlinkSync(path);
    return response.status(200).json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Delete Product Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error deleting product",
      error: errMsg,
    });
}
};

export {
  getSingleProduct,
  getProducts,
  createProduct,
  getProductsByCat,
  deleteProduct,
};

