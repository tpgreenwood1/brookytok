"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BackgroundConfig, AspectRatio, CanvasDimensions } from "./types";
import {
  CANVAS_DIMS,
  DEFAULT_BG_CONFIG,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_SIZE,
  DEFAULT_TEXT_COLOR,
  MAX_HISTORY,
  SNAP_THRESHOLD,
} from "./constants";

// Dynamically import fabric to avoid SSR issues (fabric references window at module level)
type FabricModule = typeof import("fabric");
let fabricModule: FabricModule | null = null;
async function getFabric(): Promise<FabricModule> {
  if (!fabricModule) fabricModule = await import("fabric");
  return fabricModule;
}

function gradientCoords(angleDeg: number, w: number, h: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const cx = w / 2;
  const cy = h / 2;
  return {
    x1: cx - Math.cos(rad) * cx,
    y1: cy - Math.sin(rad) * cy,
    x2: cx + Math.cos(rad) * cx,
    y2: cy + Math.sin(rad) * cy,
  };
}

export function useCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<import("fabric").fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [aspectRatio, setAspectRatioState] = useState<AspectRatio>("1:1");
  const [bgConfig, setBgConfigState] = useState<BackgroundConfig>(DEFAULT_BG_CONFIG);
  const [selectedObject, setSelectedObject] = useState<import("fabric").fabric.IText | null>(null);
  const [showSafeZone, setShowSafeZone] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [scaledDims, setScaledDims] = useState({ cssWidth: 0, cssHeight: 0, scale: 1 });

  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const restoringRef = useRef(false);

  const bgConfigRef = useRef(bgConfig);
  bgConfigRef.current = bgConfig;

  // Refs so async callbacks / event handlers can read current state without stale closures
  const scaledDimsRef = useRef(scaledDims);
  scaledDimsRef.current = scaledDims;

  const aspectRatioRef = useRef(aspectRatio);
  aspectRatioRef.current = aspectRatio;

  // ── History ────────────────────────────────────────────────────────────────

  const pushHistory = useCallback(() => {
    if (restoringRef.current || !fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON(["data"]));
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(json);
    if (historyRef.current.length > MAX_HISTORY) historyRef.current.shift();
    else historyIndexRef.current++;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0 || !fabricRef.current) return;
    historyIndexRef.current--;
    restoringRef.current = true;
    fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
      fabricRef.current!.requestRenderAll();
      restoringRef.current = false;
    });
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }, []);

  const redo = useCallback(() => {
    const maxIdx = historyRef.current.length - 1;
    if (historyIndexRef.current >= maxIdx || !fabricRef.current) return;
    historyIndexRef.current++;
    restoringRef.current = true;
    fabricRef.current.loadFromJSON(historyRef.current[historyIndexRef.current], () => {
      fabricRef.current!.requestRenderAll();
      restoringRef.current = false;
    });
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < maxIdx);
  }, []);

  // ── Background application ─────────────────────────────────────────────────

  const applyBackground = useCallback(
    (canvas: import("fabric").fabric.Canvas, cfg: BackgroundConfig) => {
      if (!fabricModule) return;
      const { fabric } = fabricModule;
      // Always use full-res dims for coordinate math. With zoom applied the
      // canvas element is smaller than dims, but Fabric renders the background
      // through the viewport transform — so coords in full-res space fill the
      // entire visible area correctly.
      const fullDims = CANVAS_DIMS[aspectRatioRef.current];
      const w = fullDims.width;
      const h = fullDims.height;

      if (cfg.mode === "solid") {
        canvas.setBackgroundImage(null as unknown as import("fabric").fabric.Image, () => {});
        canvas.setBackgroundColor(cfg.solidColor, canvas.requestRenderAll.bind(canvas));
        return;
      }

      if (cfg.mode === "gradient") {
        const coords = gradientCoords(cfg.gradient.angleDeg, w, h);
        const grad = new fabric.Gradient({
          type: "linear",
          coords,
          colorStops: cfg.gradient.stops.map((s) => ({ offset: s.offset, color: s.color })),
        });
        canvas.setBackgroundImage(null as unknown as import("fabric").fabric.Image, () => {});
        canvas.setBackgroundColor(grad as unknown as string, canvas.requestRenderAll.bind(canvas));
        return;
      }

      if (cfg.mode === "image" && cfg.imageDataUrl) {
        fabric.Image.fromURL(cfg.imageDataUrl, (img) => {
          const scaleX = w / (img.width ?? 1);
          const scaleY = h / (img.height ?? 1);
          const scale = Math.max(scaleX, scaleY);
          img.set({
            scaleX: scale,
            scaleY: scale,
            originX: "center",
            originY: "center",
            left: w / 2,
            top: h / 2,
          });
          if (cfg.imageBlurPx > 0) {
            img.filters = [new fabric.Image.filters.Blur({ blur: cfg.imageBlurPx / 20 })];
            img.applyFilters();
          }
          canvas.setBackgroundImage(img, canvas.requestRenderAll.bind(canvas));
        });
      }
    },
    [] // intentionally no deps — reads aspectRatioRef directly
  );

  // ── Canvas initialisation (re-runs when aspect ratio changes) ──────────────

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!canvasElRef.current) return;
      const { fabric } = await getFabric();
      if (cancelled) return;

      if (fabricRef.current) {
        fabricRef.current.off();
        fabricRef.current.dispose();
        fabricRef.current = null;
      }

      historyRef.current = [];
      historyIndexRef.current = -1;
      setCanUndo(false);
      setCanRedo(false);

      const dims = CANVAS_DIMS[aspectRatioRef.current];
      const canvas = new fabric.Canvas(canvasElRef.current, {
        width: dims.width,
        height: dims.height,
        preserveObjectStacking: true,
        selection: true,
      });
      fabricRef.current = canvas;

      // The ResizeObserver likely fired and set scaledDims before this async
      // init completed. Apply the current scale right away so the canvas is
      // the correct size from the start rather than rendering at 1080px.
      const { cssWidth, cssHeight, scale } = scaledDimsRef.current;
      if (cssWidth > 0 && cssHeight > 0) {
        canvas.setZoom(scale);
        // setDimensions without cssOnly resizes the canvas element AND Fabric's
        // .canvas-container wrapper, which is required for IText editing
        // textareas to be positioned correctly within the visible area.
        canvas.setDimensions({ width: cssWidth, height: cssHeight });
      }

      applyBackground(canvas, bgConfigRef.current);

      canvas.on("selection:created", (e) => {
        const obj = e.selected?.[0];
        if (obj && obj instanceof fabric.IText) setSelectedObject(obj as import("fabric").fabric.IText);
        else setSelectedObject(null);
      });
      canvas.on("selection:updated", (e) => {
        const obj = e.selected?.[0];
        if (obj && obj instanceof fabric.IText) setSelectedObject(obj as import("fabric").fabric.IText);
        else setSelectedObject(null);
      });
      canvas.on("selection:cleared", () => setSelectedObject(null));

      canvas.on("object:modified", pushHistory);
      canvas.on("object:added",    pushHistory);
      canvas.on("object:removed",  pushHistory);

      // Snap-to-centre — object coords are in full-res space (unaffected by zoom)
      canvas.on("object:moving", (e) => {
        const obj = e.target!;
        const fullDims = CANVAS_DIMS[aspectRatioRef.current];
        const cx = fullDims.width / 2;
        const cy = fullDims.height / 2;
        const useCentre = obj.originX === "center" && obj.originY === "center";
        const objCx = useCentre ? obj.left! : obj.left! + (obj.getScaledWidth() / 2);
        const objCy = useCentre ? obj.top!  : obj.top!  + (obj.getScaledHeight() / 2);
        let snapped = false;
        if (Math.abs(objCx - cx) < SNAP_THRESHOLD) {
          obj.set({ left: useCentre ? cx : cx - obj.getScaledWidth() / 2 });
          snapped = true;
        }
        if (Math.abs(objCy - cy) < SNAP_THRESHOLD) {
          obj.set({ top: useCentre ? cy : cy - obj.getScaledHeight() / 2 });
          snapped = true;
        }
        setShowGuides(snapped);
      });
      canvas.on("object:moved", () => setShowGuides(false));

      pushHistory();
    })();

    return () => {
      cancelled = true;
      if (fabricRef.current) {
        fabricRef.current.off();
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspectRatio]);

  // ── Re-apply background whenever bgConfig changes ─────────────────────────

  useEffect(() => {
    if (fabricRef.current) applyBackground(fabricRef.current, bgConfig);
  }, [bgConfig, applyBackground]);

  // ── Responsive scaling via ResizeObserver ──────────────────────────────────

  useEffect(() => {
    if (!containerRef.current) return;
    const dims = CANVAS_DIMS[aspectRatio];
    const TOOLBAR_H = 56;
    const CHIPS_H = 48;
    const HEADER_H = 56;
    const PADDING = 16;

    const ro = new ResizeObserver(([entry]) => {
      const { width: cw, height: ch } = entry.contentRect;
      const availW = cw;
      const availH = ch - TOOLBAR_H - CHIPS_H - HEADER_H - PADDING;
      const scaleW = availW / dims.width;
      const scaleH = availH / dims.height;
      const scale = Math.min(scaleW, scaleH, 1);
      const cssWidth  = Math.floor(dims.width  * scale);
      const cssHeight = Math.floor(dims.height * scale);
      setScaledDims({ cssWidth, cssHeight, scale });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [aspectRatio]);

  // Apply zoom + resize whenever display scale changes.
  // Using setZoom + full setDimensions (not cssOnly) so that Fabric's
  // .canvas-container wrapper and the IText editing textarea are both sized
  // to match the visible area — cssOnly leaves the wrapper at full-res which
  // clips the textarea and breaks text editing.
  useEffect(() => {
    const { cssWidth, cssHeight, scale } = scaledDims;
    if (fabricRef.current && cssWidth > 0 && cssHeight > 0) {
      fabricRef.current.setZoom(scale);
      fabricRef.current.setDimensions({ width: cssWidth, height: cssHeight });
    }
  }, [scaledDims]);

  // ── Public actions ─────────────────────────────────────────────────────────

  const setAspectRatio = useCallback((ratio: AspectRatio) => {
    setSelectedObject(null);
    setAspectRatioState(ratio);
  }, []);

  const setBgConfig = useCallback((cfg: BackgroundConfig) => {
    setBgConfigState(cfg);
  }, []);

  const addTextObject = useCallback(async () => {
    // Avoid awaiting if fabric is already cached — keeps us in the synchronous
    // click-handler stack so hiddenTextarea.focus() is a trusted user gesture.
    if (!fabricModule) await getFabric();
    const canvas = fabricRef.current;
    if (!canvas || !fabricModule) return;
    const { fabric } = fabricModule;
    // Place at the centre of the full-res coordinate space (object coords are unzoomed)
    const fullDims = CANVAS_DIMS[aspectRatioRef.current];
    const itext = new fabric.IText("Tap to edit", {
      left: fullDims.width / 2,
      top:  fullDims.height / 2,
      originX: "center",
      originY: "center",
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize:   DEFAULT_FONT_SIZE,
      fill:       DEFAULT_TEXT_COLOR,
      textAlign:  "center",
      editable:   true,
      data: { id: crypto.randomUUID() },
    });
    canvas.add(itext);
    canvas.setActiveObject(itext);
    canvas.requestRenderAll();
    // Enter editing immediately so the user can start typing right away.
    // selectAll pre-selects the placeholder so the first keystroke replaces it.
    itext.enterEditing();
    itext.selectAll();
  }, []);

  const updateSelectedText = useCallback(
    (props: Partial<import("fabric").fabric.ITextOptions>) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      obj.set(props as Record<string, unknown>);
      canvas.requestRenderAll();
    },
    []
  );

  const centerH = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const fullDims = CANVAS_DIMS[aspectRatioRef.current];
    const cx = fullDims.width / 2;
    const left = obj.originX === "center" ? cx : cx - obj.getScaledWidth() / 2;
    obj.set({ left });
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const centerV = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (!obj) return;
    const fullDims = CANVAS_DIMS[aspectRatioRef.current];
    const cy = fullDims.height / 2;
    const top = obj.originY === "center" ? cy : cy - obj.getScaledHeight() / 2;
    obj.set({ top });
    canvas.requestRenderAll();
    pushHistory();
  }, [pushHistory]);

  const exportJpeg = useCallback(async (): Promise<Blob> => {
    const canvas = fabricRef.current;
    if (!canvas) throw new Error("Canvas not ready");

    canvas.discardActiveObject();
    canvas.renderAll();

    // toDataURL({ multiplier }) upscales the render proportionally, including
    // the zoom viewport — so the output is at full 1080px resolution without
    // needing to temporarily resize the canvas or disturb the background.
    const fullDims = CANVAS_DIMS[aspectRatioRef.current];
    const multiplier = fullDims.width / canvas.width!;
    const dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.92, multiplier });

    const res = await fetch(dataUrl);
    return res.blob();
  }, []);

  const dims = CANVAS_DIMS[aspectRatio];

  return {
    canvasElRef,
    containerRef,
    dims,
    scaledDims,
    aspectRatio,
    setAspectRatio,
    bgConfig,
    setBgConfig,
    selectedObject,
    showSafeZone,
    setShowSafeZone,
    showGuides,
    addTextObject,
    updateSelectedText,
    centerH,
    centerV,
    undo,
    redo,
    canUndo,
    canRedo,
    exportJpeg,
  };
}
