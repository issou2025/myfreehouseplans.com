"use client";

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight, Circle, ClipboardCopy, FlipHorizontal2, FlipVertical2, MousePointer2, PenTool, RotateCcw, RotateCw, Square, Trash2, Type, Undo2, X, ZoomIn, ZoomOut } from "lucide-react";
import type { PlanImage } from "@/types/plan";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export type InteractiveImagePreviewProps = {
  images: PlanImage[];
  isOpen: boolean;
  initialIndex?: number;
  onClose: () => void;
};

type AnnotationTool = "select" | "arrow" | "circle" | "zone" | "text";
type Point = { x: number; y: number };
type Annotation = {
  id: string;
  type: Exclude<AnnotationTool, "select">;
  start: Point;
  end: Point;
  text?: string;
};

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.2;
const VIEWBOX_SIZE = 1000;

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizedPoint(event: ReactPointerEvent<SVGSVGElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(VIEWBOX_SIZE, ((event.clientX - rect.left) / rect.width) * VIEWBOX_SIZE)),
    y: Math.max(0, Math.min(VIEWBOX_SIZE, ((event.clientY - rect.top) / rect.height) * VIEWBOX_SIZE))
  };
}

function moveAnnotation(annotation: Annotation, dx: number, dy: number): Annotation {
  return {
    ...annotation,
    start: { x: annotation.start.x + dx, y: annotation.start.y + dy },
    end: { x: annotation.end.x + dx, y: annotation.end.y + dy }
  };
}

