const cds = require('@sap/cds');
const axios = require('axios');

const NORTHWIND_API = 'https://services.odata.org/v4/northwind/northwind.svc';

module.exports = async function () {

    this.on('orderSubmit', async (req) => {
        const { productID, quantity } = req.data;

        try {
            const product = await SELECT.one.from('Products').where({ ID: productID });

            if (!product) {
                return req.error(404, 'Product not found');
            }

            if (product.stockLevel < quantity) {
                return req.error(400, `Insufficient stock. Available: ${product.stockLevel}`);
            }

            const totalAmount = product.price * quantity;
            const orderNumber = `ORD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

            return {
                orderNumber: orderNumber,
                status: 'Pending',
                totalAmount: totalAmount
            };
        } catch (error) {
            req.error(500, `Order submission failed: ${error.message}`);
        }
    });

    this.on('approveOrder', async (req) => {
        const { orderID } = req.data;
        return { status: 'Approved' };
    });

    this.on('createProduct', async (req) => {
        const { name, price, category, stockLevel } = req.data;
        const ID = cds.utils.uuid();

        await INSERT.into('Products').entries({
            ID: ID,
            name: name,
            price: price,
            category: category,
            stockLevel: stockLevel || 0
        });

        return { ID: ID, name: name, price: price };
    });

    this.on('addStock', async (req) => {
        const { productID, quantity } = req.data;

        try {
            const product = await SELECT.one.from('Products').where({ ID: productID });

            if (!product) {
                return req.error(404, 'Product not found');
            }

            const newStockLevel = product.stockLevel + quantity;
            await UPDATE('Products').set({ stockLevel: newStockLevel }).where({ ID: productID });

            return {
                ID: productID,
                stockLevel: newStockLevel,
                message: 'Stock added successfully'
            };
        } catch (error) {
            req.error(500, `Failed to add stock: ${error.message}`);
        }
    });

    this.on('removeStock', async (req) => {
        const { productID, quantity } = req.data;

        try {
            const product = await SELECT.one.from('Products').where({ ID: productID });

            if (!product) {
                return req.error(404, 'Product not found');
            }

            if (product.stockLevel < quantity) {
                return req.error(400, `Insufficient stock. Available: ${product.stockLevel}`);
            }

            const newStockLevel = product.stockLevel - quantity;
            await UPDATE('Products').set({ stockLevel: newStockLevel }).where({ ID: productID });

            return {
                ID: productID,
                stockLevel: newStockLevel,
                message: 'Stock removed successfully'
            };
        } catch (error) {
            req.error(500, `Failed to remove stock: ${error.message}`);
        }
    });

    this.on('getExternalProducts', async (req) => {
        try {
            const response = await axios.get(`${NORTHWIND_API}/Products`, {
                params: {
                    $format: 'json',
                    $top: 20
                },
                timeout: 15000
            });

            const products = response.data.value.map(item => ({
                ProductID: item.ProductID,
                ProductName: item.ProductName,
                UnitPrice: item.UnitPrice
            }));

            return products;
        } catch (error) {
            console.error('External API error:', error.message);
            req.error(502, 'Failed to fetch external products from Northwind OData service');
        }
    });

    this.on('getExternalSuppliers', async (req) => {
        try {
            const response = await axios.get(`${NORTHWIND_API}/Suppliers`, {
                params: {
                    $format: 'json',
                    $top: 20
                },
                timeout: 15000
            });

            const suppliers = response.data.value.map(item => ({
                SupplierID: item.SupplierID,
                CompanyName: item.CompanyName,
                ContactName: item.ContactName,
                Country: item.Country
            }));

            return suppliers;
        } catch (error) {
            console.error('External API error:', error.message);
            req.error(502, 'Failed to fetch external suppliers from Northwind OData service');
        }
    });

    this.on('fetchSuppliers', async (req) => {
        const { city, country } = req.data;

        let query = SELECT.from('Suppliers');

        if (city) {
            query = query.where('city', { like: `%${city}%` });
        }
        if (country) {
            query = query.where('country', { like: `%${country}%` });
        }

        return await query;
    });

    this.on('testEndpoint', async (req) => {
        return {
            message: 'CAP service is running correctly',
            timestamp: new Date().toISOString(),
            status: 'OK'
        };
    });
};