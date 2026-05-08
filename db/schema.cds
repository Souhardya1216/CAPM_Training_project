namespace capm.product;

entity Products {
    key ID          : UUID;
        name        : String(100)  @title: 'Product Name';
        price       : Decimal(10,2) @title: 'Price';
        category    : String(50)   @title: 'Category';
        stockLevel  : Integer     @title: 'Stock Level';
        supplier    : Association to Suppliers;
}

entity Suppliers {
    key ID          : UUID;
        name        : String(100)  @title: 'Supplier Name';
        email       : String(100)  @title: 'Email';
        city        : String(50)   @title: 'City';
        country     : String(50)   @title: 'Country';
        products    : Association to many Products on products.supplier = $self;
}

entity Orders {
    key ID          : UUID;
        orderNumber  : String(20)   @title: 'Order Number';
        quantity     : Integer      @title: 'Quantity';
        totalAmount  : Decimal(10,2) @title: 'Total Amount';
        status       : String(20)   @title: 'Status';
        orderDate    : Date         @title: 'Order Date';
        createdAt    : Timestamp    @title: 'Created At';
        product      : Association to Products;
}

entity Categories {
    key ID          : UUID;
        name        : String(50)   @title: 'Category Name';
}