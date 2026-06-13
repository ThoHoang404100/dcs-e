import { useEffect, useMemo } from "react";
import axiosInstance, { endpoints, fetcher } from "src/lib/axios";
import { IDateValue } from "src/types/common";
import { IContractDao, IContractDetailDto, IContractDto, IContractProductToDelete, IProductContractEdit, IProductFormEdit, IReceiptContractDto, ReportDto, ResContractFile, ResContractItem, ResContractList, ResContractReceipt, ResContractSuppFromCus, ResDetailsWarehouseExportProduct, ResIReceiptItem, ResRemainingProduct, ResReportLiquidation, ResVoucherItem } from "src/types/contract";
import { IContractWarehouseExportDto, ResContractWarehouseExport } from "src/types/warehouseExport";
import useSWR, { SWRConfiguration } from "swr";

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

type contracProps = {
    pageNumber: number;
    pageSize: number;
    key?: string;
    enabled?: boolean;
    fromDate?: IDateValue;
    toDate?: IDateValue;
    Filter?: string;
    Month?: number;
    Status?: string;
}

type contractProp = {
    contractId: number,
    pageNumber: number,
    pageSize: number,
    options?: { enabled?: boolean }
}

type contractUploadProp = {
    File: File;
    contractNo: string;
    ContractType: string;
    FileType: string;
}

type contractAttachProp = {
    contractNo: string,
    pageNumber: number,
    pageSize: number,
    filter?: number
}

type contractReceiptProp = {
    ContractNo?: string;
    pageNumber: number;
    pageSize: number;
    enabled?: boolean;
    key?: string;
    ContractType?: string;
    ReceiptType?: string;
    Month?: number;
    FromDate?: IDateValue;
    ToDate?: IDateValue;
}

type contractWarehouseExportsProp = {
    pageNumber: number,
    pageSize: number,
    enabled?: boolean,
    key?: string,
    ContractNo?: string;
    Month?: number;
    FromDate?: IDateValue;
    ToDate?: IDateValue;
}

type reportProps = {
    pageNumber: number;
    pageSize: number;
    enabled?: boolean;
    contractNo: string;
}

type voucherProps = {
    pageNumber: number;
    pageSize: number;
    key?: string;
    enabled?: boolean;
}

