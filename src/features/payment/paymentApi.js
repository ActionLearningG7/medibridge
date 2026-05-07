/**
 * Payment API
 * RTK Query endpoints for PaymentController
 */

import { baseApi } from '../../app/api/baseApi';

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * POST /api/v1/payments/checkout/{invoiceId}
         * Initiate checkout and get Stripe client secret
         */
        initiateCheckout: builder.mutation({
            query: ({ invoiceId, successUrl, cancelUrl }) => ({
                url: `/api/v1/payments/checkout/${invoiceId}`,
                method: 'POST',
                body: { successUrl, cancelUrl },
            }),
            invalidatesTags: ['Invoice'],
        }),

        /**
         * GET /api/v1/payments/invoices/{invoiceId}
         * Get details of a specific invoice
         */
        getInvoiceById: builder.query({
            query: (invoiceId) => `/api/v1/payments/invoices/${invoiceId}`,
            providesTags: (result, error, invoiceId) => [
                { type: 'Invoice', id: invoiceId },
            ],
        }),

        /**
         * GET /api/v1/payments/my-invoices
         * Get all invoices for the current patient
         */
        getMyInvoices: builder.query({
            query: () => '/api/v1/payments/my-invoices',
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Invoice', id })),
                        { type: 'Invoice', id: 'LIST' },
                    ]
                    : [{ type: 'Invoice', id: 'LIST' }],
        }),

        /**
         * POST /api/v1/payments/verify-status
         * Manually trigger a payment verification check
         */
        verifyPaymentStatus: builder.mutation({
            query: ({ type, id }) => ({
                url: `/api/v1/payments/verify-status?type=${type}&id=${id}`,
                method: 'POST',
            }),
            invalidatesTags: ['Invoice', 'Appointment', 'LabOrder'],
        }),
    }),
});

export const {
    useInitiateCheckoutMutation,
    useGetInvoiceByIdQuery,
    useGetMyInvoicesQuery,
    useVerifyPaymentStatusMutation,
} = paymentApi;

export default paymentApi;
