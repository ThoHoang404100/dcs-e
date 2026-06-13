import { IDateValue } from "./common";

export type IContractItem = {
    id: number;
    contractNo: string;
    customerID: number;
    customerName: string;
    nickName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerTaxCode: string;
    companyName: string;
    customerBank: string;
    customerBankNo: string;
    position: string;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue;
    downPayment: number;
    nextPayment: number;
    lastPayment: number;
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
};

export type IContractListData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IContractItem[];
};

export type IContractProduct = {
    id: number;
    contractID: number;
    productID: number;
    productName: string;
    price: number;
    quantity: number;
    vat: number;
    unit: string;
    unitProductID: number;
    total: number;
    exported: number;
    remaining: number;
    warranty: number;
};

export type IContractRemainingProduct = {
    productID: number;
    name: string;
    price: number;
    quantity: number;
    productUnitID: number;
    productUnitName: string;
    total: number;
    vat: number;
    warranty: number;
    exported: number;
    remaining: number;
};

export type IContractDetails = {
    cusstomerID: number;
    contractID: number;
    contractNo: string;
    products: IContractProduct[];
};

export type IContractData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IContractDetails[];
};

export type IContractDetailDto = {
    productID: string;
    quantity: number;
    price: number;
    unit: string;
}

export type ResContractList = {
    statusCode: number;
    message: string;
    data: IContractListData;
};

export type ResContractItem = {
    statusCode: number;
    message: string;
    data: IContractData;
}

export type IContractDto = {
    ContractNo: string;
    customerId: number;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue;
    downPayment: number;
    nextPayment: number;
    lastPayment: number;
    copiesNo: number;
    keptNo: number;
    status: number;
    note: string;
    discount: number;
    products: IContractDetailDto[];
};

export type IContractDao = {
    customerId: number;
    signatureDate: IDateValue;
    deliveryAddress: string;
    deliveryTime: IDateValue;
    downPayment: number;
    nextPayment: number;
    lastPayment: number;
    copiesNo: number;
    keptNo: number;
    status: number;
    note: string;
    discount: number;
};

export type IContractProductToDelete = {
    contractId: string;
    productID: string;
}

export type IProductContractEdit = {
    contractId: number;
    productId: number;
    quantity: number;
    price: number;
    unit: string;
}

export type IProductFormEdit = {
    rowId?: number;
    productID: number;
    quantity: number;
    price: number;
    vat: number;
    unit: string;
}

export type ResContractFile = {
    statusCode: number;
    message: string;
    data: IContractFileData;
};

export type IContractFileData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IContractFileItem[];
};

export type IContractFileItem = {
    contractNo: string;
    contractType: string;
    files: IContractFile[];
}

export type IContractFile = {
    fileName: string;
    fileID: number;
    fileUrl: string;
    fileType: string;
    createdDate: IDateValue;
}

export type IReceiptContractDto = {
    receiptNo: string,
    contractNo: string,
    date: IDateValue,
    receiptType: string,
    amount: number,
    note: string,
    contractType: string,
    bankAccountID?: number,
    companyName: string,
    customerName: string,
    address: string,
    payer: string,
    reason?: string,
}

export type IReceiptContract = {
    receiptId: number,
    receiptNo: string,
    contractNo: string,
    date: IDateValue,
    receiptType: string,
    amount: number,
    note: string,
    contractType: string,
    bankAccountID: number,
    bankNo: string;
    companyName: string,
    customerName: string,
    address: string,
    payer: string,
    reason?: string,
    createdBy: string,
}

export type ResContractReceipt = {
    statusCode: number;
    message: string;
    data: IContractReceiptData;
}

export type IContractReceiptData = {
    pageNumber: number;
    pageSize: number;
    totalRecord: number;
    totalPages: number;
    items: IContractReceiptItem[];
}

export type IContractReceiptItem = {
    contractNo: string;
    totalCollect: number;
    totalSpend: number;
    receipts: IReceiptContract[];
}

export type ResRemainingProduct = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: IContractRemainingProduct[];
    };
}

export type IWarehouseExportProduct = {
    id: number;
    productID: number;
    productName: string;
    unitProductName: string;
    unitProductID: number;
    price: number;
    quantity: number;
    vat: number;
    total: number;
};

export type ResDetailsWarehouseExportProduct = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: IWarehouseExportProduct[];
    };
}

export type ResReportLiquidation = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: {
            contractNo: string;
            reports: {
                id: number;
                reportNo: string;
                type: string;
                signatureDate: IDateValue;
                customerCompany: string;
                customerAddress: string;
                customerPhone: string;
                customerName: string;
                customerTaxcode: string;
                customerBankAccount: string;
                customerBank: string;
                totalContractAmount: number;
                totalPaid: number;
                debt: number;
            }[]
        }[];
    };
}

export type ResContractSuppFromCus = {
    statusCode: number;
    message: string;
    data: {
        contractNo: string;
        companyName: string;
        supplierName: string;
        supplierAddress: string;
        remainingAmount: number;
        note: string;
        fullContractInfo: string;
    }[];
}

export type ReportDto = {
    reportNo: string;
    type: "Acceptance" | "HandOver" | "Liquidation" | "Commissioning";
    contractNo: string;
    contractType: "Customer" | "Supplier";
    date: IDateValue;
    status: number;
}

export type ResIReceiptItem = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: {
            id: number,
            receiptNo: string,
            contractNo: string,
            date: IDateValue,
            receiptType: string,
            amount: number,
            note: string,
            contractType: string,
            bankAccountID: number,
            bankNo: string;
            companyName: string,
            customerName: string,
            address: string,
            payer: string,
            reason?: string,
            createdBy: string,
        }[];
    };
}

export type ResVoucherItem = {
    statusCode: number;
    message: string;
    data: {
        pageNumber: number;
        pageSize: number;
        totalRecord: number;
        totalPages: number;
        items: VoucherItem[];
    };
}

export type VoucherItem = {
    contractId: number;
    contractNo: string;
    customerId: number;
    customerName: string;
    companyName: string;
    employeeId: number;
    employeeName: string;
    note: string;
    fullContractInfo: string;
    remainingAmount: number;
}