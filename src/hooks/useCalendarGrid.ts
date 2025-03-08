import { useState, useEffect, RefObject } from 'react';

export const useCalendarGrid = (
  gridRef: RefObject<HTMLDivElement>,
  calendarDays: Array<{ date: Date | null; isCurrentMonth: boolean }>
) => {
  const [rowHeights, setRowHeights] = useState<number[]>([]);

  // Calculate row heights after render
  useEffect(() => {
    if (gridRef.current) {
      // Get all direct children (rows)
      const rows = Array.from(gridRef.current.children);
      const numRows = Math.ceil(rows.length / 7); // Calendar has 7 columns
      
      const heights: number[] = [];
      for (let i = 0; i < numRows; i++) {
        const rowStartIndex = i * 7;
        const rowElement = rows[rowStartIndex];
        if (rowElement) {
          heights.push(rowElement.getBoundingClientRect().height);
        }
      }
      
      setRowHeights(heights);
    }
  }, [calendarDays, gridRef]);

  // Calculate row offsets for positioning
  const getRowOffset = (rowIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < rowIndex; i++) {
      offset += rowHeights[i] || 96; // Use measured height or fallback to 96px
    }
    return offset;
  };

  return {
    rowHeights,
    getRowOffset
  };
}; 