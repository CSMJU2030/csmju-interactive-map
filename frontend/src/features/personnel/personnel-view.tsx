"use client";

import { cardClass, inputClass } from "@/csmju";
import {
  SchoolIcon as GraduationCap,
  MailIcon as Mail,
  AccountCircleIcon as Phone,
  SearchIcon as Search,
  PersonIcon as UserRound,
  GroupIcon as UsersRound,
} from "@/csmju";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  Pagination,
} from "@/components/common/ui-feedback";
import { apiRequest } from "@/lib/api";
import type { Lecturer } from "@/types/api";

type PersonnelFilter = "ALL" | "TEACHER" | "STAFF";

const filters: Array<{ value: PersonnelFilter; label: string }> = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "TEACHER", label: "คณาจารย์" },
  { value: "STAFF", label: "เจ้าหน้าที่" },
];

export function PersonnelView() {
  const [personnel, setPersonnel] = useState<Lecturer[]>([]);
  const [filter, setFilter] = useState<PersonnelFilter>("ALL");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(
      () => {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({ limit: "20", page: String(page) });
        if (query.trim()) params.set("q", query.trim());
        if (filter !== "ALL") params.set("personnelType", filter);
        void apiRequest<Lecturer[]>("/api/v1/lecturers?" + params.toString())
          .then((response) => {
            if (active) {
              setPersonnel(response.data);
              setTotalPages(response.meta?.totalPages ?? 1);
            }
          })
          .catch((caught: unknown) => {
            if (active) setError(caught);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      },
      query ? 200 : 0,
    );
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, filter, page, retry]);

  return (
    <div className="space-y-8">
      <header>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-container/10 text-primary-container">
            <UsersRound width={20} height={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">
              คณาจารย์และเจ้าหน้าที่
            </h1>
            <p className="mt-1 text-on-surface-variant">
              สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้
            </p>
          </div>
        </div>
      </header>

      <section
        className={`${cardClass} flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="กรองประเภทบุคลากร"
        >
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
                setPage(1);
              }}
              className={`min-h-11 rounded-lg px-4 py-2 text-label-md font-semibold transition ${filter === value ? "bg-primary-container text-white" : "bg-surface text-on-surface-variant hover:bg-surface"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <span className="block pb-2 text-label-md">
            ค้นหาชื่อหรือรหัสบุคลากร
          </span>
          <Search
            className="absolute left-3.5 bottom-3 text-on-surface-variant"
            width={20}
            height={20}
            aria-hidden="true"
          />
          <input
            className={`${inputClass} w-full pl-10`}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="ชื่อหรือรหัสบุคลากร"
          />
        </label>
      </section>

      {Boolean(error) && (
        <ErrorState
          error={error}
          onRetry={() => setRetry((value) => value + 1)}
        />
      )}
      {loading && <LoadingState />}

      {!loading && !error && (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {personnel.map((person) => (
            <article key={person.id} className={`${cardClass} overflow-hidden`}>
              <div className="flex gap-4 p-5">
                {person.imageProfile ? (
                  <Image
                    src={person.imageProfile}
                    alt={`${person.title ?? ""}${person.nameTh}`}
                    width={96}
                    height={112}
                    className="h-28 w-24 shrink-0 rounded-xl bg-surface object-cover object-top"
                  />
                ) : (
                  <span className="grid h-28 w-24 shrink-0 place-items-center rounded-xl bg-surface text-on-surface-variant">
                    <UserRound width={20} height={20} aria-hidden="true" />
                  </span>
                )}
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-caption font-semibold ${person.personnelType === "TEACHER" ? "bg-primary-container/10 text-primary-container" : "bg-primary-container/10 text-primary-container"}`}
                  >
                    {person.personnelType === "TEACHER"
                      ? "คณาจารย์"
                      : "เจ้าหน้าที่"}
                  </span>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-on-surface">
                    {person.title}
                    {person.nameTh}
                  </h2>
                  {person.nameEn && (
                    <p className="mt-0.5 text-label-md text-on-surface-variant">
                      {person.nameEn}
                    </p>
                  )}
                  {person.positionAcademic && (
                    <p className="mt-2 text-label-md font-medium text-primary-container">
                      {person.positionAcademic}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2 border-t border-outline-variant/40 px-5 py-4 text-label-md text-on-surface-variant">
                {person.positionManager && <p>{person.positionManager}</p>}
                {person.education && (
                  <p className="flex gap-2">
                    <GraduationCap
                      className="mt-0.5 shrink-0 text-on-surface-variant"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                    <span>{person.education}</span>
                  </p>
                )}
                {person.email && (
                  <a
                    className="flex items-center gap-2 hover:text-primary-container"
                    href={`mailto:${person.email}`}
                  >
                    <Mail
                      className="shrink-0 text-on-surface-variant"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                    {person.email}
                  </a>
                )}
                {person.phone && (
                  <a
                    className="flex items-center gap-2 hover:text-primary-container"
                    href={`tel:${person.phone.replace(/[^0-9+]/g, "")}`}
                  >
                    <Phone
                      className="shrink-0 text-on-surface-variant"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />
                    {person.phone}
                  </a>
                )}
              </div>
            </article>
          ))}
          {!personnel.length && (
            <div className="col-span-full">
              <EmptyState
                search={Boolean(query || filter !== "ALL")}
                onClear={() => {
                  setQuery("");
                  setFilter("ALL");
                  setPage(1);
                }}
              />
            </div>
          )}
        </div>
      )}

      {!loading && !error && (
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      )}
      <p className="text-caption text-on-surface-variant">
        ข้อมูลอ้างอิงจากเว็บไซต์สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้
      </p>
    </div>
  );
}
