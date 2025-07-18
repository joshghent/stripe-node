// File generated from our OpenAPI spec

declare module 'stripe' {
  namespace Stripe {
    /**
     * The DeletedInvoiceItem object.
     */
    interface DeletedInvoiceItem {
      /**
       * Unique identifier for the object.
       */
      id: string;

      /**
       * String representing the object's type. Objects of the same type share the same value.
       */
      object: 'invoiceitem';

      /**
       * Always true for a deleted object
       */
      deleted: true;
    }

    /**
     * Invoice Items represent the component lines of an [invoice](https://stripe.com/docs/api/invoices). When you create an invoice item with an `invoice` field, it is attached to the specified invoice and included as [an invoice line item](https://stripe.com/docs/api/invoices/line_item) within [invoice.lines](https://stripe.com/docs/api/invoices/object#invoice_object-lines).
     *
     * Invoice Items can be created before you are ready to actually send the invoice. This can be particularly useful when combined
     * with a [subscription](https://stripe.com/docs/api/subscriptions). Sometimes you want to add a charge or credit to a customer, but actually charge
     * or credit the customer's card only at the end of a regular billing cycle. This is useful for combining several charges
     * (to minimize per-transaction fees), or for having Stripe tabulate your usage-based billing totals.
     *
     * Related guides: [Integrate with the Invoicing API](https://stripe.com/docs/invoicing/integration), [Subscription Invoices](https://stripe.com/docs/billing/invoices/subscription#adding-upcoming-invoice-items).
     */
    interface InvoiceItem {
      /**
       * Unique identifier for the object.
       */
      id: string;

      /**
       * String representing the object's type. Objects of the same type share the same value.
       */
      object: 'invoiceitem';

      /**
       * Amount (in the `currency` specified) of the invoice item. This should always be equal to `unit_amount * quantity`.
       */
      amount: number;

      /**
       * Three-letter [ISO currency code](https://www.iso.org/iso-4217-currency-codes.html), in lowercase. Must be a [supported currency](https://stripe.com/docs/currencies).
       */
      currency: string;

      /**
       * The ID of the customer who will be billed when this invoice item is billed.
       */
      customer: string | Stripe.Customer | Stripe.DeletedCustomer;

      /**
       * Time at which the object was created. Measured in seconds since the Unix epoch.
       */
      date: number;

      /**
       * Always true for a deleted object
       */
      deleted?: void;

      /**
       * An arbitrary string attached to the object. Often useful for displaying to users.
       */
      description: string | null;

      /**
       * If true, discounts will apply to this invoice item. Always false for prorations.
       */
      discountable: boolean;

      /**
       * The discounts which apply to the invoice item. Item discounts are applied before invoice discounts. Use `expand[]=discounts` to expand each discount.
       */
      discounts: Array<string | Stripe.Discount> | null;

      /**
       * The ID of the invoice this invoice item belongs to.
       */
      invoice: string | Stripe.Invoice | null;

      /**
       * Has the value `true` if the object exists in live mode or the value `false` if the object exists in test mode.
       */
      livemode: boolean;

      /**
       * Set of [key-value pairs](https://stripe.com/docs/api/metadata) that you can attach to an object. This can be useful for storing additional information about the object in a structured format.
       */
      metadata: Stripe.Metadata | null;

      /**
       * The parent that generated this invoice item.
       */
      parent: InvoiceItem.Parent | null;

      period: InvoiceItem.Period;

      /**
       * The pricing information of the invoice item.
       */
      pricing: InvoiceItem.Pricing | null;

      /**
       * Whether the invoice item was created automatically as a proration adjustment when the customer switched plans.
       */
      proration: boolean;

      /**
       * Quantity of units for the invoice item. If the invoice item is a proration, the quantity of the subscription that the proration was computed for.
       */
      quantity: number;

      /**
       * The tax rates which apply to the invoice item. When set, the `default_tax_rates` on the invoice do not apply to this invoice item.
       */
      tax_rates: Array<Stripe.TaxRate> | null;

      /**
       * ID of the test clock this invoice item belongs to.
       */
      test_clock: string | Stripe.TestHelpers.TestClock | null;
    }

    namespace InvoiceItem {
      interface Parent {
        /**
         * Details about the subscription that generated this invoice item
         */
        subscription_details: Parent.SubscriptionDetails | null;

        /**
         * The type of parent that generated this invoice item
         */
        type: 'subscription_details';
      }

      namespace Parent {
        interface SubscriptionDetails {
          /**
           * The subscription that generated this invoice item
           */
          subscription: string;

          /**
           * The subscription item that generated this invoice item
           */
          subscription_item?: string;
        }
      }

      interface Period {
        /**
         * The end of the period, which must be greater than or equal to the start. This value is inclusive.
         */
        end: number;

        /**
         * The start of the period. This value is inclusive.
         */
        start: number;
      }

      interface Pricing {
        price_details?: Pricing.PriceDetails;

        /**
         * The type of the pricing details.
         */
        type: 'price_details';

        /**
         * The unit amount (in the `currency` specified) of the item which contains a decimal value with at most 12 decimal places.
         */
        unit_amount_decimal: string | null;
      }

      namespace Pricing {
        interface PriceDetails {
          /**
           * The ID of the price this item is associated with.
           */
          price: string;

          /**
           * The ID of the product this item is associated with.
           */
          product: string;
        }
      }
    }
  }
}
