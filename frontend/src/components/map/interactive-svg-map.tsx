"use client";

import { cardClass, secondaryButtonClass } from "@/csmju";
import { EditIcon as Edit3, DashboardIcon as Maximize2 } from "@/csmju";
import Link from "next/link";
import { useMemo } from "react";
import { categoryColors, categoryLabels } from "@/lib/categories";
import { useCurrentUser } from "@/lib/current-user";
import { corridorPath } from "@/lib/map-layout";
import type { MapLayout, Place, PlaceCategory } from "@/types/api";

const wordSegmenter = new Intl.Segmenter("th", { granularity: "word" });
const graphemeSegmenter = new Intl.Segmenter("th", { granularity: "grapheme" });

function visibleLength(value: string) {
  return Array.from(graphemeSegmenter.segment(value)).length;
}

function wrapPlaceName(
  value: string,
  width: number,
  height: number,
  codeFontSize: number,
) {
  const text = value.trim();
  const words = Array.from(
    wordSegmenter.segment(text),
    ({ segment }) => segment,
  );
  const singleLineCapacity = Math.max(
    5,
    Math.floor((width - 1.6) / (1.1 * 0.62)),
  );
  const maximumLines = Math.max(
    1,
    Math.floor((height - codeFontSize - 1.2) / 1.3),
  );
  const lineCount = Math.min(
    maximumLines,
    Math.max(1, Math.ceil(visibleLength(text) / singleLineCapacity)),
  );
  const targetLength = Math.ceil(visibleLength(text) / lineCount);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = `${current}${word}`;
    if (
      current.trim() &&
      visibleLength(next.trim()) > targetLength &&
      lines.length < lineCount - 1
    ) {
      lines.push(current.trim());
      current = word.trimStart();
    } else {
      current = next;
    }
  }

  if (current.trim()) lines.push(current.trim());
  return lines.length ? lines : [text];
}

