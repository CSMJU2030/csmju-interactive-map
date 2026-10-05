"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader, LocationIcon, cardClass, inputClass } from "@/csmju";
import { apiRequest } from "@/lib/api";
import { categoryLabels } from "@/lib/categories";
import type { Place } from "@/types/api";
import {
  LoadingState,
  EmptyState,
  ErrorState,
  Pagination,
} from "@/components/common/ui-feedback";
export function LocationsView() {
  const [places, setPlaces] = useState<Place[]>([]),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [totalPages, setTotalPages] = useState(1),
    [loading, setLoading] = useState(true),
    [failure, setFailure] = useState<unknown>(null),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(
      () => {
        setLoading(true);
        setFailure(null);
        void apiRequest<Place[]>(
          "/api/v1/places?" +
            new URLSearchParams({
              limit: "20",
              page: String(page),
              ...(query ? { q: query } : {}),
            }).toString(),
          { signal: controller.signal },
        )
          .then((result) => {
            if (!controller.signal.aborted) {
              setPlaces(result.data);
              setTotalPages(result.meta?.totalPages ?? 1);
            }
          })
          .catch((error: unknown) => {
            if (!controller.signal.aborted) setFailure(error);
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      },
      query ? 200 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, page, attempt]);
  return (
    <div className="space-y-8">
      <PageHeader
        title="สถานที่ทั้งหมด"
        description="รายชื่อห้องและจุดสำคัญที่เปิดแสดงบนแผนที่"
      />
      <div className={`${cardClass} p-6`}>
        <label htmlFor="location-search" className="mb-2 block text-label-md">
          ค้นหาสถานที่
        </label>
        <input
          id="location-search"
          className={`${inputClass} min-h-11`}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          type="search"
        />
      </div>
      {loading ? (
        <LoadingState />
      ) : failure ? (
        <ErrorState error={failure} onRetry={() => setAttempt(attempt + 1)} />
      ) : places.length ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {places.map((place) => (
              <Link
                key={place.id}
                href={`/map?q=${encodeURIComponent(place.roomCode ?? place.nameTh)}`}
                className={`${cardClass} p-6 transition-colors hover:border-primary-container focus-visible:outline-2 focus-visible:outline-primary-container`}
              >
                <LocationIcon className="h-5 w-5 text-primary-container" />
                <h2 className="mt-4 font-display text-headline-md">
                  {place.nameTh}
                </h2>
                <p className="mt-2 text-body-md text-on-surface-variant">
                  {place.roomCode ?? "ไม่มีรหัส"} ·{" "}
                  {categoryLabels[place.category]}
                </p>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : (
        <EmptyState
          search={Boolean(query)}
          onClear={() => {
            setQuery("");
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
