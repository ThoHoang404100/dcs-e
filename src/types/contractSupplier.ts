import { IDateValue } from "./common";

export type ResponseContractSupplier<T = any> = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: T[];
    };
}

export type ResRemainingProduct = {
    statusCode: number;
    message: string;
    data: IImportRemainingProduct[];
}

export type IContractSupplyItem = {
    id: number;
    contractNo: string;
    supplierId: number;
    supplierName: string;
    supplierPhone: string;
    supplierEmail: string;
    supplierAddress: string;
    bankAccount: string;
    bankName: string;
    taxCode: string;
    companyName: string;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue;
    downPayment: number;
    nextPayment: number;
    nextPaymentDate?: IDateValue;
    lastPayment: number;
    lastPaymentDate?: IDateValue;
    total: number;
    copiesNo: number;
    keptNo: number;
    status: number;
    createDate: IDateValue;
    createdBy: string;
    modifyDate: IDateValue;
    modifiedBy: string;
    note: string;
    seller: string;
    discount: number;
    position: string;
};


export type IContractSupplyForDetail = {
    id: number;
    contractSupID: number;
    productID: number;
    productName: string;
    price: number;
    quantity: number;
    warranty: number;
    vat: number;
    productUnitID: number;
    productUnitName: string;
    unit: string;
    total: number;
    imported: number;
}

export type IContractSupplyDetailFromOrder = {
    id: number;
    price: number;
    productID: number;
    productName: string;
    quantity: number;
    total: number;
    unit: string;
    unitProductID: number;
    unitProductName: string;
    vat: number;
}

export type IProductFromSup = {
    rowId?: number;
    productId: number;
    quantity: number;
    price: number;
    vat: number;
    imported: number;
    unit: string;
}

export type IProductContractSupEdit = {
    contractId: number;
    productId: number;
    quantity: number;
    unit: string;
    price: number;
}

export type IImportRemainingProduct = {
    productID: number;
    productName: string;
    unit: string;
    quantity: number;
    price: number;
    vat: number;
    amounts: number;
};

//DTO........................................

export type IContractSupDetailDto = {
    productID: string;
    quantity: number;
    imported: number;
}

export type IContractSupplyDto = {
    supplierId: number;
    ContractNo: string;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue;
    copiesNo: number;
    keptNo: number;
    status: number;
    note: string;
    discount: number;
    parentContractId: number;
    customerContractNo: string;
    products: IContractSupplyProductDto[];
}

export type IContractSupplyProductDto = {
    productID: number;
    quantity: number;
    imported: number;
    price: number;
    unit: string;
}

export type IContractSupplyUpdateDto = {
    supplierId: number;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue
    downPayment: number;
    nextPayment: number;
    lastPayment: number;
    copiesNo: number;
    keptNo: number;
    status: number;
    note: string;
    discount: number;
    seller: string;
}

export type IContractSupProductToDelete = {
    supplierContactId: number;
    productId: number;
}

export type ResVoucherSupItem = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: VoucherSupItem[];
    };
}

export type VoucherSupItem = {
    contractId: number;
    contractNo: string;
    supplierId: number;
    supplierName: string;
    companyName: string;
    employeeID: number;
    employeeName: string;
    note: string;
    fullContractNoInfo: string;
    remainingAmount: number;
}