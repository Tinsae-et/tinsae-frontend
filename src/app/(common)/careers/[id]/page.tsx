import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CAREERS_EMAIL,
  getRoleById,
  RoleType,
  ROLES,
} from "@/components/careers/data";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return ROLES.map((role) => ({
    id: role.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const role = getRoleById(id);

  if (!role) {
    return {
      title: "Role Not Found — Careers at Tinsae",
      description: "The requested job opening could not be found.",
    };
  }

  const title = `${role.title} — Careers at Tinsae`;
  const description = role.summary;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tinsae.et/careers/${role.id}`,
      siteName: "Tinsae",
      type: "article",
    },
  };
}

const employmentTypeMap: Record<RoleType, string> = {
  "full-time": "FULL_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export default async function RoleDetailPage({ params }: Props) {
  const { id } = await params;
  const role = getRoleById(id);

  if (!role) {
    notFound();
  }

  const applySubject = `Application for ${role.title}`;
  const applyMailto = `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(
    applySubject
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: role.title,
    description: `
      <p>${role.summary}</p>
      <h3>Responsibilities</h3>
      <ul>
        ${role.responsibilities.map((r) => `<li>${r}</li>`).join("")}
      </ul>
      <h3>Requirements</h3>
      <ul>
        ${role.requirements.map((r) => `<li>${r}</li>`).join("")}
      </ul>
      ${
        role.niceToHave.length > 0
          ? `<h3>Nice to Have</h3><ul>${role.niceToHave
              .map((r) => `<li>${r}</li>`)
              .join("")}</ul>`
          : ""
      }
    `.trim(),
    datePosted: role.postedAt,
    validThrough: "2026-12-31T23:59:59Z",
    employmentType: employmentTypeMap[role.type] || "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: "Tinsae",
      sameAs: "https://tinsae.et",
      logo: "https://tinsae.et/tinsae-logo.svg",
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Addis Ababa",
        addressRegion: "Addis Ababa",
        addressCountry: "ET",
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Ethiopia",
    },
    directApply: true,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data for Google Jobs */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top Breadcrumb & Hero */}
      <section className="border-b border-tn-hair bg-tn-paper/40 px-4 pt-8 pb-12 sm:px-8 sm:pt-10 sm:pb-14 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div>
            <Link
              href="/careers"
              className="text-tn-mute hover:text-tn-red inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              <Icon name="back" size={16} />
              <span>Back to all open roles</span>
            </Link>
          </div>

          <div className="mt-6 max-w-[900px]">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-tn-red text-xs font-bold uppercase tracking-wider">
                {role.department}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-tn-mute">
                <Icon name="pin" size={13} />
                {role.location}
              </span>
              <span className="text-neutral-300">·</span>
              <span className="font-tn-mono text-xs capitalize text-tn-mute">
                {role.type}
              </span>
              {role.urgent && (
                <span className="rounded-full bg-tn-red-soft px-2.5 py-0.5 text-xs font-bold text-tn-red">
                  Urgent hiring
                </span>
              )}
              {role.openings && (
                <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-800">
                  {role.openings} openings
                </span>
              )}
            </div>

            <h1 className="text-tn-ink mt-3 text-[32px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[44px] lg:text-[50px]">
              {role.title}
            </h1>

            <p className="text-tn-mute mt-4 max-w-2xl text-base leading-relaxed font-medium sm:text-lg">
              {role.summary}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Pill
                kind="solid"
                size="lg"
                icon="msg"
                href={applyMailto}
              >
                Apply for this role
              </Pill>
              <Pill
                kind="outline"
                size="lg"
                icon="tg"
                href="https://t.me/TinsaeJobs"
              >
                Message on Telegram
              </Pill>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="px-4 py-12 sm:px-8 sm:py-16 lg:px-12 xl:px-16">
        <div className="mx-auto max-w-[1480px]">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            {/* Left Column: Details */}
            <div className="space-y-12">
              {/* Responsibilities */}
              <div>
                <h2 className="text-tn-ink text-2xl font-extrabold tracking-tight">
                  What you&apos;ll do
                </h2>
                <ul className="mt-6 space-y-3.5">
                  {role.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tn-red-soft text-tn-red">
                        <Icon name="check" size={12} />
                      </span>
                      <span className="text-tn-ink2 text-[15.5px] leading-relaxed font-medium">
                        {resp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div className="border-t border-tn-hair pt-10">
                <h2 className="text-tn-ink text-2xl font-extrabold tracking-tight">
                  What we&apos;re looking for
                </h2>
                <ul className="mt-6 space-y-3.5">
                  {role.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tn-paper text-tn-ink2">
                        <span className="h-1.5 w-1.5 rounded-full bg-tn-ink2" />
                      </span>
                      <span className="text-tn-ink2 text-[15.5px] leading-relaxed font-medium">
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to have */}
              {role.niceToHave.length > 0 && (
                <div className="border-t border-tn-hair pt-10">
                  <h2 className="text-tn-ink text-2xl font-extrabold tracking-tight">
                    Nice to have
                  </h2>
                  <ul className="mt-6 space-y-3.5">
                    {role.niceToHave.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-tn-paper text-tn-mute">
                          <span className="h-1.5 w-1.5 rounded-full bg-tn-mute" />
                        </span>
                        <span className="text-tn-mute text-[15.5px] leading-relaxed font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* How to Apply Card */}
              <div className="border-tn-hair rounded-3xl border bg-tn-paper p-7 sm:p-9">
                <h3 className="text-tn-ink text-xl font-bold tracking-tight">
                  Ready to apply?
                </h3>
                <p className="text-tn-mute mt-2.5 text-sm leading-relaxed font-medium sm:text-base">
                  Send an email to{" "}
                  <a
                    href={applyMailto}
                    className="text-tn-red font-semibold underline underline-offset-4"
                  >
                    {CAREERS_EMAIL}
                  </a>{" "}
                  with &ldquo;{applySubject}&rdquo; as your subject. Tell us a bit
                  about what you have built or organized, and attach your resume or
                  portfolio link.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Pill kind="solid" size="md" icon="msg" href={applyMailto}>
                    Send application email
                  </Pill>
                  <Pill
                    kind="outline"
                    size="md"
                    icon="tg"
                    href="https://t.me/TinsaeJobs"
                  >
                    Message @TinsaeJobs
                  </Pill>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Overview Sidebar */}
            <div>
              <div className="sticky top-24 space-y-6">
                <div className="border-tn-hair rounded-2xl border bg-white p-6 shadow-xs">
                  <h3 className="text-tn-ink text-base font-bold">
                    Role at a glance
                  </h3>

                  <dl className="mt-5 space-y-4 text-sm">
                    <div className="flex justify-between border-b border-tn-hair pb-3">
                      <dt className="text-tn-mute">Department</dt>
                      <dd className="text-tn-ink font-semibold">
                        {role.department}
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-tn-hair pb-3">
                      <dt className="text-tn-mute">Location</dt>
                      <dd className="text-tn-ink font-semibold">
                        {role.location}
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-tn-hair pb-3">
                      <dt className="text-tn-mute">Employment Type</dt>
                      <dd className="font-tn-mono text-tn-ink font-semibold capitalize">
                        {role.type}
                      </dd>
                    </div>

                    <div className="flex justify-between border-b border-tn-hair pb-3">
                      <dt className="text-tn-mute">Hiring Speed</dt>
                      <dd className="text-tn-ink font-semibold">
                        10-day decision
                      </dd>
                    </div>

                    <div className="flex justify-between pb-1">
                      <dt className="text-tn-mute">Take-home task</dt>
                      <dd className="text-emerald-700 font-semibold">
                        Paid (~4 hours)
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-6 border-t border-tn-hair pt-6">
                    <Pill
                      kind="solid"
                      size="md"
                      icon="msg"
                      href={applyMailto}
                      className="w-full"
                    >
                      Apply now
                    </Pill>
                  </div>
                </div>

                <div className="border-tn-hair rounded-2xl border bg-tn-paper/70 p-6">
                  <h4 className="text-tn-ink text-sm font-bold">
                    The practical part
                  </h4>
                  <ul className="text-tn-mute mt-3 space-y-2 text-xs font-medium">
                    <li>• Equipment: choice of laptop and work phone</li>
                    <li>• Learning: ETB 25,000/year to spend</li>
                    <li>• Time off: 22 days + public holidays</li>
                    <li>• Health: full medical cover for family</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
