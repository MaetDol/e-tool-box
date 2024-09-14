import { useEffect, useRef, useState } from "react";

export const useOnDrag = (
  onDrag: ({
    position,
    vector,
  }: {
    position: [number, number];
    vector: [number, number];
  }) => void,
  onDragEnd?: (position: [number, number]) => void
) => {
  const [isDragging, setIsDragging] = useState(false);

  const callbackRef = useRef({ onDrag, onDragEnd });
  callbackRef.current = { onDrag, onDragEnd };

  const lastMousePosition = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!isDragging) return;

    const onMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      callbackRef.current.onDragEnd?.([
        lastMousePosition.current?.[0] ?? e.clientX,
        lastMousePosition.current?.[1] ?? e.clientY,
      ]);
    };

    lastMousePosition.current = null;
    const onMouseMove = (e: MouseEvent) => {
      if (!lastMousePosition.current) {
        lastMousePosition.current = [e.clientX, e.clientY];
        return;
      }

      const [x, y] = lastMousePosition.current ?? [0, 0];
      callbackRef.current.onDrag({
        position: [e.clientX, e.clientY],
        vector: [e.clientX - x, e.clientY - y],
      });
      lastMousePosition.current = [e.clientX, e.clientY];
    };

    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [isDragging]);

  return {
    startDrag: () => setIsDragging(true),
    endDrag: () => setIsDragging(false),
  };
};