export function InteractiveImagePreview({ images, isOpen, initialIndex = 0, onClose }: InteractiveImagePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [rotation, setRotation] = useState<number>(0);
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [annotationMode, setAnnotationMode] = useState(false);
  const [tool, setTool] = useState<AnnotationTool>("select");
  const [annotationText, setAnnotationText] = useState("I want to enlarge this room.");
  const [annotationsByImage, setAnnotationsByImage] = useState<Record<string, Annotation[]>>({});
  const [draft, setDraft] = useState<Annotation | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOrigin, setDragOrigin] = useState<Point | null>(null);
  const [copyStatus, setCopyStatus] = useState("");

  const activeImage = images[currentIndex];
  const annotations = activeImage ? annotationsByImage[activeImage.id] ?? [] : [];

  const modificationSummary = useMemo(() => images.flatMap((image) => (annotationsByImage[image.id] ?? []).map((annotation, index) => `${image.title ?? image.alt ?? "Plan image"} - Note ${index + 1}: ${annotation.text ?? annotation.type}`)).join("\n"), [annotationsByImage, images]);

  function setActiveAnnotations(updater: (current: Annotation[]) => Annotation[]) {
    if (!activeImage) return;
    setAnnotationsByImage((current) => ({ ...current, [activeImage.id]: updater(current[activeImage.id] ?? []) }));
  }

  function resetTransform() {
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
    setZoom(1);
  }

  function selectImage(index: number) {
    setCurrentIndex(index);
    setSelectedId(null);
    setDraft(null);
    resetTransform();
  }

  function showPrevious() {
    selectImage((currentIndex - 1 + images.length) % images.length);
  }

  function showNext() {
    selectImage((currentIndex + 1) % images.length);
  }

  function toggleAnnotationMode() {
    setAnnotationMode((value) => {
      const next = !value;
      if (next) resetTransform();
      setSelectedId(null);
      setDraft(null);
      return next;
    });
  }

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (!annotationMode) return;
    const point = normalizedPoint(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (tool === "select") {
      const target = event.target as Element;
      const annotationId = target.closest("[data-annotation-id]")?.getAttribute("data-annotation-id") ?? null;
      setSelectedId(annotationId);
      if (annotationId) setDragOrigin(point);
      return;
    }

    if (tool === "text") {
      const annotation: Annotation = { id: newId(), type: "text", start: point, end: point, text: annotationText.trim() || "Modification note" };
      setActiveAnnotations((current) => [...current, annotation]);
      setSelectedId(annotation.id);
      return;
    }

    setDraft({ id: newId(), type: tool, start: point, end: point, text: annotationText.trim() || undefined });
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const point = normalizedPoint(event);
    if (draft) {
      setDraft((current) => current ? { ...current, end: point } : null);
      return;
    }
    if (tool === "select" && selectedId && dragOrigin) {
      const dx = point.x - dragOrigin.x;
      const dy = point.y - dragOrigin.y;
      setActiveAnnotations((current) => current.map((annotation) => annotation.id === selectedId ? moveAnnotation(annotation, dx, dy) : annotation));
      setDragOrigin(point);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    if (draft) {
      const point = normalizedPoint(event);
      const completed = { ...draft, end: point };
      const distance = Math.hypot(completed.end.x - completed.start.x, completed.end.y - completed.start.y);
      if (distance > 12) {
        setActiveAnnotations((current) => [...current, completed]);
        setSelectedId(completed.id);
      }
    }
    setDraft(null);
    setDragOrigin(null);
  }

  function deleteSelected() {
    if (!selectedId) return;
    setActiveAnnotations((current) => current.filter((annotation) => annotation.id !== selectedId));
    setSelectedId(null);
  }

  async function copyNotes() {
    if (!modificationSummary) return;
    await navigator.clipboard.writeText(modificationSummary);
    setCopyStatus("Notes copied");
    window.setTimeout(() => setCopyStatus(""), 1800);
  }

  useEffect(() => {
    if (!isOpen || images.length === 0) return;
    setCurrentIndex(Math.min(Math.max(initialIndex, 0), images.length - 1));
    resetTransform();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [images.length, initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen || images.length === 0) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (!annotationMode && event.key === "ArrowLeft") setCurrentIndex((value) => (value - 1 + images.length) % images.length);
      if (!annotationMode && event.key === "ArrowRight") setCurrentIndex((value) => (value + 1) % images.length);
      if (annotationMode && selectedId && activeImage && (event.key === "Delete" || event.key === "Backspace")) {
        setAnnotationsByImage((current) => ({ ...current, [activeImage.id]: (current[activeImage.id] ?? []).filter((annotation) => annotation.id !== selectedId) }));
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeImage, annotationMode, images.length, initialIndex, isOpen, onClose, selectedId]);

  useEffect(() => {
    if (isOpen) resetTransform();
  }, [currentIndex, isOpen]);

  if (!isOpen || !activeImage) return null;

  const controlClass = "min-h-10 rounded-lg px-3 py-2 text-xs sm:text-sm";
  const allAnnotations = draft ? [...annotations, draft] : annotations;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-2 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label="Interactive plan image preview" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <div className="flex h-[calc(100svh-1rem)] w-full max-w-[1500px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900 shadow-2xl sm:h-[calc(100svh-2rem)] sm:rounded-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-300">{currentIndex + 1} / {images.length} {annotations.length ? `• ${annotations.length} annotation${annotations.length > 1 ? "s" : ""}` : ""}</p>
            <p className="truncate text-sm font-semibold text-white sm:text-base">{activeImage.title ?? activeImage.alt ?? "Plan preview"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant={annotationMode ? "primary" : "outline"} className="min-h-10 border-white/20 bg-white/10 px-3 text-white hover:bg-white hover:text-slate-950" onClick={toggleAnnotationMode}><PenTool className="h-4 w-4" /> <span className="hidden sm:inline">{annotationMode ? "Finish annotations" : "Annotate plan"}</span></Button>
            <button type="button" onClick={onClose} className="focus-ring grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-white transition hover:bg-white hover:text-slate-950" aria-label="Close preview"><X className="h-5 w-5" /></button>
          </div>
        </div>

        {annotationMode ? (
          <div className="border-b border-white/10 bg-slate-950/95 p-2 sm:p-3">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 xl:flex-row xl:items-center">
              <div className="mobile-scroll flex gap-1.5 overflow-x-auto">
                {([
                  ["select", "Select / Move", MousePointer2],
                  ["arrow", "Arrow", ArrowUpRight],
                  ["circle", "Circle", Circle],
                  ["zone", "Red Zone", Square],
                  ["text", "Text", Type]
                ] as Array<[AnnotationTool, string, typeof MousePointer2]>).map(([value, label, Icon]) => (
                  <Button key={value} type="button" variant={tool === value ? "primary" : "outline"} className="min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs" onClick={() => { setTool(value); setSelectedId(null); }}><Icon className="h-4 w-4" /> {label}</Button>
                ))}
                <Button type="button" variant="danger" className="min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs" disabled={!selectedId} onClick={deleteSelected}><Trash2 className="h-4 w-4" /> Delete</Button>
                <Button type="button" variant="outline" className="min-h-9 shrink-0 rounded-lg px-3 py-1.5 text-xs" disabled={!annotations.length} onClick={() => { setActiveAnnotations(() => []); setSelectedId(null); }}><RotateCcw className="h-4 w-4" /> Clear image</Button>
              </div>
              <div className="flex min-w-0 flex-1 gap-2">
                <Input value={annotationText} onChange={(event) => setAnnotationText(event.target.value)} className="h-10 min-w-0 bg-white" placeholder="Describe the requested change..." />
                <Button type="button" variant="outline" className="min-h-10 shrink-0 rounded-lg px-3 text-xs" disabled={!modificationSummary} onClick={copyNotes}><ClipboardCopy className="h-4 w-4" /> <span className="hidden md:inline">{copyStatus || "Copy notes"}</span></Button>
              </div>
            </div>
            <div className="mobile-scroll mx-auto mt-2 flex max-w-7xl gap-2 overflow-x-auto">
              {["I want to enlarge this room.", "I want to move this door.", "I want to add a terrace here."].map((text) => <button key={text} type="button" onClick={() => { setAnnotationText(text); setTool("text"); }} className="focus-ring shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white hover:text-slate-950">{text}</button>)}
            </div>
          </div>
        ) : null}

        <div className="relative min-h-0 flex-1 overflow-auto bg-[radial-gradient(circle_at_center,rgba(51,65,85,0.65),rgba(2,6,23,0.95))]">
          <div className="flex min-h-full min-w-full items-center justify-center p-8 sm:p-14">
            <div className="relative inline-block max-w-full" style={{ transform: `rotate(${rotation}deg) scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1}) scale(${zoom})`, transition: "transform 0.3s ease" }}>
              <Image src={activeImage.url} alt={activeImage.alt ?? activeImage.title ?? "Plan preview"} width={1600} height={1200} sizes="90vw" unoptimized className="block h-auto max-h-[56svh] w-auto max-w-full select-none object-contain shadow-2xl" draggable={false} />
              <svg
                viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
                preserveAspectRatio="none"
                className={`absolute inset-0 h-full w-full touch-none ${annotationMode ? "cursor-crosshair" : "pointer-events-none"}`}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <defs>
                  <marker id="annotation-arrow" markerWidth="12" markerHeight="12" refX="10" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#ef4444" /></marker>
                </defs>
                {allAnnotations.map((annotation) => {
                  const selected = annotation.id === selectedId;
                  const x = Math.min(annotation.start.x, annotation.end.x);
                  const y = Math.min(annotation.start.y, annotation.end.y);
                  const width = Math.abs(annotation.end.x - annotation.start.x);
                  const height = Math.abs(annotation.end.y - annotation.start.y);
                  const common = { "data-annotation-id": annotation.id, stroke: selected ? "#38bdf8" : "#ef4444", strokeWidth: selected ? 10 : 7, vectorEffect: "non-scaling-stroke" as const };
                  if (annotation.type === "arrow") return <line key={annotation.id} x1={annotation.start.x} y1={annotation.start.y} x2={annotation.end.x} y2={annotation.end.y} markerEnd="url(#annotation-arrow)" {...common} />;
                  if (annotation.type === "circle") return <ellipse key={annotation.id} cx={x + width / 2} cy={y + height / 2} rx={width / 2} ry={height / 2} fill="rgba(239,68,68,0.08)" {...common} />;
                  if (annotation.type === "zone") return <rect key={annotation.id} x={x} y={y} width={width} height={height} fill="rgba(239,68,68,0.25)" {...common} />;
                  return <g key={annotation.id} {...common}><rect x={annotation.start.x - 8} y={annotation.start.y - 35} width={Math.min(500, Math.max(170, (annotation.text?.length ?? 10) * 11))} height="52" rx="12" fill={selected ? "#0284c7" : "#dc2626"} stroke="white" strokeWidth="3" /><text x={annotation.start.x + 8} y={annotation.start.y} fill="white" fontSize="24" fontWeight="700">{annotation.text}</text></g>;
                })}
              </svg>
            </div>
          </div>
          {!annotationMode && images.length > 1 ? (
            <>
              <button type="button" onClick={showPrevious} className="focus-ring absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-slate-950/65 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 sm:left-4 sm:h-12 sm:w-12" aria-label="Previous image"><ChevronLeft className="h-6 w-6" /></button>
              <button type="button" onClick={showNext} className="focus-ring absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-slate-950/65 text-white backdrop-blur transition hover:bg-white hover:text-slate-950 sm:right-4 sm:h-12 sm:w-12" aria-label="Next image"><ChevronRight className="h-6 w-6" /></button>
            </>
          ) : null}
        </div>

        {images.length > 1 ? (
          <div className="mobile-scroll flex gap-2 overflow-x-auto border-t border-white/10 bg-slate-900 px-3 py-2 sm:px-4">
            {images.map((image, index) => {
              const count = annotationsByImage[image.id]?.length ?? 0;
              return <button key={image.id} type="button" onClick={() => selectImage(index)} className={`focus-ring relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition sm:h-16 sm:w-24 ${index === currentIndex ? "border-sky-400 opacity-100" : "border-transparent opacity-55 hover:opacity-100"}`} aria-label={`Open image ${index + 1}`}><Image src={image.url} alt={image.alt ?? ""} fill sizes="96px" unoptimized className="object-cover" /><span className="absolute bottom-0 right-0 bg-slate-950/75 px-1.5 py-0.5 text-[10px] font-bold text-white">{count ? `${count} notes` : index + 1}</span></button>;
            })}
          </div>
        ) : null}

        <div className="border-t border-white/10 bg-slate-950/90 p-3 sm:p-4">
          <div className="mobile-scroll mx-auto flex max-w-5xl flex-nowrap items-center justify-start gap-2 overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible">
            {annotationMode ? <p className="text-center text-xs font-semibold text-slate-300">Draw on the plan, then use Select / Move to reposition an annotation. Press Delete to remove the selected item.</p> : <>
              <Button type="button" variant="outline" className={controlClass} onClick={() => setRotation((value) => value - 90)} title="Rotate Left"><Undo2 className="h-4 w-4" /><span className="hidden sm:inline">Rotate Left</span></Button>
              <Button type="button" variant="outline" className={controlClass} onClick={() => setRotation((value) => value + 90)} title="Rotate Right"><RotateCw className="h-4 w-4" /><span className="hidden sm:inline">Rotate Right</span></Button>
              <Button type="button" variant={flipX ? "secondary" : "outline"} className={controlClass} onClick={() => setFlipX((value) => !value)} title="Horizontal Mirror"><FlipHorizontal2 className="h-4 w-4" /><span className="hidden md:inline">Horizontal Mirror</span></Button>
              <Button type="button" variant={flipY ? "secondary" : "outline"} className={controlClass} onClick={() => setFlipY((value) => !value)} title="Vertical Mirror"><FlipVertical2 className="h-4 w-4" /><span className="hidden md:inline">Vertical Mirror</span></Button>
              <Button type="button" variant="outline" className={controlClass} disabled={zoom <= MIN_ZOOM} onClick={() => setZoom((value) => Math.max(MIN_ZOOM, Number((value - ZOOM_STEP).toFixed(1))))} title="Zoom Out"><ZoomOut className="h-4 w-4" /><span className="hidden sm:inline">Zoom Out</span></Button>
              <span className="min-w-14 rounded-lg bg-white/10 px-2 py-2 text-center text-xs font-black text-white">{Math.round(zoom * 100)}%</span>
              <Button type="button" variant="outline" className={controlClass} disabled={zoom >= MAX_ZOOM} onClick={() => setZoom((value) => Math.min(MAX_ZOOM, Number((value + ZOOM_STEP).toFixed(1))))} title="Zoom In"><ZoomIn className="h-4 w-4" /><span className="hidden sm:inline">Zoom In</span></Button>
              <Button type="button" variant="outline" className={controlClass} onClick={resetTransform} title="Reset"><RotateCcw className="h-4 w-4" /> Reset</Button>
              <Button type="button" variant="secondary" className={controlClass} onClick={onClose}><X className="h-4 w-4" /> Close</Button>
            </>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
