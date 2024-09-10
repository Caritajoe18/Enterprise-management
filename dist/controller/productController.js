"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.getProducts = exports.searchProducts = exports.updateProducts = exports.createProducts = void 0;
const products_1 = require("../models/products");
const productValidations_1 = require("../validations/productValidations");
const adminValidation_1 = require("../validations/adminValidation");
const sequelize_1 = require("sequelize");
const createProducts = async (req, res) => {
    try {
        const validationResult = productValidations_1.createProductSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const { name, price, pricePlan } = req.body;
        const exist = await products_1.ProductInstance.findOne({ where: { name } });
        if (exist) {
            const newProduct = await exist.update({ ...req.body,
            });
        }
        const product = await products_1.ProductInstance.create({
            ...req.body,
            price,
            pricePlan: pricePlan || {},
        });
        res
            .status(201)
            .json({ message: "Raw material added successfully", product });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unexpected error occurred." });
        }
    }
};
exports.createProducts = createProducts;
const updateProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const { prices, name } = req.body;
        const product = await products_1.ProductInstance.findByPk(id);
        if (!product) {
            return res.status(404).json({ error: "product not found" });
        }
        const updatedPrices = { ...product.dataValues.price, ...prices };
        const updatedProducts = await products_1.ProductInstance.update({ name, price: updatedPrices }, { where: { id } });
        //product.dataValues.prices = { ...product.dataValues.prices, ...prices };
        console.log("After update:", product.dataValues);
        //await product.save();
        res
            .status(200)
            .json({ message: "Prices updated successfully", updatedProducts });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred." });
    }
};
exports.updateProducts = updateProducts;
const searchProducts = async (req, res) => {
    try {
        const { name } = req.query;
        const whereClause = {};
        if (name) {
            whereClause.name = { [sequelize_1.Op.like]: `%${name}%` };
        }
        const products = await products_1.ProductInstance.findAll({ where: whereClause });
        if (products.length === 0) {
            return res
                .status(404)
                .json({ message: "No product found matching the criteria" });
        }
        res
            .status(200)
            .json({ message: "Company's products retrieved successfully", products });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.searchProducts = searchProducts;
const getProducts = async (req, res) => {
    try {
        const products = await products_1.ProductInstance.findAll();
        if (products.length === 0) {
            return res.status(204).send();
        }
        res
            .status(200)
            .json({ message: "Company's products retrieved successfully", products });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "An unexpected error occurred" });
    }
};
exports.getProducts = getProducts;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await products_1.ProductInstance.findByPk(id);
        if (!product) {
            return res.status(404).json({ message: "No product found" });
        }
        // Delete the product
        await product.destroy();
        res.status(200).json({ message: "Product deleted successfully" });
    }
    catch (error) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        else {
            return res.status(500).json({ error: "An unexpected error occurred." });
        }
    }
};
exports.deleteProduct = deleteProduct;
//# sourceMappingURL=productController.js.map