export function useGetContracts({
    pageNumber,
    pageSize,
    key,
    enabled = true,
    fromDate,
    toDate,
    Filter,
    Month,
    Status
}: contracProps) {
    let params = '';

    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (fromDate || toDate) params += `&fromDate=${fromDate}&toDate=${toDate}`;

    if (key) params += `&search=${key}`;

    if (Status) params += `&Status=${Status}`;

    if (Month) params += `&Month=${Month}`;

    if (Filter) params += `&Filter=${Filter}`;

    const url = enabled ? endpoints.contract.list(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResContractList>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems =
            data?.data?.items?.filter((q) => q.status !== 0) ?? [];

        return {
            contracts: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            contractsLoading: isLoading,
            contractsError: error,
            contractsValidating: isValidating,
            contractsEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export function useGetContract({ contractId, pageNumber, pageSize, options }: contractProp) {
    let params = '';

    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    params += `&ContractId=${contractId}`;

    const enabled = options?.enabled ?? true;

    const url = enabled && contractId ? endpoints.contract.detail(params) : null;

    const { data, isLoading, error, isValidating } = useSWR<ResContractItem>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(
        () => ({
            contract: data?.data,
            contractLoading: isLoading,
            contractError: error,
            contractValidating: isValidating,
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export async function createOrUpdateContract(id: number | null, bodyPayload: IContractDto, updatePayload: IContractDao) {
    if (id) {
        const { data } = await axiosInstance.patch(endpoints.contract.update.root(id), updatePayload);
        return data;
    } else {
        const { data } = await axiosInstance.post(endpoints.contract.create, bodyPayload);
        return data;
    }
}

export async function addMoreProducts(id: number, bodyPayload: IContractDetailDto[]) {
    try {
        const { data } = await axiosInstance.post(
            endpoints.contract.update.addProducts(id),
            bodyPayload
        );
        return data;
    } catch (error) {
        console.error("Lỗi api thêm sản phẩm:", error);
        throw error;
    }
}

export async function editProductContract(bodyPayload: IProductContractEdit[]) {
    try {
        const { data } = await axiosInstance.patch(endpoints.contract.update.editProducts, bodyPayload);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function editProductForm(id?: number, bodyPayload?: IProductFormEdit) {
    try {
        if (!id) return;
        const { data } = await axiosInstance.patch(endpoints.contract.update.editProductForm(id), bodyPayload);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function deleteProductSelected(bodyPayload: IContractProductToDelete) {
    try {
        const { data } = await axiosInstance.delete(endpoints.contract.update.deleteProduct, {
            data: bodyPayload,
        });
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function uploadAttachmentContract({ File, contractNo, ContractType, FileType }: contractUploadProp) {
    try {
        const formData = new FormData();
        formData.append("File", File);
        formData.append("contractNo", contractNo);
        formData.append("ContractType", ContractType);
        formData.append("FileType", FileType);

        const { data } = await axiosInstance.post(endpoints.contractAttachment.upload, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function useGetAttachmentContract({
    contractNo,
    pageNumber,
    pageSize,
    filter,
    enabled = true,
}: contractAttachProp & { enabled?: boolean }) {
    let params = '';

    if (contractNo) params = `?contractNo=${contractNo}`;
    if (pageNumber || pageSize) params += `${params ? '&' : '?'}pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (filter) params += `&filter=${filter}`;

    const url = enabled ? endpoints.contractAttachment.list(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResContractFile>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items ?? [];

        return {
            contractFile: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            contractFileLoading: isLoading,
            contractFileError: error,
            contractFileValidating: isValidating,
            contractFileEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            mutation: mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export function deleteAttachmentContract(FileID: number) {
    try {
        const formData = new FormData();
        formData.append("FileID", String(FileID));
        return axiosInstance.delete(endpoints.contractAttachment.delete, {
            data: formData,
        });
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function downloadAttachmentContract(fileId: number) {
    return axiosInstance.get(endpoints.contractAttachment.download(fileId), {
        responseType: 'blob',
    });
}

export function useGetReceiptContract({
    ContractNo,
    pageNumber,
    pageSize,
    enabled,
    key,
    ReceiptType,
    ContractType,
    FromDate,
    ToDate,
    Month
}: contractReceiptProp) {
    let params = '';

    if (pageNumber || pageSize) params = `?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (ContractType) params += `&ContractType=${ContractType}`;
    if (ReceiptType) params += `&ReceiptType=${ReceiptType}`;
    if (key) params += `&search=${key}`;
    if (ContractNo) params += `&ContractNo=${ContractNo}`;
    if (FromDate || ToDate) params += `&fromDate=${FromDate}&toDate=${ToDate}`;
    if (Month) params += `&Month=${Month}`;

    const url = enabled ? endpoints.contractReceipt.list(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResContractReceipt>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const items = data?.data?.items ?? [];

        const contractReceiptItem = items.flatMap((i) =>
            i.receipts.map((receipt) => ({
                ...receipt,
                id: receipt.receiptId,
            }))
        );

        return {
            contractReceipt: items,
            contractReceiptItem,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            contractReceiptLoading: isLoading,
            contractReceiptError: error,
            contractReceiptValidating: isValidating,
            contractReceiptEmpty: !isLoading && !isValidating && items.length === 0,
            mutation: mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export async function createReceiptContract(dto: IReceiptContractDto) {
    try {
        const { data } = await axiosInstance.post(endpoints.contractReceipt.create, dto);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateReceiptContract(dto: IReceiptContractDto, id: number) {
    try {
        const { data } = await axiosInstance.patch(endpoints.contractReceipt.update(id), dto);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function useGetWarehouseExports({
    pageNumber,
    pageSize,
    enabled,
    key,
    ContractNo,
    FromDate,
    ToDate,
    Month
}: contractWarehouseExportsProp) {
    let params = '';

    if (pageNumber || pageSize) params = `?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    if (key) params += `&search=${key}`;
    if (ContractNo) params += `&ContractNo=${ContractNo}`;
    if (FromDate || ToDate) params += `&fromDate=${FromDate}&toDate=${ToDate}`;
    if (Month) params += `&Month=${Month}`;

    const url = enabled ? endpoints.contractWarehouse.list(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResContractWarehouseExport>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items ?? [];

        return {
            contractWarehouseExports: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            contractWarehouseExportsLoading: isLoading,
            contractWarehouseExportsError: error,
            contractWarehouseExportsValidating: isValidating,
            contractWarehouseExportsEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            mutation: mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export function useGetUnExportProduct(contractId: number, enabled: boolean) {
    const url = (enabled && contractId) ? endpoints.contractWarehouse.remaining(contractId) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResRemainingProduct>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(
        () => {
            const filteredItems = data?.data?.items ?? [];
            return {
                remainingProduct: filteredItems,
                remainingProductLoading: isLoading,
                remainingProductError: error,
                remainingProductValidating: isValidating,
                remainingProductEmpty: !isLoading && !isValidating && filteredItems.length === 0,
                mutate
            }
        },
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export function useGetDetailWarehouseExportProduct(ExportID: number, enabled: boolean) {
    const url = (enabled && ExportID) ? endpoints.contractWarehouse.details(ExportID) : null;

    const { data, isLoading, error, isValidating } = useSWR<ResDetailsWarehouseExportProduct>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(
        () => {
            const filteredItems = data?.data?.items ?? [];
            return {
                detailsProduct: filteredItems,
                detailsProductLoading: isLoading,
                detailsProductError: error,
                detailsProductValidating: isValidating,
                detailsProductEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            }
        },
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export async function createWarehouseExport(dto: IContractWarehouseExportDto) {
    try {
        const { data } = await axiosInstance.post(endpoints.contractWarehouse.create, dto);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function updateWarehouseExport(id: string, dto: IContractWarehouseExportDto) {
    try {
        const { data } = await axiosInstance.patch(endpoints.contractWarehouse.update(id), dto);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export function useGetReportLiquidation({ contractNo, pageNumber, pageSize, enabled }: reportProps) {
    let params = '';
    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (contractNo) params += `&contractNo=${contractNo}`;
    const url = enabled ? endpoints.report.root(params) : null;
    const { data, isLoading, error, isValidating } = useSWR<ResReportLiquidation>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items ?? [];

        return {
            report: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            reportLoading: isLoading,
            reportError: error,
            reportValidating: isValidating,
            reportEmpty: !isLoading && !isValidating && filteredItems.length === 0,
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export function useGetSupplierContractByCustomer(
    contractNo: string,
    enabled: boolean
) {
    const url = enabled ? endpoints.contract.contractSupplier(contractNo) : null;
    const { data, isLoading, error, isValidating, mutate } = useSWR<ResContractSuppFromCus>(url, fetcher, swrOptions);
    useEffect(() => {
        if (enabled) mutate();
    }, [enabled]);

    const memoizedValue = useMemo(
        () => {
            const filteredItems = data?.data ?? [];
            return {
                supplierContract: filteredItems,
                supplierContractLoading: isLoading,
                supplierContractError: error,
                supplierContractValidating: isValidating,
                supplierContractEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            }
        },
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export async function createReport(dto: ReportDto) {
    const { data } = await axiosInstance.post(endpoints.report.create, dto);
    return data;
}

export function useGetTotalSpendByCustomerContract(
    contractNo: string,
    enabled: boolean
) {
    const url = enabled ? endpoints.contractReceipt.totalSpend(contractNo) : null;
    const { data, isLoading, error, isValidating, mutate } = useSWR<ResIReceiptItem>(url, fetcher, swrOptions);
    useEffect(() => {
        if (enabled) mutate();
    }, [enabled]);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items ?? [];

        return {
            spenRecords: data?.data?.totalRecord ?? 0,
            spendRecordsLoading: isLoading,
            spendRecordsError: error,
            spendRecordsValidating: isValidating,
            spendRecordsEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            mutation: mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

export function useGetVoucherCode({ pageNumber, pageSize, key, enabled }: voucherProps) {
    let params = '';

    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (key) params += `&search=${key}`;

    const url = enabled ? endpoints.contract.getVouchers(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResVoucherItem>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items ?? [];

        return {
            vouchers: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            vouchersLoading: isLoading,
            vouchersError: error,
            vouchersValidating: isValidating,
            vouchersEmpty: !isLoading && !isValidating && filteredItems.length === 0,
            mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}


