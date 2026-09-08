"use client";

import React, { ChangeEvent, useState } from "react";
import Link from "next/link";
import { Icon, IconName } from "@/components/tinsae/icon";
import { ChevronDown, FileText } from "lucide-react";
import { submitVerification } from "@/hooks/use-verification";
import {
  formatVerificationDate,
  validateVerificationDetail,
  type VerificationFieldError,
  type VerificationState,
} from "@/lib/verification";

type STATUS_TAGS = "verified" | "action" | "locked" | "review";

type Props = {
  slug: string;
  state: VerificationState;
  supportingDetail?: string;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  isVerified?: boolean;
  onSuccess?: () => void;
};

function StatusTag({ status }: { status: STATUS_TAGS }) {
  if (status === "verified") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <Icon name="check" className="h-3 w-3" strokeWidth={3} />
        Verified
      </span>
    );
  }
  if (status === "action") {
    return (
      <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600">
        Action needed
      </span>
    );
  }
  if (status === "review") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
        <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
        Under review
      </span>
    );
  }
  return <span className="text-xs font-medium text-neutral-400">Locked</span>;
}

function StepOverview({
  icon,
  status,
  number,
  title,
  description,
  isOpen,
  setOpenStep,
}: {
  icon: IconName;
  status: STATUS_TAGS;
  number: number;
  title: string;
  description: string;
  isOpen: boolean;
  setOpenStep: (open: string | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => status !== "locked" && setOpenStep(isOpen ? null : title)}
      disabled={status === "locked"}
      className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left disabled:cursor-not-allowed"
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 ${
          status === "verified"
            ? "border-emerald-500 bg-emerald-50 text-emerald-600"
            : status === "action"
              ? "border-orange-500 bg-orange-50 text-orange-600"
              : status === "review"
                ? "border-amber-500 bg-amber-50 text-amber-600"
                : "border-neutral-200 bg-neutral-50 text-neutral-300"
        }`}
      >
        <Icon name={icon} className="w-4 h-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 font-mono">
            Step {number}
          </span>
          <span
            className={`font-semibold text-sm sm:text-base ${
              status === "locked" ? "text-neutral-400" : "text-neutral-900"
            }`}
          >
            {title}
          </span>
        </div>
        <p
          className={`mt-0.5 text-xs sm:text-sm ${
            status === "locked" ? "text-neutral-300" : "text-neutral-500"
          }`}
        >
          {description}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <StatusTag status={status} />
        {status !== "locked" && (
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
    </button>
  );
}

function PhoneAndTelegram({
  openStep,
  setOpenStep,
}: {
  openStep: string | null;
  setOpenStep: (step: string | null) => void;
}) {
  const isOpen = openStep === "Phone and Telegram";
  return (
    <div
      className={`rounded-2xl border bg-white transition-colors ${
        isOpen ? "border-neutral-900" : "border-neutral-200"
      }`}
    >
      <StepOverview
        icon="phone"
        status="verified"
        number={1}
        title="Phone and Telegram"
        description="Your number is confirmed and the Tinsae bot is linked to this shop."
        isOpen={isOpen}
        setOpenStep={setOpenStep}
      />
    </div>
  );
}

function DocumentStep({
  slug,
  state,
  supportingDetail,
  rejectionReason,
  submittedAt,
  reviewedAt,
  isVerified,
  openStep,
  setOpenStep,
  onSuccess,
}: {
  slug: string;
  state: VerificationState;
  supportingDetail?: string;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  isVerified?: boolean;
  openStep: string | null;
  setOpenStep: (step: string | null) => void;
  onSuccess?: () => void;
}) {
  const isOpen = openStep === "Business documents";
  const verified = isVerified || state === "approved";
  const pending = state === "pending";
  const rejected = state === "rejected";

  const status: STATUS_TAGS = verified
    ? "verified"
    : pending
      ? "review"
      : "action";

  const [licenseName, setLicenseName] = useState<string | null>(null);
  const [faydaName, setFaydaName] = useState<string | null>(null);
  const [detail, setDetail] = useState(supportingDetail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<VerificationFieldError | null>(null);

  const uploadLicense = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLicenseName(file.name);
  };

  const uploadFayda = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFaydaName(file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Compose details with document names if attached
    let fullDetail = detail.trim();
    const docTags: string[] = [];
    if (licenseName) docTags.push(`Trade License: ${licenseName}`);
    if (faydaName) docTags.push(`Owner ID / Fayda: ${faydaName}`);

    if (docTags.length > 0 && !fullDetail.includes(licenseName || "") && !fullDetail.includes(faydaName || "")) {
      fullDetail = fullDetail ? `${fullDetail} [Attached: ${docTags.join(", ")}]` : `Attached: ${docTags.join(", ")}`;
    }

    const validation = validateVerificationDetail(fullDetail);
    if (!validation.valid && validation.error) {
      setErrors({
        supporting_detail: [validation.error],
      });
      return;
    }

    setIsSubmitting(true);
    setErrors(null);

    try {
      await submitVerification(slug, fullDetail);
      onSuccess?.();
    } catch (err: unknown) {
      if (err && typeof err === "object") {
        setErrors(err as VerificationFieldError);
      } else {
        setErrors({ detail: "An error occurred while submitting your request." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border bg-white transition-colors ${
        isOpen ? "border-neutral-900 shadow-xs" : "border-neutral-200"
      }`}
    >
      <StepOverview
        icon="spec"
        status={status}
        number={2}
        title="Business documents"
        description="Trade license and owner ID, so buyers know there's a real business behind the listings."
        isOpen={isOpen}
        setOpenStep={setOpenStep}
      />

      {isOpen && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4">
          {/* Verified State */}
          {verified && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Icon name="check" className="h-4 w-4" />
                Verified Business Credentials
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                Your trade license and identity documents have been inspected and confirmed by
                Tinsae Compliance.
                {reviewedAt && ` Verified on ${formatVerificationDate(reviewedAt)}.`}
              </p>
            </div>
          )}

          {/* Pending State */}
          {pending && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                  Under Manual Review
                </span>
                {submittedAt && (
                  <span className="text-[11px] text-neutral-500">
                    Submitted {formatVerificationDate(submittedAt)}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-neutral-700 leading-relaxed">
                Your documents and business details are currently being reviewed by a Tinsae
                compliance specialist. Turnaround is typically 24–48 hours. You will be notified via
                Telegram once review is complete.
              </p>
              {supportingDetail && (
                <div className="mt-3 rounded-lg border border-amber-200/80 bg-white p-3 font-mono text-[11px] text-neutral-700 whitespace-pre-wrap">
                  {supportingDetail}
                </div>
              )}
            </div>
          )}

          {/* Rejected feedback alert */}
          {rejected && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-900">
                  Application Needs Attention
                </span>
                {reviewedAt && (
                  <span className="text-[11px] text-neutral-500">
                    Reviewed {formatVerificationDate(reviewedAt)}
                  </span>
                )}
              </div>
              {rejectionReason && (
                <div className="mt-2 rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-800">
                  <span className="font-bold">Reviewer Feedback: </span>
                  {rejectionReason}
                </div>
              )}
              <p className="mt-2 text-xs text-neutral-600">
                Please update your business information or documents below and resubmit.
              </p>
            </div>
          )}

          {/* Form shown for not_submitted and rejected */}
          {!verified && !pending && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errors?.detail && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {errors.detail}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 py-6 hover:bg-neutral-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={uploadLicense}
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-500 shadow-xs">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-neutral-800">
                      Trade license
                    </div>
                    <div className="text-xs text-neutral-400">
                      {licenseName ? (
                        <span className="text-emerald-600 font-medium">✓ {licenseName}</span>
                      ) : (
                        "PDF or photo"
                      )}
                    </div>
                  </div>
                </label>

                <label className="flex flex-col cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/70 py-6 hover:bg-neutral-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={uploadFayda}
                  />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-neutral-500 shadow-xs">
                    <Icon name="user" className="h-4 w-4" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-neutral-800">
                      Owner ID / Fayda
                    </div>
                    <div className="text-xs text-neutral-400">
                      {faydaName ? (
                        <span className="text-emerald-600 font-medium">✓ {faydaName}</span>
                      ) : (
                        "Front & back"
                      )}
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label
                  htmlFor="supporting_detail"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider font-mono"
                >
                  Business TIN &amp; Registration Details
                </label>
                <div className="mt-1.5">
                  <textarea
                    id="supporting_detail"
                    rows={3}
                    value={detail}
                    onChange={(e) => {
                      setDetail(e.target.value);
                      if (errors?.supporting_detail) {
                        setErrors((prev) => (prev ? { ...prev, supporting_detail: undefined } : null));
                      }
                    }}
                    placeholder="e.g. Business TIN: 0098765432, Addis Ababa Trade Bureau License #14/2016, Storefront location notes..."
                    className={`w-full rounded-xl border p-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 transition-colors ${
                      errors?.supporting_detail
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-neutral-200 bg-white"
                    }`}
                  />
                </div>

                {errors?.supporting_detail && (
                  <p className="mt-1 text-xs font-semibold text-rose-600">
                    {errors.supporting_detail[0]}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-full bg-tn-red px-5 py-2.5 text-sm font-semibold text-white shadow-tn-red hover:shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
                      {rejected ? "Resubmit documents" : "Submit documents"}
                    </>
                  )}
                </button>
                <span className="text-sm text-neutral-400">
                  Reviewed within 1 business day.
                </span>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function StoreFront({
  openStep,
  setOpenStep,
  isVerified,
}: {
  openStep: string | null;
  setOpenStep: (step: string | null) => void;
  isVerified?: boolean;
}) {
  const isOpen = openStep === "Storefront & location";
  const status: STATUS_TAGS = isVerified ? "verified" : "action";

  return (
    <div
      className={`rounded-2xl border bg-white transition-colors ${
        isOpen ? "border-neutral-900" : "border-neutral-200"
      }`}
    >
      <StepOverview
        icon="building"
        status={status}
        number={3}
        title="Storefront & location"
        description="A map pin in Bole and two photos of your physical shop."
        isOpen={isOpen}
        setOpenStep={setOpenStep}
      />
      {isOpen && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4 text-xs text-neutral-600 leading-relaxed">
          <p>
            Physical retail stores in Addis Ababa (Bole, Piazza, Mercato, etc.) are verified on-site
            to confirm walk-in availability and stock authenticity.
          </p>
          <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5">
            <span className="font-semibold text-neutral-800">
              Location check scheduled during manual review.
            </span>{" "}
            Make sure your shop address is up to date in your{" "}
            <Link href="/shop/dashboard/shop-profile" className="font-bold text-tn-ink underline">
              Shop profile
            </Link>
            .
          </div>
        </div>
      )}
    </div>
  );
}

function InPerson({
  openStep,
  setOpenStep,
  isVerified,
}: {
  openStep: string | null;
  setOpenStep: (step: string | null) => void;
  isVerified?: boolean;
}) {
  const isOpen = openStep === "In-person check";
  const status: STATUS_TAGS = isVerified ? "verified" : "locked";

  return (
    <div
      className={`rounded-2xl border bg-white transition-colors ${
        isOpen ? "border-neutral-900" : "border-neutral-200"
      }`}
    >
      <StepOverview
        icon="phone"
        status={status}
        number={4}
        title="In-person check"
        description="A Tinsae agent visits to confirm the shop exists and meets standards — the final step."
        isOpen={isOpen}
        setOpenStep={setOpenStep}
      />
      {isOpen && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4 text-xs text-neutral-600">
          A Tinsae compliance agent visits your physical store after document inspection to award
          the verified merchant badge.
        </div>
      )}
    </div>
  );
}

export default function Steps({
  slug,
  state,
  supportingDetail,
  rejectionReason,
  submittedAt,
  reviewedAt,
  isVerified,
  onSuccess,
}: Props) {
  // Open Step 2 (Business documents) by default per Figma design
  const [openStep, setOpenStep] = useState<string | null>("Business documents");

  return (
    <div className="space-y-3">
      <PhoneAndTelegram openStep={openStep} setOpenStep={setOpenStep} />

      <DocumentStep
        slug={slug}
        state={state}
        supportingDetail={supportingDetail}
        rejectionReason={rejectionReason}
        submittedAt={submittedAt}
        reviewedAt={reviewedAt}
        isVerified={isVerified}
        openStep={openStep}
        setOpenStep={setOpenStep}
        onSuccess={onSuccess}
      />

      <StoreFront
        openStep={openStep}
        setOpenStep={setOpenStep}
        isVerified={isVerified || state === "approved"}
      />

      <InPerson
        openStep={openStep}
        setOpenStep={setOpenStep}
        isVerified={isVerified || state === "approved"}
      />
    </div>
  );
}