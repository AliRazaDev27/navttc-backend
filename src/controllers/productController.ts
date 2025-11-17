import type { Request, Response } from "express";
import productModel from "../models/productModel.js";


// Get all products
const getProducts = async (request: Request, response: Response) => {
  try {
    const products = await productModel.find();
    return response.status(200).json({
      success: true,
      message: "All products retrieved successfully",
      data: products,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Get Products Error:", errMsg);
    return response.status(500).json({
      success: false,
      message: "Error retrieving products",
      error: errMsg,
    });
  }
};

// Get a single product by ID
const getSingleProduct = async (request: Request, response: Response) => {
  try {
    const productId = request.params?.id;
    if (!productId) {
      return response.status(400).json({
        success: false,
        message: "Product id is required",
      });
    }

    const product = await productModel.findById(productId);
    if (!product) {
      return response.status(404).json({
        success: false,
        message: `Product with id ${productId} not found`,
      });
    }

    return response.status(200).json({
      success: true,
      message: `Product with id ${productId} retrieved successfully`,
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

    const products = await productModel.find({ category });
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
    const productData = request.body;
    const savedProduct = await productModel.create(productData);
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

    const deletedProduct = await productModel.findByIdAndDelete(productId);
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

export {
  getSingleProduct,
  getProducts,
  createProduct,
  getProductsByCat,
  deleteProduct,
};

