"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomer = exports.getCustomer = exports.getAllCustomers = exports.createCustomer = void 0;
const customers_1 = require("../models/customers");
const customerValid_1 = require("../validations/customerValid");
const adminValidation_1 = require("../validations/adminValidation");
const createCustomer = async (req, res) => {
    try {
        const validationResult = customerValid_1.regCustomerSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const { email } = req.body;
        const exist = await customers_1.CustomerInstance.findOne({ where: { email } });
        if (exist) {
            return res.status(400).json({ error: "Customer name already exists" });
        }
        const customer = await customers_1.CustomerInstance.create({ ...req.body });
        return res.status(201).json({
            message: "customer created succsesfully",
            customer,
        });
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
exports.createCustomer = createCustomer;
const getAllCustomers = async (req, res) => {
    try {
        const customers = await customers_1.CustomerInstance.findAll({
            order: [["name", "ASC"]],
        });
        if (customers.length === 0) {
            return res.status(204).send();
        }
        res.status(200).json({
            message: "successfully retrieved your customers",
            customers,
        });
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
exports.getAllCustomers = getAllCustomers;
const getCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await customers_1.CustomerInstance.findByPk(id);
        if (!customer) {
            return res.status(404).json({ message: "customer not found", customer });
        }
        res
            .status(200)
            .json({ messages: "Customer retrieved succesfully", customer });
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
exports.getCustomer = getCustomer;
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const validationResult = customerValid_1.updateCustomerSchema.validate(req.body, adminValidation_1.option);
        if (validationResult.error) {
            return res
                .status(400)
                .json({ error: validationResult.error.details[0].message });
        }
        const customer = await customers_1.CustomerInstance.findByPk(id);
        if (!customer) {
            return res.status(404).json({ error: "customer not found" });
        }
        const updatedCustomer = await customer.update(req.body);
        res.status(200).json({
            message: "Customer updated succesfully",
            updatedCustomer,
        });
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
exports.updateCustomer = updateCustomer;
//# sourceMappingURL=customerController.js.map