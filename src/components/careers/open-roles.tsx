"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CAREERS_EMAIL, Role } from "@/components/careers/data";
import { Icon } from "@/components/tinsae/icon";
import { Pill } from "@/components/tinsae/pill";

type Props = {
  roles: Role[];
};

export default function OpenRoles({ roles }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(roles.map((r) => r.location)));
  }, [roles]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(roles.map((r) => r.type)));
  }, [roles]);

  const showLocationFilter = uniqueLocations.length > 1;
  const showTypeFilter = uniqueTypes.length > 1;

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      if (selectedLocation !== "all" && role.location !== selectedLocation) {
        return false;
      }
      if (selectedType !== "all" && role.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [roles, selectedLocation, selectedType]);

  const groupedRoles = useMemo(() => {
    const map = new Map<string, Role[]>();
    for (const role of filteredRoles) {
      const dept = role.department;
      if (!map.has(dept)) {
        map.set(dept, []);
      }
      map.get(dept)!.push(role);
    }
    return map;
  }, [filteredRoles]);

  const totalCount = roles.length;
  const countText =
    totalCount === 1
      ? "1 role"
      : totalCount === 6
        ? "Six roles, all in Addis."
        : `${totalCount} roles, all in Addis.`;

  return (
    <section
      id="roles"
      className="scroll-mt-24 border-t border-tn-hair px-4 py-14 sm:px-8 sm:py-16 lg:px-12 xl:px-16"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="max-w-[720px]">
          <p className="text-tn-red text-[13px] font-bold tracking-[0.11em] uppercase">
            Open roles
          </p>
          <h2 className="text-tn-ink mt-3 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] sm:text-[40px]">
            {totalCount > 0 ? countText : "No open roles right now."}
          </h2>
          <p className="text-tn-mute mt-4 max-w-[620px] text-base leading-relaxed font-medium sm:text-[17px]">
            No remote-first roles right now — the verification model needs
            people who can be inside a shop by Tuesday.
          </p>
        </div>

        {/* Filters if more than 1 value exists */}
        {(showLocationFilter || showTypeFilter) && (
          <div
            className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-tn-hair bg-tn-paper/70 p-4"
            role="toolbar"
            aria-label="Filter open roles"
          >
            {showLocationFilter && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-tn-mono text-tn-mute text-xs font-semibold uppercase tracking-wider">
                  Location:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedLocation("all")}
                  aria-pressed={selectedLocation === "all"}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedLocation === "all"
                      ? "bg-tn-ink text-white"
                      : "border border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                  }`}
                >
                  All ({roles.length})
                </button>
                {uniqueLocations.map((loc) => {
                  const count = roles.filter((r) => r.location === loc).length;
                  const isSelected = selectedLocation === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedLocation(loc)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                        isSelected
                          ? "bg-tn-ink text-white"
                          : "border border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                      }`}
                    >
                      {loc} ({count})
                    </button>
                  );
                })}
              </div>
            )}

            {showTypeFilter && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-tn-mono text-tn-mute text-xs font-semibold uppercase tracking-wider">
                  Type:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedType("all")}
                  aria-pressed={selectedType === "all"}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    selectedType === "all"
                      ? "bg-tn-ink text-white"
                      : "border border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                  }`}
                >
                  All
                </button>
                {uniqueTypes.map((typ) => {
                  const count = roles.filter((r) => r.type === typ).length;
                  const isSelected = selectedType === typ;
                  return (
                    <button
                      key={typ}
                      type="button"
                      onClick={() => setSelectedType(typ)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        isSelected
                          ? "bg-tn-ink text-white"
                          : "border border-tn-hair bg-white text-tn-ink2 hover:bg-tn-paper"
                      }`}
                    >
                      {typ} ({count})
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Roles grouped by department */}
        <div className="mt-8 space-y-10">
          {roles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-tn-hair bg-white p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-tn-red-soft text-tn-red">
                <Icon name="pulse" size={24} />
              </div>
              <h3 className="text-tn-ink mt-4 text-lg font-bold">
                No open roles right now
              </h3>
              <p className="text-tn-mute mx-auto mt-2 max-w-md text-sm leading-relaxed">
                We don&apos;t have any listings open today, but we are always
                looking for thoughtful people. Reach out below with what you
                would do here.
              </p>
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-tn-hair bg-white p-10 text-center">
              <h3 className="text-tn-ink text-base font-bold">
                No roles match your selected filters
              </h3>
              <p className="text-tn-mute mt-1.5 text-sm">
                Try selecting &ldquo;All&rdquo; to view all available positions.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocation("all");
                  setSelectedType("all");
                }}
                className="text-tn-red mt-4 inline-flex items-center text-xs font-bold uppercase tracking-wider hover:underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            Array.from(groupedRoles.entries()).map(([dept, deptRoles]) => (
              <div key={dept} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-tn-ink text-base font-extrabold tracking-tight sm:text-lg">
                    {dept}
                  </h3>
                  <span className="font-tn-mono text-tn-mute text-xs">
                    ({deptRoles.length})
                  </span>
                  <div className="h-px flex-1 bg-tn-hair" />
                </div>

                <div className="space-y-3">
                  {deptRoles.map((role) => (
                    <Link
                      key={role.id}
                      href={`/careers/${role.id}`}
                      className={`group flex flex-col gap-4 rounded-2xl border bg-white p-5 transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-sm sm:p-6 lg:grid lg:grid-cols-[1fr_150px_150px_120px_40px] lg:items-center lg:gap-4.5 ${
                        role.urgent
                          ? "border-[#FBD9C7] hover:border-tn-red/40"
                          : "border-tn-hair hover:border-tn-ink2/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h4 className="text-tn-ink group-hover:text-tn-red text-[17px] font-extrabold tracking-tight transition-colors">
                            {role.title}
                          </h4>
                          {role.openings && (
                            <span className="rounded-full bg-tn-red-soft px-2.5 py-0.5 text-xs font-bold text-tn-red">
                              {role.openings} openings
                            </span>
                          )}
                        </div>
                        <p className="text-tn-mute mt-1.5 line-clamp-2 max-w-[560px] text-[13.5px] leading-relaxed font-medium">
                          {role.summary}
                        </p>
                      </div>

                      <div className="text-tn-ink2 text-[13px] font-semibold">
                        {role.department}
                      </div>

                      <div className="text-tn-mute inline-flex items-center gap-1.5 text-[13px] font-medium">
                        <Icon name="pin" size={13} className="text-tn-mute shrink-0" />
                        <span>{role.location}</span>
                      </div>

                      <div className="font-tn-mono text-tn-mute text-[12px] capitalize">
                        {role.type}
                      </div>

                      <div className="flex justify-end">
                        <Icon
                          name="arrow"
                          size={17}
                          className="text-tn-red transition-transform duration-150 group-hover:translate-x-1"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* General Application Contact strip — shown whether or not roles are listed */}
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-tn-hair bg-tn-paper p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 shrink-0 text-tn-red">
              <Icon name="msg" size={20} />
            </div>
            <div>
              <p className="text-tn-ink text-sm font-bold sm:text-[15px]">
                Nothing fits, but you want in?
              </p>
              <p className="text-tn-mute mt-1 max-w-2xl text-xs leading-relaxed font-medium sm:text-sm">
                Tell us what you would do here and why. We have created roles
                off the back of a good message before.
              </p>
            </div>
          </div>
          <Pill
            kind="dark"
            size="sm"
            icon="msg"
            href={`mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(
              "General Application — Tinsae"
            )}`}
            className="shrink-0"
          >
            Write to us
          </Pill>
        </div>
      </div>
    </section>
  );
}