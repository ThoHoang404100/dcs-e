import { IDateValue } from "./common";

export type NewCustomer = {
    id: number;
    name: string;
    companyName?: string;
    email?: string;
    phone?: string;
};

export type IQuotationItem = {
    id: number;
    quotationNo: string;
    customerId: number;
    customerName: string;
    customerPhone: string;
    supplierID: number;
    supplierName: string;
    supplierPhone: string;
    companyName: string;
    email: string;
    nickName: string;
    address: string;
    createdDate: IDateValue;
    createdBy: string;
    modifyDate: IDateValue;
    modifyBy: string;
    expiryDate: IDateValue;
    totalAmount: number;
    note: string;
    seller: string;
    status: number;
    discount: number;
    paid: number;
    remaining: number;
    isDeleted: boolean;
    employeeType: string;
    department: string;
};

export type IQuotationProduct = {
    id: string;
    productID: string;
    productName: string;
    price: number;
    quantity: number;
    unit: string;
    unitProductID: number;
    vat: number;
    total: number
};

export type IQuotationDetails = {
    quotationID: number;
    quotationNo: string;
    products: IQuotationProduct[];
};

export type IQuotationListData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IQuotationItem[];
};

export type IQuotationData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IQuotationDetails[];
};

export type ResQuotationList = {
    statusCode: number;
    message: string;
    data: IQuotationListData;
};

export type ResQuotationItem = {
    statusCode: number;
    message: string;
    data: IQuotationData;
};

export type IQuotationDetailDto = {
    productID: string;
    quantity: number;
    row: number;
    Unit: string;
    Price: number;
}

export type IQuotationDto = {
    quotationNo: string;
    customerID?: number;
    SupplierID?: number;
    createDate: IDateValue;
    expiryDate: IDateValue;
    note: string;
    discount: number;
    paid: number;
    quotationDetails: IQuotationDetailDto[];
    Type: string;
    Status: number;
}

export type IQuotationDao = {
    quotationNo: string;
    customerID?: number;
    SupplierId?: number;
    expiryDate: IDateValue;
    note: string;
    discount: number;
    seller: string;
    paid: number;
    Status: number;
}

export type IQuotationProductToDelete = {
    quotationID: string;
    productID: number[];
}

export type IProductQuotationEdit = {
    quotationId: number;
    productId: number;
    quantity: number;
    Price: number;
    Unit: string;
}

export type IProductFormEdit = {
    rowId?: number;
    productId: number;
    quantity: number;
    price: number;
    unit: string;
    vat?: number;
}