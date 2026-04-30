import { z as zod } from 'zod';

export const ContractPaymentSchema = zod.object({

});

export type ContractReceiptSchemaType = zod.infer<typeof ContractPaymentSchema>;