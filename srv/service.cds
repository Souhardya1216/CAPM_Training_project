using { capm.product } from '../db/schema';

service ProductSupplierService @(path: '/ProductSupplierService') {

    entity Products    as projection on product.Products;
    entity Suppliers    as projection on product.Suppliers;
    entity Orders      as projection on product.Orders;
    entity Categories   as projection on product.Categories;

    action orderSubmit(
        productID  : UUID,
        quantity   : Integer
    ) returns {
        orderNumber  : String;
        status       : String;
        totalAmount  : Decimal;
    };

    action approveOrder(orderID : UUID) returns {
        status : String;
    };

    action createProduct(
        name      : String,
        price     : Decimal,
        category  : String,
        stockLevel: Integer
    ) returns {
        ID    : UUID;
        name  : String;
        price : Decimal;
    };

    action addStock(
        productID : UUID,
        quantity  : Integer
    ) returns {
        ID        : UUID;
        stockLevel: Integer;
        message   : String;
    };

    action removeStock(
        productID : UUID,
        quantity  : Integer
    ) returns {
        ID        : UUID;
        stockLevel: Integer;
        message   : String;
    };

    action getExternalProducts() returns array of {
        ProductID   : Integer;
        ProductName : String;
        UnitPrice   : Decimal;
    };

    action getExternalSuppliers() returns array of {
        SupplierID   : Integer;
        CompanyName : String;
        ContactName : String;
        Country     : String;
    };

    action fetchSuppliers(city : String, country : String) returns array of Suppliers;

    action testEndpoint() returns {
        message   : String;
        timestamp : String;
        status    : String;
    };
}