export function InteractiveSvgMap({
  places,
  mapLayout,
  selectedId,
  onSelect,
  onResetFocus,
}: {
  places: Place[];
  mapLayout: MapLayout;
  selectedId: string | null;
  onSelect: (place: Place) => void;
  onResetFocus: () => void;
}) {
  const { isAdmin } = useCurrentUser();
  const selected = places.find(({ id }) => id === selectedId);
  const walkwayPath = corridorPath(mapLayout.corridorPoints);
  const activeCategories = useMemo(() => {
    const present = new Set(places.map((p) => p.category));
    const preferredOrder: PlaceCategory[] = [
      "COMPUTER_LAB",
      "CLASSROOM",
      "LECTURER_OFFICE",
      "RESTROOM",
      "FACILITY",
      "STUDENT_CLUB",
      "STORAGE",
      "DEPARTMENT_OFFICE",
      "MEETING_ROOM",
      "ENTRANCE",
      "OTHER",
    ];
    return preferredOrder.filter((cat) => present.has(cat));
  }, [places]);
  const viewBox = useMemo(() => {
    if (!selected) return "0 0 100 60";

    const focusWidth = 72;
    const focusHeight = 44;
    const roomWidth = selected.width ?? 12;
    const roomHeight = selected.height ?? 8;
    const centerX = selected.positionX + roomWidth / 2;
    const centerY = selected.positionY + roomHeight / 2;
    const x = Math.min(100 - focusWidth, Math.max(0, centerX - focusWidth / 2));
    const y = Math.min(
      60 - focusHeight,
      Math.max(0, centerY - focusHeight / 2),
    );

    return `${x} ${y} ${focusWidth} ${focusHeight}`;
  }, [selected]);

  return (
    <div
      className={`${cardClass} relative min-w-0 overflow-hidden bg-surface p-2`}
    >
      {/* Top action buttons */}
      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        {isAdmin && (
          <Link
            href="/admin#manage-locations"
            className={`${secondaryButtonClass} bg-white/95 text-caption text-on-surface-variant shadow-sm backdrop-blur hover:text-primary-container`}
            title="แก้ไขตำแหน่งห้องในหน้าผู้ดูแล"
          >
            <Edit3 width={20} height={20} aria-hidden="true" /> แก้ไขผัง
          </Link>
        )}
        {selected && (
          <button
            onClick={onResetFocus}
            className={`${secondaryButtonClass} bg-white/95 text-caption shadow-sm backdrop-blur`}
          >
            <Maximize2 width={20} height={20} aria-hidden="true" /> ดูทั้งหมด
          </button>
        )}
      </div>

      <svg
        viewBox={viewBox}
        role="group"
        aria-label="แผนผังสาขาวิทยาการคอมพิวเตอร์ แม่โจ้"
        className="block aspect-[5/3] h-auto w-full rounded-xl bg-surface transition-colors duration-200 motion-reduce:transition-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="var(--color-outline-variant)"
              strokeWidth="0.18"
            />
          </pattern>
          <pattern
            id="tiles"
            width="2"
            height="2"
            patternUnits="userSpaceOnUse"
          >
            <rect width="2" height="2" fill="var(--color-surface)" />
            <path
              d="M 2 0 L 0 0 0 2"
              fill="none"
              stroke="var(--color-surface)"
              strokeWidth="0.1"
            />
          </pattern>
        </defs>

        {/* 1. Building Background & Architectural Base Plate */}
        <rect width="100" height="60" fill="url(#grid)" />

        {/* 2. Outer Building Perimeter & Walls */}
        <rect
          x="2"
          y="2"
          width="96"
          height="56"
          rx="3.5"
          fill="var(--color-surface-container-lowest)"
          stroke="var(--color-outline-variant)"
          strokeWidth="0.8"
        />
        <rect
          x="2.8"
          y="2.8"
          width="94.4"
          height="54.4"
          rx="2.8"
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth="0.3"
          strokeDasharray="2 1"
        />

        {/* 4. Corridors & Walkways (Dual-stroke Floorway) */}
        <path
          d={walkwayPath}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth={mapLayout.corridorWidth + 1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={walkwayPath}
          fill="none"
          stroke="var(--color-surface)"
          strokeWidth={mapLayout.corridorWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Walkway Center Guideline */}
        <path
          d={walkwayPath}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth="0.25"
          strokeDasharray="0.8 1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Architectural Hallway Zone Labels */}
        <g opacity="0.85">
          <text
            x="50"
            y="44.2"
            textAnchor="middle"
            fontSize="1.2"
            fontWeight="600"
            fill="var(--color-on-surface)"
          >
            โถงทางเดินหลัก (Main Corridor)
          </text>
          <text
            x="23"
            y="22"
            textAnchor="middle"
            fontSize="1.0"
            fontWeight="500"
            fill="var(--color-outline-variant)"
            transform="rotate(-90, 23, 22)"
          >
            ทางเดินฝั่งตะวันตก
          </text>
          <text
            x="83"
            y="22"
            textAnchor="middle"
            fontSize="1.0"
            fontWeight="500"
            fill="var(--color-outline-variant)"
            transform="rotate(90, 83, 22)"
          >
            ทางเดินฝั่งตะวันออก
          </text>
        </g>

        {/* 9. Render Rooms */}
        {places.map((place) => {
          const colors = categoryColors[place.category];
          const width = place.width ?? 12;
          const height = place.height ?? 8;
          const isSelected = selectedId === place.id;
          const code = place.roomCode ?? place.nameTh;
          const codeFontSize = Math.min(2.1, width / 5.2, (width - 1.6) / (visibleLength(code) * 0.62));
          const nameLines = wrapPlaceName(
            place.roomCode ? place.nameTh : place.description ?? categoryLabels[place.category],
            width,
            height,
            codeFontSize,
          );
          const longestNameLine = Math.max(...nameLines.map(visibleLength), 1);
          const nameFontSize = Math.max(
            0.65,
            Math.min(
              1.15,
              (width - 1.6) / (longestNameLine * 0.62),
              (height - codeFontSize - 1.2) / (nameLines.length * 1.2),
            ),
          );
          const nameLineHeight = nameFontSize * 1.2;
          const textBlockHeight =
            codeFontSize + 0.6 + nameLines.length * nameLineHeight;
          const textTop =
            place.positionY + Math.max(0.6, (height - textBlockHeight) / 2);
          const codeBaseline = textTop + codeFontSize * 0.82;
          const firstNameBaseline =
            textTop + codeFontSize + 0.6 + nameFontSize * 0.85;

          return (
            <g
              key={place.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${place.roomCode ?? ""} ${place.nameTh}`}
              onClick={() => onSelect(place)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(place);
                }
              }}
              className="group cursor-pointer outline-none"
            >
              {/* Room Body Box */}
              <rect
                x={place.positionX}
                y={place.positionY}
                width={width}
                height={height}
                rx="0.45"
                fill={isSelected ? colors.fill : `color-mix(in srgb, ${colors.fill} 75%, var(--color-surface-container-lowest))`}
                stroke={
                  isSelected
                    ? "var(--color-primary-container)"
                    : `color-mix(in srgb, ${colors.stroke} 35%, var(--color-outline-variant))`
                }
                strokeWidth={isSelected ? 2 : 1.2}
                vectorEffect="non-scaling-stroke"
                className="transition-[fill,stroke] duration-150 group-hover:stroke-primary-container group-focus-visible:stroke-primary-container group-focus-visible:[stroke-width:2] motion-reduce:transition-none"
              />

              {/* Room Code */}
              <text
                x={place.positionX + width / 2}
                y={codeBaseline}
                textAnchor="middle"
                fontSize={codeFontSize}
                fontWeight="700"
                fill="var(--color-on-surface)"
                pointerEvents="none"
              >
                {code}
              </text>

              {/* Room Name Thai */}
              <text
                x={place.positionX + width / 2}
                textAnchor="middle"
                fontSize={nameFontSize}
                fill="var(--color-on-surface)"
                pointerEvents="none"
              >
                {nameLines.map((line, index) => (
                  <tspan
                    key={`${line}-${index}`}
                    x={place.positionX + width / 2}
                    y={firstNameBaseline + index * nameLineHeight}
                  >
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Mini Legend at Bottom Right */}
      <div className="pointer-events-none mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1 rounded-xl border border-outline-variant/40 bg-white/95 px-3 py-1.5 text-caption font-medium text-on-surface-variant">
        {activeCategories.map((cat) => (
          <span key={cat} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{
                backgroundColor: categoryColors[cat].fill,
                borderColor: categoryColors[cat].stroke,
                borderWidth: 1,
                borderStyle: "solid",
              }}
            />
            {cat === "FACILITY" ? "ลิฟต์" : categoryLabels[cat]}
          </span>
        ))}
      </div>
    </div>
  );
}
