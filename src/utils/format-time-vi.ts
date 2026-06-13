/* eslint-disable import/no-duplicates */
import { format, getTime, formatDistanceToNow, add } from 'date-fns';
import { vi } from 'date-fns/locale/vi';
import { IDateValue } from 'src/types/common';
// ----------------------------------------------------------------------

type InputValue = Date | string | number | null | undefined;

export function fDate(date: InputValue, newFormat?: string) {
    const fm = newFormat || 'dd/MM/yyyy';

    return date ? format(new Date(date), fm, { locale: vi }) : '';
}

export function fDateText(date: InputValue, newFormat?: string) {
    const fm = newFormat || 'ngày dd tháng MM năm yyyy';

    return date ? format(new Date(date), fm, { locale: vi }) : '';
}

export function fDateTime(date: InputValue, newFormat?: string) {
    const fm = newFormat || 'p dd/MM/yyyy';

    return date ? format(new Date(date), fm, { locale: vi }) : '';
}

export function fTimestamp(date: InputValue) {
    return date ? getTime(new Date(date)) : '';
}

export function fToNow(date: InputValue) {
    return date
        ? formatDistanceToNow(new Date(date), {
            addSuffix: false,
            locale: vi,
        })
        : '';
}

export function fToNowUTC0(date: InputValue) {
    return date
        ? formatDistanceToNow(
            add(new Date(date as any), {
                days: 1,
            }),
            {
                addSuffix: false,
                locale: vi,
            }
        )
        : '';
}


export function formatDate(
    date?: IDateValue | Date
): string {
    if (date == null) return '';

    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}