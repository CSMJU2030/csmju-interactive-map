"use client";

import { DashboardIcon as Maximize2, LocationIcon as Move } from "@/csmju";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { corridorPath } from "@/lib/map-layout";
import type { MapLayout, Place } from "@/types/api";

const MAP_WIDTH = 100;
const MAP_HEIGHT = 60;
const MIN_SIZE = 1;

type Layout = {
  positionX: number;
  positionY: number;
  width: number;
  height: number;
};

type DragState = {
  mode: "move" | "resize";
  pointerId: number;
  startX: number;
  startY: number;
  initial: Layout;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

const snap = (value: number) => Math.round(value * 4) / 4;

export function PlaceLayoutEditor({
  value,
  places,
  mapLayout,
  editingId,
  label,
  onChange,
}: {
  value: Layout;
  places: Place[];
  mapLayout: MapLayout;
  editingId?: string;
  label: string;
  onChange: (layout: Layout) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const walkwayPath = corridorPath(mapLayout.corridorPoints);
  const layout = {
    positionX: Number.isFinite(value.positionX) ? value.positionX : 0,
    positionY: Number.isFinite(value.positionY) ? value.positionY : 0,
    width: Number.isFinite(value.width) ? value.width : 12,
    height: Number.isFinite(value.height) ? value.height : 8,
  };

  const toMapPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  };

  const beginDrag = (
    mode: DragState["mode"],
    event: ReactPointerEvent<SVGElement>,
  ) => {
    const point = toMapPoint(event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      initial: layout,
    };
  };

  const continueDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = toMapPoint(event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    const deltaX = point.x - drag.startX;
    const deltaY = point.y - drag.startY;

    if (drag.mode === "move") {
      onChange({
        ...drag.initial,
        positionX: snap(
          clamp(
            drag.initial.positionX + deltaX,
            0,
            MAP_WIDTH - drag.initial.width,
          ),
        ),
        positionY: snap(
          clamp(
            drag.initial.positionY + deltaY,
            0,
            MAP_HEIGHT - drag.initial.height,
          ),
        ),
      });
      return;
    }

    onChange({
      ...drag.initial,
      width: snap(
        clamp(
          drag.initial.width + deltaX,
          MIN_SIZE,
          MAP_WIDTH - drag.initial.positionX,
        ),
      ),
      height: snap(
        clamp(
          drag.initial.height + deltaY,
          MIN_SIZE,
          MAP_HEIGHT - drag.initial.positionY,
        ),
      ),
    });
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId))
      svgRef.current.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const centerX = layout.positionX + layout.width / 2;
  const centerY = layout.positionY + layout.height / 2;

  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 bg-white px-4 py-3">
        <div>
          <h3 className="font-semibold text-on-surface">
            จัดตำแหน่งด้วยการลาก
          </h3>
          <p className="text-caption text-on-surface-variant">
            ลากกล่องเพื่อย้ายตำแหน่ง · ลากจุดมุมขวาล่างเพื่อปรับขนาด
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-caption font-medium text-on-surface-variant">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-2.5 py-1">
            <Move width={20} height={20} aria-hidden="true" /> X{" "}
            {layout.positionX}, Y {layout.positionY}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-container/10 px-2.5 py-1">
            <Maximize2 width={20} height={20} aria-hidden="true" />{" "}
            {layout.width} × {layout.height}
          </span>
        </div>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="aspect-[5/3] w-full touch-none select-none bg-white"
        aria-label="ตัวแก้ไขตำแหน่งสถานที่บนแผนที่"
        onPointerMove={continueDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <pattern
            id="admin-layout-grid"
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke="var(--color-outline-variant)"
              strokeWidth="0.18"
            />
          </pattern>
          <filter
            id="admin-layout-shadow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feDropShadow
              dx="0"
              dy="0.8"
              stdDeviation="0.8"
              floodColor="var(--color-primary-container)"
              floodOpacity="0.28"
            />
          </filter>
        </defs>
        <rect
          width={MAP_WIDTH}
          height={MAP_HEIGHT}
          fill="url(#admin-layout-grid)"
        />
        <path
          d={walkwayPath}
          fill="none"
          stroke="var(--color-outline-variant)"
          strokeWidth={mapLayout.corridorWidth + 1}
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
        {places
          .filter((place) => place.id !== editingId)
          .map((place) => (
            <g key={place.id} aria-hidden="true">
              <rect
                x={place.positionX}
                y={place.positionY}
                width={place.width ?? 12}
                height={place.height ?? 8}
                rx="1"
                fill="var(--color-outline-variant)"
                stroke="var(--color-outline-variant)"
                strokeWidth="0.35"
              />
              <text
                x={place.positionX + (place.width ?? 12) / 2}
                y={place.positionY + (place.height ?? 8) / 2 + 0.6}
                textAnchor="middle"
                fontSize="1.25"
                fill="var(--color-outline-variant)"
              >
                {place.roomCode ?? place.nameTh.slice(0, 10)}
              </text>
            </g>
          ))}
        <g filter="url(#admin-layout-shadow)">
          <rect
            x={layout.positionX}
            y={layout.positionY}
            width={layout.width}
            height={layout.height}
            rx="1.2"
            fill="var(--color-surface)"
            stroke="var(--color-primary-container)"
            strokeWidth="0.65"
            className="cursor-move"
            onPointerDown={(event) => beginDrag("move", event)}
          />
          <text
            x={centerX}
            y={centerY + 0.7}
            textAnchor="middle"
            fontSize={Math.max(1, Math.min(2, layout.width / 7))}
            fontWeight="700"
            fill="var(--color-outline-variant)"
            pointerEvents="none"
          >
            {label || "สถานที่ใหม่"}
          </text>
          <circle
            cx={layout.positionX + layout.width}
            cy={layout.positionY + layout.height}
            r="1.45"
            fill="var(--color-surface-container-lowest)"
            stroke="var(--color-primary-container)"
            strokeWidth="0.65"
            className="cursor-nwse-resize"
            onPointerDown={(event) => beginDrag("resize", event)}
          />
          <path
            d={`M ${layout.positionX + layout.width - 0.65} ${layout.positionY + layout.height + 0.2} L ${layout.positionX + layout.width + 0.2} ${layout.positionY + layout.height - 0.65}`}
            stroke="var(--color-primary-container)"
            strokeWidth="0.35"
            pointerEvents="none"
          />
        </g>
      </svg>
    </section>
  );
}
