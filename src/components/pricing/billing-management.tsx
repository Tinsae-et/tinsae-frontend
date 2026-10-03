"use client";

import { useState } from "react";
import { Zap, Clock, Smartphone, Check, Plus } from "lucide-react";

import {
  BILLING_ACCOUNT,
  BILLING_INVOICES,
  type BillingAccount,
  type BillingInvoice,
} from "./data";

interface BillingManagementProps {
  account?: BillingAccount;
  invoices?: BillingInvoice[];
}

export function BillingManagement({
  account = BILLING_ACCOUNT,
  invoices = BILLING_INVOICES,
}: BillingManagementProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <section className="px-4 pt-20 pb-10 sm:px-6 sm:pt-24">
      <div className="mx-auto max-w-[1020px]">
        {/* Eyebrow and Heading */}
        <div className="text-center">
          <p className="text-tn-red mb-2 text-[11px] font-extrabold tracking-[0.14em] uppercase sm:text-xs">
            Your Account
          </p>
          <h2 className="text-tn-ink text-2xl leading-tight font-extrabold tracking-[-0.03em] sm:text-[32px]">
            Manage your billing
          </h2>
        </div>

        {/* Top Cards: Current Plan & Payment Method */}
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Current Plan Card */}
          <div className="border-tn-hair flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs sm:p-7">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-tn-mute text-[10px] font-extrabold tracking-[0.08em] uppercase sm:text-[11px]">
                  Current Plan
                </span>
                <span className="bg-tn-red-soft text-tn-red border-tn-red/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold">
                  <Zap className="fill-tn-red size-3" />
                  <span>{account.currentPlan}</span>
                </span>
              </div>

              <div className="mt-4 flex items-baseline">
                <span className="text-tn-mute mr-1.5 text-sm font-semibold">
                  ETB
                </span>
                <span className="font-tn-mono text-tn-ink text-[28px] font-extrabold leading-none sm:text-[32px]">
                  1,500
                </span>
                <span className="text-tn-mute ml-1 text-sm font-normal">
                  {account.interval}
                </span>
              </div>

              <div className="text-tn-mute mt-2.5 flex items-center gap-1.5 text-xs">
                <Clock className="size-3.5" />
                <span>Renews {account.renewalDate}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleAction("Plan options are shown in the cards above.")
                }
                className="bg-tn-ink hover:bg-black rounded-full px-5 py-2 text-xs font-bold text-white shadow-xs transition-all hover:-translate-y-px"
              >
                Change plan
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAction(
                    "Your plan renewal has been confirmed until July 1, 2026.",
                  )
                }
                className="border-tn-hair text-tn-ink hover:bg-neutral-50 rounded-full border bg-white px-5 py-2 text-xs font-bold shadow-xs transition-all"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="border-tn-hair flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-xs sm:p-7">
            <div>
              <span className="text-tn-mute block text-[10px] font-extrabold tracking-[0.08em] uppercase sm:text-[11px]">
                Payment Method
              </span>

              {/* Inner Payment Box */}
              <div className="border-tn-hair2 bg-tn-paper mt-4 flex items-center justify-between rounded-xl border p-3.5 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="border-tn-hair text-tn-ink flex size-9 items-center justify-center rounded-lg border bg-white shadow-xs">
                    <Smartphone className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-tn-ink text-sm font-bold">
                      {account.paymentMethod.provider}
                    </p>
                    <p className="font-tn-mono text-tn-mute text-xs">
                      {account.paymentMethod.accountNumber}
                    </p>
                  </div>
                </div>

                <div className="text-tn-green flex items-center gap-1.5 text-xs font-semibold">
                  <span className="bg-tn-green size-2 rounded-full" />
                  <span>{account.paymentMethod.status}</span>
                </div>
              </div>

              <p className="text-tn-mute mt-3 flex items-center gap-1 text-[11px]">
                <Plus className="size-3 shrink-0" />
                <span>Also supports CBE Birr &amp; bank transfer</span>
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  handleAction(
                    "Payment method modal opened: telebirr is configured.",
                  )
                }
                className="border-tn-hair text-tn-ink hover:bg-neutral-50 inline-flex items-center justify-center rounded-full border bg-white px-5 py-2 text-xs font-bold shadow-xs transition-all"
              >
                Update payment method
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Card: Billing History */}
        <div className="border-tn-hair mt-5 rounded-2xl border bg-white p-6 shadow-xs sm:p-7">
          <h3 className="text-tn-ink text-sm font-extrabold sm:text-base">
            Billing history
          </h3>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead>
                <tr className="border-tn-hair text-tn-mute border-b text-[10px] font-extrabold tracking-[0.08em] uppercase">
                  <th scope="col" className="pb-3 font-extrabold">
                    Invoice
                  </th>
                  <th scope="col" className="pb-3 font-extrabold">
                    Date
                  </th>
                  <th scope="col" className="pb-3 font-extrabold">
                    Plan
                  </th>
                  <th scope="col" className="pb-3 font-extrabold">
                    Amount
                  </th>
                  <th scope="col" className="pb-3 font-extrabold">
                    Status
                  </th>
                  <th scope="col" className="pb-3 text-right font-extrabold">
                    <span className="sr-only">Download</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-tn-hair/60 divide-y">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-neutral-50/50">
                    <td className="font-tn-mono text-tn-ink py-3.5 font-bold">
                      {inv.id}
                    </td>
                    <td className="text-tn-mute py-3.5">{inv.date}</td>
                    <td className="text-tn-ink2 py-3.5">{inv.plan}</td>
                    <td className="font-tn-mono text-tn-ink py-3.5 font-bold">
                      {inv.amount}
                    </td>
                    <td className="py-3.5">
                      <span className="bg-tn-green-soft text-tn-green inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
                        <Check className="size-3" strokeWidth={2.5} />
                        <span>{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          handleAction(`Downloading receipt ${inv.id}.pdf...`)
                        }
                        className="text-tn-red hover:text-tn-red-dark font-tn-mono font-bold transition-colors hover:underline"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action toast feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-tn-ink px-4 py-2.5 text-xs text-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
            {toastMessage}
          </div>
        )}
      </div>
    </section>
  );
}
