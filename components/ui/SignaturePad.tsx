"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
}

export function SignaturePad({ onSave }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Set white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw placeholder text
    drawPlaceholder(ctx, canvas.width, canvas.height);
  }, []);

  function drawPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = "#d1d5db";
    ctx.font = "16px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sign here", w / 2, h / 2);
    // Draw dotted line
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, h - 40);
    ctx.lineTo(w - 40, h - 40);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function getPos(e: MouseEvent | { clientX: number; clientY: number }, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function clearPlaceholder() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const startDraw = useCallback((x: number, y: number) => {
    if (isEmpty) clearPlaceholder();
    setIsDrawing(true);
    setIsEmpty(false);
    lastPos.current = { x, y };
  }, [isEmpty]);

  const draw = useCallback((x: number, y: number) => {
    if (!isDrawing || !lastPos.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = { x, y };
  }, [isDrawing]);

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
    lastPos.current = null;
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e.nativeEvent, canvas);
    startDraw(pos.x, pos.y);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e.nativeEvent, canvas);
    draw(pos.x, pos.y);
  };

  const onMouseUp = () => stopDraw();
  const onMouseLeave = () => stopDraw();

  // Touch events
  const onTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const pos = getPos(e.touches[0], canvas);
    startDraw(pos.x, pos.y);
  };

  const onTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !e.touches[0]) return;
    const pos = getPos(e.touches[0], canvas);
    draw(pos.x, pos.y);
  };

  const onTouchEnd = () => stopDraw();

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlaceholder(ctx, canvas.width, canvas.height);
    setIsEmpty(true);
    setIsDrawing(false);
    lastPos.current = null;
  };

  const handleDone = () => {
    if (isEmpty) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col gap-3">
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="rounded-xl border-2 border-[var(--color-border)] bg-white cursor-crosshair w-full touch-none"
        style={{ maxWidth: "100%", height: "200px" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={isEmpty}
          className="text-sm px-6 py-2 rounded-lg bg-[var(--color-gold)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Done
        </button>
      </div>
    </div>
  );
}
