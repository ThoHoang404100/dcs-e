import { useMemo } from "react";
import axiosInstance, { endpoints, fetcher } from "src/lib/axios";
import { IDateValue } from "src/types/common";
import { IProductFormEdit, IProductQuotationEdit, IQuotationDao, IQuotationDetailDto, IQuotationDto, IQuotationProductToDelete, ResQuotationItem, ResQuotationList } from "src/types/quotation";
import useSWR, { SWRConfiguration } from "swr";

type quotationProps = {
    pageNumber: number,
    pageSize: number,
    key?: string,
    type?: string,
    enabled?: boolean,
    fromDate: IDateValue,
    toDate: IDateValue,
    Filter?: string,
    Month?: number,
    Status?: string,
}

const swrOptions: SWRConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
};

export function useGetQuotations({
    pageNumber,
    pageSize,
    key,
    type,
    enabled = true,
    fromDate,
    toDate,
    Filter,
    Month,
    Status
}: quotationProps) {
    let params = '';

    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    if (fromDate || toDate) params += `&fromDate=${fromDate}&toDate=${toDate}`;

    if (key) params += `&search=${key}`;

    if (Status) params += `&Status=${Status}`;

    if (Month) params += `&Month=${Month}`;

    if (Filter) params += `&Filter=${Filter}`;

    if (type) params += `&Type=${type}`;

    const url = enabled ? endpoints.quotation.list(params) : null;

    const { data, isLoading, error, isValidating, mutate } = useSWR<ResQuotationList>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(() => {
        const filteredItems = data?.data?.items?.filter((q) => q.status !== 0) ?? [];

        return {
            quotations: filteredItems,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalPages: data?.data?.totalPages ?? 0,
                totalRecord: data?.data?.totalRecord ?? 0,
            },
            quotationsLoading: isLoading,
            quotationsError: error,
            quotationsValidating: isValidating,
            quotationsEmpty:
                !isLoading &&
                !isValidating &&
                filteredItems.length === 0,
            mutation: mutate
        };
    }, [data, error, isLoading, isValidating]);

    return memoizedValue;
}

type quotationProp = {
    quotationId: number,
    pageNumber: number,
    pageSize: number,
    options?: { enabled?: boolean }
}

export function useGetQuotation({ quotationId, pageNumber, pageSize, options }: quotationProp) {
    let params = '';

    if (pageNumber || pageSize) params = `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    const enabled = options?.enabled ?? true;

    const url = enabled && quotationId ? endpoints.quotation.detail(quotationId, params) : null;

    const { data, isLoading, error, isValidating } = useSWR<ResQuotationItem>(url, fetcher, swrOptions);

    const memoizedValue = useMemo(
        () => ({
            quotation: data?.data,
            quotationLoading: isLoading,
            quotationError: error,
            quotationValidating: isValidating,
        }),
        [data, error, isLoading, isValidating]
    );

    return memoizedValue;
}

export async function createOrUpdateQuotation(id: number | null, bodyPayload: IQuotationDto, updatePayload: IQuotationDao) {
    if (id) {
        const { data } = await axiosInstance.patch(endpoints.quotation.update.root(id), updatePayload);
        return data;
    } else {
        const { data } = await axiosInstance.post(endpoints.quotation.create, bodyPayload);
        return data;
    }
}

export async function addMoreProducts(id: number, bodyPayload: IQuotationDetailDto[]) {
    try {
        const { data } = await axiosInstance.post(
            endpoints.quotation.update.addProducts(id),
            bodyPayload
        );
        return data;
    } catch (error) {
        console.error("Lỗi api thêm sản phẩm:", error);
        throw error;
    }
}

export async function deleteProductSelected(bodyPayload: IQuotationProductToDelete) {
    try {
        const { data } = await axiosInstance.delete(endpoints.quotation.update.deleteProduct, {
            data: bodyPayload,
        });
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function editProductQuotation(bodyPayload: IProductQuotationEdit[]) {
    try {
        const { data } = await axiosInstance.patch(endpoints.quotation.update.editProducts, bodyPayload);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function editProductForm(id?: number, bodyPayload?: IProductFormEdit) {
    try {
        if (!id) return;
        const { data } = await axiosInstance.patch(endpoints.quotation.update.editProductForm(id), bodyPayload);
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function sendEmailQuotation({ quotationId, email }: { quotationId: number; email: string }) {
    try {

        const { data } = await axiosInstance.post(endpoints.quotation.sendMail, { quotationId, email });
        return data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}



// Định nghĩa type cho Props của hook
type GetQuotationDetailProps = {
    quotationId: number;
    pageNumber: number;
    pageSize: number;
    options?: { enabled?: boolean };
};

/**
 * Hook lấy chi tiết báo giá (có phân trang cho danh sách sản phẩm bên trong)
 * URL: /api/v1/quotation/get-detail/{id}?pageNumber={...}&pageSize={...}
 */
export function useGetQuotationDetail({
    quotationId,
    pageNumber,
    pageSize,
    options
}: GetQuotationDetailProps) {

    // Tạo query string cho phân trang
    const params = useMemo(() => {
        return `?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    }, [pageNumber, pageSize]);

    const enabled = options?.enabled ?? true;

    // Sử dụng endpoint đã định nghĩa trong file của bạn: endpoints.quotation.detail
    const url = enabled && quotationId
        ? endpoints.quotation.detail(quotationId, params)
        : null;

    // Sử dụng ResQuotationList vì response trả về mảng "items" (như bạn đã cung cấp ở trên)
    const { data, isLoading, error, isValidating, mutate } = useSWR<ResQuotationList>(
        url,
        fetcher,
        swrOptions
    );

    const memoizedValue = useMemo(() => {
        // Lấy phần tử đầu tiên từ items (chứa thông tin quotation và mảng products)
        const detailData = data?.data?.items?.[0] || null;

        return {
            quotationDetail: detailData,
            pagination: {
                pageNumber: data?.data?.pageNumber ?? 1,
                pageSize: data?.data?.pageSize ?? pageSize,
                totalRecord: data?.data?.totalRecord ?? 0,
                totalPages: data?.data?.totalPages ?? 0,
            },
            detailLoading: isLoading,
            detailError: error,
            detailValidating: isValidating,
            detailEmpty: !isLoading && !detailData,
            detailMutate: mutate,
        };
    }, [data, error, isLoading, isValidating, pageSize, mutate]);

    return memoizedValue;
}


