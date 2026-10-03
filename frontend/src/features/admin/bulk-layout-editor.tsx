'use client';

import { LoaderCircle, Maximize2, Minus, Move, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { apiRequest } from '@/lib/api';
import { categoryColors } from '@/lib/categories';
import { corridorPath } from '@/lib/map-layout';
import type { MapLayout, MapPoint, Place } from '@/types/api';

const MAP_WIDTH = 100;
const MAP_HEIGHT = 60;
const MIN_SIZE = 1;

type Layout = { id: string; positionX: number; positionY: number; width: number; height: number };
type DragState =
  | { target: 'room'; id: string; mode: 'move' | 'resize'; pointerId: number; startX: number; startY: number; initial: Layout }
  | { target: 'corridor'; mode: 'move' | 'point'; pointIndex?: number; pointerId: number; startX: number; startY: number; initialPoints: MapPoint[] };

interface BulkLayoutResponse { places: Place[]; mapLayout: MapLayout }

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
const layoutsFromPlaces = (places: Place[]) => Object.fromEntries(places.map((place) => [place.id, layoutFromPlace(place)]));
const copyPoints = (points: MapPoint[]) => points.map(({ x, y }) => ({ x, y }));

export function BulkLayoutEditor({ places, mapLayout, onSaved }: { places: Place[]; mapLayout: MapLayout; onSaved: () => Promise<void> | void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [layouts, setLayouts] = useState<Record<string, Layout>>(() => layoutsFromPlaces(places));
  const [corridorPoints, setCorridorPoints] = useState<MapPoint[]>(() => copyPoints(mapLayout.corridorPoints));
  const [corridorWidth, setCorridorWidth] = useState(mapLayout.corridorWidth);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);

  useEffect(() => {
    setLayouts(layoutsFromPlaces(places));
    setCorridorPoints(copyPoints(mapLayout.corridorPoints));
    setCorridorWidth(mapLayout.corridorWidth);
    setSelectedId((current) => (places.some(({ id }) => id === current) ? current : null));
    setSelectedPoint(null);
  }, [mapLayout, places]);

  const changedItems = useMemo(
    () => places.map((place) => layouts[place.id]).filter((layout): layout is Layout => Boolean(layout)).filter((layout) => {
      const original = places.find(({ id }) => id === layout.id);
      return Boolean(original && (layout.positionX !== original.positionX || layout.positionY !== original.positionY || layout.width !== (original.width ?? 12) || layout.height !== (original.height ?? 8)));
    }),
    [layouts, places],
  );
  const corridorChanged = useMemo(
    () => corridorWidth !== mapLayout.corridorWidth || JSON.stringify(corridorPoints) !== JSON.stringify(mapLayout.corridorPoints),
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
    setMessage('');
    svgRef.current?.setPointerCapture(event.pointerId);
  };
  const beginRoomDrag = (id: string, mode: 'move' | 'resize', event: ReactPointerEvent<SVGElement>) => {
    const point = toMapPoint(event.clientX, event.clientY);
    const initial = layouts[id];
    if (!point || !initial) return;
    capturePointer(event);
    setSelectedId(id);
    setSelectedPoint(null);
    dragRef.current = { target: 'room', id, mode, pointerId: event.pointerId, startX: point.x, startY: point.y, initial };
  };
  const beginCorridorDrag = (mode: 'move' | 'point', event: ReactPointerEvent<SVGElement>, pointIndex?: number) => {
    const point = toMapPoint(event.clientX, event.clientY);
    if (!point) return;
    capturePointer(event);
    setSelectedId(null);
    setSelectedPoint(pointIndex ?? null);
    dragRef.current = { target: 'corridor', mode, pointIndex, pointerId: event.pointerId, startX: point.x, startY: point.y, initialPoints: copyPoints(corridorPoints) };
  };
  const continueDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const point = toMapPoint(event.clientX, event.clientY);
    if (!point) return;
    event.preventDefault();
    const deltaX = point.x - drag.startX;
    const deltaY = point.y - drag.startY;
    if (drag.target === 'room') {
      setLayouts((current) => ({
        ...current,
        [drag.id]: drag.mode === 'move'
          ? { ...drag.initial, positionX: snap(clamp(drag.initial.positionX + deltaX, 0, MAP_WIDTH - drag.initial.width)), positionY: snap(clamp(drag.initial.positionY + deltaY, 0, MAP_HEIGHT - drag.initial.height)) }
          : { ...drag.initial, width: snap(clamp(drag.initial.width + deltaX, MIN_SIZE, MAP_WIDTH - drag.initial.positionX)), height: snap(clamp(drag.initial.height + deltaY, MIN_SIZE, MAP_HEIGHT - drag.initial.positionY)) },
      }));
      return;
    }
    if (drag.mode === 'point' && drag.pointIndex !== undefined) {
      setCorridorPoints(drag.initialPoints.map((corridorPoint, index) => index === drag.pointIndex
        ? { x: snap(clamp(corridorPoint.x + deltaX, 0, MAP_WIDTH)), y: snap(clamp(corridorPoint.y + deltaY, 0, MAP_HEIGHT)) }
        : corridorPoint));
      return;
    }
    const xs = drag.initialPoints.map(({ x }) => x);
    const ys = drag.initialPoints.map(({ y }) => y);
    const moveX = snap(clamp(deltaX, -Math.min(...xs), MAP_WIDTH - Math.max(...xs)));
    const moveY = snap(clamp(deltaY, -Math.min(...ys), MAP_HEIGHT - Math.max(...ys)));
    setCorridorPoints(drag.initialPoints.map(({ x, y }) => ({ x: snap(x + moveX), y: snap(y + moveY) })));
  };
  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
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
      if (length > longest) { longest = length; segmentIndex = index; }
    }
    const start = corridorPoints[segmentIndex];
    const end = corridorPoints[segmentIndex + 1];
    const points = [...corridorPoints];
    points.splice(segmentIndex + 1, 0, { x: snap((start.x + end.x) / 2), y: snap((start.y + end.y) / 2) });
    setCorridorPoints(points);
    setSelectedPoint(segmentIndex + 1);
    setSelectedId(null);
  };
  const removeCorridorPoint = () => {
    if (selectedPoint === null || corridorPoints.length <= 2) return;
    setCorridorPoints(corridorPoints.filter((_, index) => index !== selectedPoint));
    setSelectedPoint(null);
  };
  const reset = () => {
    setLayouts(layoutsFromPlaces(places));
    setCorridorPoints(copyPoints(mapLayout.corridorPoints));
    setCorridorWidth(mapLayout.corridorWidth);
    setSelectedPoint(null);
    setMessageError(false);
    setMessage('ยกเลิกการเปลี่ยนแปลงแล้ว');
  };
  const save = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setMessage('');
    try {
      await apiRequest<BulkLayoutResponse>('/api/v1/places/layout', {
        method: 'PATCH',
        body: JSON.stringify({
          ...(changedItems.length ? { items: changedItems } : {}),
          ...(corridorChanged ? { corridor: { corridorPoints: corridorPoints, corridorWidth: corridorWidth } } : {}),
        }),
      });
      setMessageError(false);
      setMessage(`บันทึกแล้ว${changedItems.length ? ` ${changedItems.length} ห้อง` : ''}${corridorChanged ? ' พร้อมทางเดิน' : ''}`);
      await onSaved();
    } catch (error) {
      setMessageError(true);
      setMessage(error instanceof Error ? error.message : 'บันทึกผังไม่สำเร็จ');
    } finally { setSaving(false); }
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4 md:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Visual layout editor</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">จัดห้องและทางเดินในหน้าเดียว</h2>
          <p className="text-sm text-slate-500">ลากห้องหรือลากเส้นทางเดินทั้งเส้น เลื่อนจุดวงกลมเพื่อเปลี่ยนรูปทางเดิน</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">{changedItems.length} ห้อง{corridorChanged ? ' · ทางเดินเปลี่ยนแล้ว' : ''}</span>
          <button type="button" className="button-secondary" onClick={reset} disabled={!hasChanges || saving}><RotateCcw size={17} /> ยกเลิก</button>
          <button type="button" className="button-primary" onClick={() => void save()} disabled={!hasChanges || saving}>{saving ? <LoaderCircle className="animate-spin" size={17} /> : <Save size={17} />}บันทึกผังทั้งหมด</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        <strong className="mr-1 text-slate-800">แก้ทางเดิน</strong>
        <button type="button" className="button-secondary min-h-9 px-2.5" onClick={() => setCorridorWidth((width) => snap(clamp(width - 0.5, 1, 12)))} aria-label="ลดความกว้างทางเดิน"><Minus size={15} /></button>
        <span className="min-w-20 text-center">กว้าง {corridorWidth}</span>
        <button type="button" className="button-secondary min-h-9 px-2.5" onClick={() => setCorridorWidth((width) => snap(clamp(width + 0.5, 1, 12)))} aria-label="เพิ่มความกว้างทางเดิน"><Plus size={15} /></button>
        <button type="button" className="button-secondary min-h-9" onClick={addCorridorPoint} disabled={corridorPoints.length >= 20}><Plus size={15} /> เพิ่มจุด</button>
        <button type="button" className="button-secondary min-h-9 text-red-600" onClick={removeCorridorPoint} disabled={selectedPoint === null || corridorPoints.length <= 2}><Trash2 size={15} /> ลบจุดที่เลือก</button>
        <span className="text-xs text-slate-400">ลากเส้นเพื่อย้ายทั้งทางเดิน · ลากจุดเพื่อยืดหรือหด</span>
      </div>
      <div className="border-b border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600">
        {selectedPlace && selectedLayout ? (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1"><strong className="text-slate-800">{selectedPlace.roomCode ?? selectedPlace.nameTh}</strong><span>{selectedPlace.nameTh}</span><span className="inline-flex items-center gap-1"><Move size={14} /> X {selectedLayout.positionX}, Y {selectedLayout.positionY}</span><span className="inline-flex items-center gap-1"><Maximize2 size={14} /> {selectedLayout.width} × {selectedLayout.height}</span></div>
        ) : selectedPoint !== null ? <span>จุดทางเดินที่ {selectedPoint + 1}: X {corridorPoints[selectedPoint]?.x}, Y {corridorPoints[selectedPoint]?.y}</span> : <span>เลือกห้อง จุดทางเดิน หรือลากทางเดินทั้งเส้นได้ทันที</span>}
      </div>
      <div className="bg-slate-100 p-2 md:p-4">
        <svg ref={svgRef} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="aspect-[5/3] min-h-[420px] w-full touch-none select-none rounded-xl bg-white md:min-h-[600px]" aria-label="ตัวแก้ไขตำแหน่งห้องและทางเดิน" onPointerMove={continueDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <defs><pattern id="bulk-layout-grid" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M 4 0 L 0 0 0 4" fill="none" stroke="var(--color-map-corridor-border)" strokeWidth="0.18" /></pattern><filter id="bulk-selected-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="0.8" stdDeviation="0.9" floodColor="var(--color-map-selected-border)" floodOpacity="0.35" /></filter></defs>
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#bulk-layout-grid)" />
          <path d={path} fill="none" stroke="var(--color-map-wall)" strokeWidth={corridorWidth + 1} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
          <path d={path} fill="none" stroke="var(--color-map-corridor-bg)" strokeWidth={corridorWidth} strokeLinecap="round" strokeLinejoin="round" className="cursor-move" onPointerDown={(event) => beginCorridorDrag('move', event)} />
          {places.map((place) => {
            const layout = layouts[place.id];
            if (!layout) return null;
            const selected = selectedId === place.id;
            const colors = categoryColors[place.category];
            const centerX = layout.positionX + layout.width / 2;
            const centerY = layout.positionY + layout.height / 2;
            return (
              <g key={place.id} className="cursor-move" filter={selected ? 'url(#bulk-selected-shadow)' : undefined} opacity={place.isActive ? 1 : 0.5} onPointerDown={(event) => beginRoomDrag(place.id, 'move', event)}>
                {selected && <rect x={layout.positionX - 0.7} y={layout.positionY - 0.7} width={layout.width + 1.4} height={layout.height + 1.4} rx="1.5" fill="none" stroke="var(--color-map-selected-border)" strokeWidth="0.55" strokeDasharray="1.2 0.8" pointerEvents="none" />}
                <rect x={layout.positionX} y={layout.positionY} width={layout.width} height={layout.height} rx="1" fill={selected ? 'var(--color-map-selected-bg)' : colors.fill} stroke={selected ? 'var(--color-map-selected-stroke)' : colors.stroke} strokeWidth={selected ? 0.65 : 0.35} />
                <text x={centerX} y={centerY - 0.2} textAnchor="middle" fontSize={Math.max(1, Math.min(2, layout.width / 5))} fontWeight="700" fill="var(--color-map-text-dark)" pointerEvents="none">{place.roomCode ?? place.nameTh}</text>
                <text x={centerX} y={centerY + 1.8} textAnchor="middle" fontSize="0.9" fill="var(--color-map-text)" pointerEvents="none">X {layout.positionX} · Y {layout.positionY}</text>
                {selected && <circle cx={layout.positionX + layout.width} cy={layout.positionY + layout.height} r="1.35" fill="var(--color-map-white)" stroke="var(--color-map-selected-stroke)" strokeWidth="0.65" className="cursor-nwse-resize" onPointerDown={(event) => beginRoomDrag(place.id, 'resize', event)} />}
              </g>
            );
          })}
          {corridorPoints.map((point, index) => (
            <g key={`${index}-${point.x}-${point.y}`} className="cursor-grab" onPointerDown={(event) => beginCorridorDrag('point', event, index)}><circle cx={point.x} cy={point.y} r={selectedPoint === index ? 1.55 : 1.2} fill={selectedPoint === index ? 'var(--color-map-selected-point)' : 'var(--color-map-white)'} stroke={selectedPoint === index ? 'var(--color-map-selected-point-stroke)' : 'var(--color-map-selected-stroke)'} strokeWidth="0.55" /><text x={point.x} y={point.y + 0.45} textAnchor="middle" fontSize="0.85" fontWeight="700" fill={selectedPoint === index ? 'var(--color-map-white)' : 'var(--color-map-selected-stroke)'} pointerEvents="none">{index + 1}</text></g>
          ))}
        </svg>
      </div>
      {message && <p className={`border-t px-4 py-3 text-sm ${messageError ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{message}</p>}
    </section>
  );
}
