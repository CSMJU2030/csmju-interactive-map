"use client";

import {
  cardClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/csmju";
import {
  MoreHorizIcon as LoaderCircle,
  DashboardIcon as Maximize2,
  MinusIcon as Minus,
  LocationIcon as Move,
  AddIcon as Plus,
  ArrowBackIcon as RotateCcw,
  CheckIcon as Save,
  DeleteIcon as Trash2,
} from "@/csmju";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { SuccessToast } from "@/components/common/ui-feedback";
import { apiRequest } from "@/lib/api";
import { categoryColors } from "@/lib/categories";
import { corridorPath } from "@/lib/map-layout";
import type { MapLayout, MapPoint, Place } from "@/types/api";

const MAP_WIDTH = 100;
const MAP_HEIGHT = 60;
const MIN_SIZE = 1;

type Layout = {
  id: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
};
type DragState =
  | {
      target: "room";
      id: string;
      mode: "move" | "resize";
      pointerId: number;
      startX: number;
      startY: number;
      initial: Layout;
    }
  | {
      target: "corridor";
      mode: "move" | "point";
      pointIndex?: number;
      pointerId: number;
      startX: number;
      startY: number;
      initialPoints: MapPoint[];
    };

interface BulkLayoutResponse {
  places: Place[];
  mapLayout: MapLayout;
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
const snap = (value: number) => Math.round(value * 4) / 4;
const layoutFromPlace = (place: Place): Layout => ({
  id: place.id,
  positionX: place.positionX,
  positionY: place.positionY,
  width: place.width ?? 12,
  height: place.height ?? 8,
});
const layoutsFromPlaces = (places: Place[]) =>
  Object.fromEntries(places.map((place) => [place.id, layoutFromPlace(place)]));
const copyPoints = (points: MapPoint[]) => points.map(({ x, y }) => ({ x, y }));

export function BulkLayoutEditor({
  places,
  mapLayout,
  onSaved,
}: {
  places: Place[];
  mapLayout: MapLayout;
  onSaved: () => Promise<void> | void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [layouts, setLayouts] = useState<Record<string, Layout>>(() =>
    layoutsFromPlaces(places),
  );
  const [corridorPoints, setCorridorPoints] = useState<MapPoint[]>(() =>
    copyPoints(mapLayout.corridorPoints),
  );
  const [corridorWidth, setCorridorWidth] = useState(mapLayout.corridorWidth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);

  useEffect(() => {
    setLayouts(layoutsFromPlaces(places));
    setCorridorPoints(copyPoints(mapLayout.corridorPoints));
    setCorridorWidth(mapLayout.corridorWidth);
    setSelectedId((current) =>
      places.some(({ id }) => id === current) ? current : null,
    );
    setSelectedPoint(null);
  }, [mapLayout, places]);

  const changedItems = useMemo(
    () =>
      places
        .map((place) => layouts[place.id])
        .filter((layout): layout is Layout => Boolean(layout))
        .filter((layout) => {
          const original = places.find(({ id }) => id === layout.id);
          return Boolean(
            original &&
            (layout.positionX !== original.positionX ||
              layout.positionY !== original.positionY ||
              layout.width !== (original.width ?? 12) ||
              layout.height !== (original.height ?? 8)),
          );
        }),
    [layouts, places],
  );
  const corridorChanged = useMemo(
    () =>
      corridorWidth !== mapLayout.corridorWidth ||
      JSON.stringify(corridorPoints) !==
        JSON.stringify(mapLayout.corridorPoints),
    [corridorPoints, corridorWidth, mapLayout],
  );
  const hasChanges = changedItems.length > 0 || corridorChanged;
  const selectedPlace = places.find(({ id }) => id === selectedId);
  const selectedLayout = selectedId ? layouts[selectedId] : undefined;
  const path = corridorPath(corridorPoints);

  const toMapPoint = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const matrix = svg?.getScreenCTM();
    if (!svg || !matrix) return null;
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(matrix.inverse());
  };
  const capturePointer = (event: ReactPointerEvent<SVGElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setMessage("");
    svgRef.current?.setPointerCapture(event.pointerId);
  };
  const beginRoomDrag = (
    id: string,
    mode: "move" | "resize",
    event: ReactPointerEvent<SVGElement>,
  ) => {
    const point = toMapPoint(event.clientX, event.clientY);
    const initial = layouts[id];
    if (!point || !initial) return;
    capturePointer(event);
    setSelectedId(id);
    setSelectedPoint(null);
    dragRef.current = {
      target: "room",
      id,
      mode,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      initial,
    };
  };
  const beginCorridorDrag = (
    mode: "move" | "point",
    event: ReactPointerEvent<SVGElement>,
    pointIndex?: number,
  ) => {
    const point = toMapPoint(event.clientX, event.clientY);
    if (!point) return;
    capturePointer(event);
    setSelectedId(null);
    setSelectedPoint(pointIndex ?? null);
    dragRef.current = {
      target: "corridor",
      mode,
      pointIndex,
      pointerId: event.pointerId,
      startX: point.x,
      startY: point.y,
      initialPoints: copyPoints(corridorPoints),
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
    if (drag.target === "room") {
      setLayouts((current) => ({
        ...current,
        [drag.id]:
          drag.mode === "move"
            ? {
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
              }
            : {
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
              },
      }));
      return;
    }
    if (drag.mode === "point" && drag.pointIndex !== undefined) {
      setCorridorPoints(
        drag.initialPoints.map((corridorPoint, index) =>
          index === drag.pointIndex
            ? {
                x: snap(clamp(corridorPoint.x + deltaX, 0, MAP_WIDTH)),
                y: snap(clamp(corridorPoint.y + deltaY, 0, MAP_HEIGHT)),
              }
            : corridorPoint,
        ),
      );
      return;
    }
    const xs = drag.initialPoints.map(({ x }) => x);
    const ys = drag.initialPoints.map(({ y }) => y);
    const moveX = snap(
      clamp(deltaX, -Math.min(...xs), MAP_WIDTH - Math.max(...xs)),
    );
    const moveY = snap(
      clamp(deltaY, -Math.min(...ys), MAP_HEIGHT - Math.max(...ys)),
    );
    setCorridorPoints(
      drag.initialPoints.map(({ x, y }) => ({
        x: snap(x + moveX),
        y: snap(y + moveY),
      })),
    );
  };
  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId))
      svgRef.current.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  };

  const addCorridorPoint = () => {
    if (corridorPoints.length >= 20) return;
    let segmentIndex = 0;
    let longest = -1;
    for (let index = 0; index < corridorPoints.length - 1; index += 1) {
      const deltaX = corridorPoints[index + 1].x - corridorPoints[index].x;
      const deltaY = corridorPoints[index + 1].y - corridorPoints[index].y;
      const length = deltaX ** 2 + deltaY ** 2;
      if (length > longest) {
        longest = length;
        segmentIndex = index;
      }
    }
    const start = corridorPoints[segmentIndex];
    const end = corridorPoints[segmentIndex + 1];
    const points = [...corridorPoints];
    points.splice(segmentIndex + 1, 0, {
      x: snap((start.x + end.x) / 2),
      y: snap((start.y + end.y) / 2),
    });
    setCorridorPoints(points);
    setSelectedPoint(segmentIndex + 1);
    setSelectedId(null);
  };
  const removeCorridorPoint = () => {
    if (selectedPoint === null || corridorPoints.length <= 2) return;
    setCorridorPoints(
      corridorPoints.filter((_, index) => index !== selectedPoint),
    );
    setSelectedPoint(null);
  };
  const reset = () => {
    setLayouts(layoutsFromPlaces(places));
    setCorridorPoints(copyPoints(mapLayout.corridorPoints));
    setCorridorWidth(mapLayout.corridorWidth);
    setSelectedPoint(null);
    setMessageError(false);
    setMessage("ยกเลิกการเปลี่ยนแปลงแล้ว");
  };
  const save = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setMessage("");
    try {
      await apiRequest<BulkLayoutResponse>("/api/v1/places/layout", {
        method: "PATCH",
        body: JSON.stringify({
          ...(changedItems.length ? { items: changedItems } : {}),
          ...(corridorChanged
            ? {
                corridor: {
                  corridorPoints: corridorPoints,
                  corridorWidth: corridorWidth,
                },
              }
            : {}),
        }),
      });
      setMessageError(false);
      setMessage(
        `บันทึกแล้ว${changedItems.length ? ` ${changedItems.length} ห้อง` : ""}${corridorChanged ? " พร้อมทางเดิน" : ""}`,
      );
      await onSaved();
    } catch (error) {
      setMessageError(true);
      setMessage(error instanceof Error ? error.message : "บันทึกผังไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/40 p-4 md:p-5">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wider text-primary-container">
            Visual layout editor
          </p>
          <h2 className="mt-1 text-lg font-bold text-on-surface">
            จัดห้องและทางเดินในหน้าเดียว
          </h2>
          <p className="text-label-md text-on-surface-variant">
            ลากห้องหรือลากเส้นทางเดินทั้งเส้น
            เลื่อนจุดวงกลมเพื่อเปลี่ยนรูปทางเดิน
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary-container/10 px-3 py-1.5 text-caption font-semibold text-primary-container">
            {changedItems.length} ห้อง
            {corridorChanged ? " · ทางเดินเปลี่ยนแล้ว" : ""}
          </span>
          <button
            type="button"
            className={`${secondaryButtonClass}`}
            onClick={reset}
            title={
              saving
                ? "กำลังบันทึก กรุณารอสักครู่"
                : !hasChanges
                  ? "ยังไม่มีการเปลี่ยนแปลง"
                  : undefined
            }
            disabled={!hasChanges || saving}
          >
            <RotateCcw width={20} height={20} aria-hidden="true" /> ยกเลิก
          </button>
          <button
            type="button"
            className={`${primaryButtonClass}`}
            aria-busy={saving}
            onClick={() => void save()}
            title={
              saving
                ? "กำลังบันทึก กรุณารอสักครู่"
                : !hasChanges
                  ? "ยังไม่มีการเปลี่ยนแปลง"
                  : undefined
            }
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <LoaderCircle
                className="animate-pulse motion-reduce:animate-none"
                width={20}
                height={20}
                aria-hidden="true"
              />
            ) : (
              <Save width={20} height={20} aria-hidden="true" />
            )}
            บันทึกผังทั้งหมด
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/40 bg-surface px-4 py-3 text-label-md text-on-surface-variant">
        <strong className="mr-1 text-on-surface">แก้ทางเดิน</strong>
        <button
          type="button"
          className={`${secondaryButtonClass} min-h-11 px-2.5`}
          onClick={() =>
            setCorridorWidth((width) => snap(clamp(width - 0.5, 1, 12)))
          }
          aria-label="ลดความกว้างทางเดิน"
        >
          <Minus width={20} height={20} aria-hidden="true" />
        </button>
        <span className="min-w-20 text-center">กว้าง {corridorWidth}</span>
        <button
          type="button"
          className={`${secondaryButtonClass} min-h-11 px-2.5`}
          onClick={() =>
            setCorridorWidth((width) => snap(clamp(width + 0.5, 1, 12)))
          }
          aria-label="เพิ่มความกว้างทางเดิน"
        >
          <Plus width={20} height={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`${secondaryButtonClass} min-h-11`}
          onClick={addCorridorPoint}
          title={
            corridorPoints.length >= 20 ? "เพิ่มได้สูงสุด 20 จุด" : undefined
          }
          disabled={corridorPoints.length >= 20}
        >
          <Plus width={20} height={20} aria-hidden="true" /> เพิ่มจุด
        </button>
        <button
          type="button"
          className={`${secondaryButtonClass} min-h-11 text-on-error-container`}
          onClick={removeCorridorPoint}
          title={
            selectedPoint === null
              ? "เลือกจุดทางเดินก่อนลบ"
              : corridorPoints.length <= 2
                ? "ทางเดินต้องมีอย่างน้อย 2 จุด"
                : undefined
          }
          disabled={selectedPoint === null || corridorPoints.length <= 2}
        >
          <Trash2 width={20} height={20} aria-hidden="true" /> ลบจุดที่เลือก
        </button>
        <span className="text-caption text-on-surface-variant">
          ลากเส้นเพื่อย้ายทั้งทางเดิน · ลากจุดเพื่อยืดหรือหด
        </span>
      </div>
      <div className="border-b border-outline-variant/40 bg-white px-4 py-2.5 text-label-md text-on-surface-variant">
        {selectedPlace && selectedLayout ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <strong className="text-on-surface">
              {selectedPlace.roomCode ?? selectedPlace.nameTh}
            </strong>
            <span>{selectedPlace.nameTh}</span>
            <span className="inline-flex items-center gap-1">
              <Move width={20} height={20} aria-hidden="true" /> X{" "}
              {selectedLayout.positionX}, Y {selectedLayout.positionY}
            </span>
            <span className="inline-flex items-center gap-1">
              <Maximize2 width={20} height={20} aria-hidden="true" />{" "}
              {selectedLayout.width} × {selectedLayout.height}
            </span>
          </div>
        ) : selectedPoint !== null ? (
          <span>
            จุดทางเดินที่ {selectedPoint + 1}: X{" "}
            {corridorPoints[selectedPoint]?.x}, Y{" "}
            {corridorPoints[selectedPoint]?.y}
          </span>
        ) : (
          <span>เลือกห้อง จุดทางเดิน หรือลากทางเดินทั้งเส้นได้ทันที</span>
        )}
      </div>
      <details className="border-b border-outline-variant p-4">
        <summary className="min-h-11 cursor-pointer text-label-md">
          แก้ผังด้วยแป้นพิมพ์หรือค่าตัวเลข
        </summary>
        <div className="space-y-4 pt-4">
          <label className="block text-label-md">
            เลือกห้อง
            <select
              className={inputClass}
              value={selectedId ?? ""}
              onChange={(event) => {
                setSelectedId(event.target.value || null);
                setSelectedPoint(null);
              }}
            >
              <option value="">เลือกห้องที่ต้องการแก้</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.roomCode ?? place.nameTh}
                </option>
              ))}
            </select>
          </label>
          {selectedId && selectedLayout && (
            <div className="grid grid-cols-2 gap-4">
              {(["positionX", "positionY", "width", "height"] as const).map(
                (key) => (
                  <label key={key} className="block text-label-md">
                    {
                      {
                        positionX: "ตำแหน่ง X",
                        positionY: "ตำแหน่ง Y",
                        width: "ความกว้าง",
                        height: "ความสูง",
                      }[key]
                    }
                    <input
                      type="number"
                      step="0.25"
                      className={inputClass}
                      value={selectedLayout[key]}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        if (Number.isFinite(value))
                          setLayouts((current) => ({
                            ...current,
                            [selectedId]: {
                              ...current[selectedId],
                              [key]: clamp(
                                value,
                                key === "width" || key === "height" ? 1 : 0,
                                key === "positionX"
                                  ? MAP_WIDTH - selectedLayout.width
                                  : key === "positionY"
                                    ? MAP_HEIGHT - selectedLayout.height
                                    : key === "width"
                                      ? MAP_WIDTH - selectedLayout.positionX
                                      : MAP_HEIGHT - selectedLayout.positionY,
                              ),
                            },
                          }));
                      }}
                    />
                  </label>
                ),
              )}
            </div>
          )}
          <label className="block text-label-md">
            เลือกจุดทางเดิน
            <select
              className={inputClass}
              value={selectedPoint ?? ""}
              onChange={(event) => {
                setSelectedPoint(
                  event.target.value === "" ? null : Number(event.target.value),
                );
                setSelectedId(null);
              }}
            >
              <option value="">เลือกจุดที่ต้องการแก้</option>
              {corridorPoints.map((_, index) => (
                <option key={index} value={index}>
                  จุดที่ {index + 1}
                </option>
              ))}
            </select>
          </label>
          {selectedPoint !== null && (
            <div className="grid grid-cols-2 gap-4">
              {(["x", "y"] as const).map((key) => (
                <label key={key} className="block text-label-md">
                  ตำแหน่ง {key.toUpperCase()} ของจุดทางเดิน
                  <input
                    type="number"
                    step="0.25"
                    className={inputClass}
                    value={corridorPoints[selectedPoint]?.[key] ?? 0}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      if (Number.isFinite(value))
                        setCorridorPoints((current) =>
                          current.map((point, index) =>
                            index === selectedPoint
                              ? {
                                  ...point,
                                  [key]: clamp(
                                    value,
                                    0,
                                    key === "x" ? MAP_WIDTH : MAP_HEIGHT,
                                  ),
                                }
                              : point,
                          ),
                        );
                    }}
                  />
                </label>
              ))}
            </div>
          )}
        </div>
      </details>
      <div className="bg-surface p-2 md:p-4">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="aspect-[5/3] min-h-[420px] w-full touch-none select-none rounded-xl bg-white md:min-h-[600px]"
          aria-label="ตัวแก้ไขตำแหน่งห้องและทางเดิน"
          onPointerMove={continueDrag}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <pattern
              id="bulk-layout-grid"
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
              id="bulk-selected-shadow"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feDropShadow
                dx="0"
                dy="0.8"
                stdDeviation="0.9"
                floodColor="var(--color-primary-container)"
                floodOpacity="0.35"
              />
            </filter>
          </defs>
          <rect
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            fill="url(#bulk-layout-grid)"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--color-outline-variant)"
            strokeWidth={corridorWidth + 1}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
          />
          <path
            d={path}
            fill="none"
            stroke="var(--color-surface)"
            strokeWidth={corridorWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="cursor-move"
            onPointerDown={(event) => beginCorridorDrag("move", event)}
          />
          {places.map((place) => {
            const layout = layouts[place.id];
            if (!layout) return null;
            const selected = selectedId === place.id;
            const colors = categoryColors[place.category];
            const centerX = layout.positionX + layout.width / 2;
            const centerY = layout.positionY + layout.height / 2;
            return (
              <g
                key={place.id}
                className="cursor-move"
                filter={selected ? "url(#bulk-selected-shadow)" : undefined}
                opacity={place.isActive ? 1 : 0.5}
                onPointerDown={(event) =>
                  beginRoomDrag(place.id, "move", event)
                }
              >
                {selected && (
                  <rect
                    x={layout.positionX - 0.7}
                    y={layout.positionY - 0.7}
                    width={layout.width + 1.4}
                    height={layout.height + 1.4}
                    rx="1.5"
                    fill="none"
                    stroke="var(--color-primary-container)"
                    strokeWidth="0.55"
                    strokeDasharray="1.2 0.8"
                    pointerEvents="none"
                  />
                )}
                <rect
                  x={layout.positionX}
                  y={layout.positionY}
                  width={layout.width}
                  height={layout.height}
                  rx="1"
                  fill={selected ? "var(--color-surface)" : colors.fill}
                  stroke={
                    selected ? "var(--color-primary-container)" : colors.stroke
                  }
                  strokeWidth={selected ? 0.65 : 0.35}
                />
                <text
                  x={centerX}
                  y={centerY - 0.2}
                  textAnchor="middle"
                  fontSize={Math.max(1, Math.min(2, layout.width / 5))}
                  fontWeight="700"
                  fill="var(--color-on-surface)"
                  pointerEvents="none"
                >
                  {place.roomCode ?? place.nameTh}
                </text>
                <text
                  x={centerX}
                  y={centerY + 1.8}
                  textAnchor="middle"
                  fontSize="0.9"
                  fill="var(--color-on-surface)"
                  pointerEvents="none"
                >
                  X {layout.positionX} · Y {layout.positionY}
                </text>
                {selected && (
                  <circle
                    cx={layout.positionX + layout.width}
                    cy={layout.positionY + layout.height}
                    r="1.35"
                    fill="var(--color-surface-container-lowest)"
                    stroke="var(--color-primary-container)"
                    strokeWidth="0.65"
                    className="cursor-nwse-resize"
                    onPointerDown={(event) =>
                      beginRoomDrag(place.id, "resize", event)
                    }
                  />
                )}
              </g>
            );
          })}
          {corridorPoints.map((point, index) => (
            <g
              key={`${index}-${point.x}-${point.y}`}
              className="cursor-grab"
              onPointerDown={(event) =>
                beginCorridorDrag("point", event, index)
              }
            >
              <circle
                cx={point.x}
                cy={point.y}
                r={selectedPoint === index ? 1.55 : 1.2}
                fill={
                  selectedPoint === index
                    ? "var(--color-primary-container)"
                    : "var(--color-surface-container-lowest)"
                }
                stroke={
                  selectedPoint === index
                    ? "var(--color-primary-container)"
                    : "var(--color-primary-container)"
                }
                strokeWidth="0.55"
              />
              <text
                x={point.x}
                y={point.y + 0.45}
                textAnchor="middle"
                fontSize="0.85"
                fontWeight="700"
                fill={
                  selectedPoint === index
                    ? "var(--color-surface-container-lowest)"
                    : "var(--color-primary-container)"
                }
                pointerEvents="none"
              >
                {index + 1}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {messageError && message && (
        <p
          role="alert"
          className="border-t border-error bg-error-container px-4 py-3 text-body-md text-on-error-container"
        >
          {message}
        </p>
      )}
      {!messageError && message && (
        <SuccessToast key={message} message={message} />
      )}
    </section>
  );
}
