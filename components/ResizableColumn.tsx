"use client";

import { useState, useRef, useEffect } from "react";

interface ResizableColumnProps {
  children: React.ReactNode;
  initialWidth?: number;
  minWidth?: number;
  onResize?: (width: number) => void;
}

export function ResizableColumn({
  children,
  initialWidth = 150,
  minWidth = 50,
  onResize,
}: ResizableColumnProps) {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);
  const columnRef = useRef<HTMLTableCellElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(minWidth, startWidthRef.current + diff);
      setWidth(newWidth);
      if (onResize) {
        onResize(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, minWidth, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    if (columnRef.current) {
      startWidthRef.current = columnRef.current.offsetWidth;
    }
  };

  return (
    <th
      ref={columnRef}
      style={{ width: `${width}px`, position: "relative" }}
      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase select-none"
    >
      {children}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500 bg-transparent z-10"
        style={{ marginRight: "-4px" }}
      />
    </th>
  );
}





