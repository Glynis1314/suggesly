import { useState } from 'react';

export function useTableColumns(initialColumns) {
  const [columns, setColumns] = useState(initialColumns);
  const [draggedColIndex, setDraggedColIndex] = useState(null);
  const [dragOverColIndex, setDragOverColIndex] = useState(null);

  // Column Resizing Logic
  const handleResizeStart = (index, e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.pageX;
    const startWidth = columns[index].width;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.pageX - startX;
      const newWidth = Math.max(60, startWidth + deltaX); // Min width is 60px

      setColumns((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], width: newWidth };
        return next;
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  // Column Reordering Logic
  const handleDragStart = (index, e) => {
    setDraggedColIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (draggedColIndex !== index) {
      setDragOverColIndex(index);
    }
  };

  const handleDrop = (index, e) => {
    e.preventDefault();
    if (draggedColIndex === null || draggedColIndex === index) {
      setDraggedColIndex(null);
      setDragOverColIndex(null);
      return;
    }

    setColumns((prev) => {
      const next = [...prev];
      const [draggedCol] = next.splice(draggedColIndex, 1);
      next.splice(index, 0, draggedCol);
      return next;
    });

    setDraggedColIndex(null);
    setDragOverColIndex(null);
  };

  return {
    columns,
    draggedColIndex,
    dragOverColIndex,
    handleResizeStart,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setDraggedColIndex,
    setDragOverColIndex,
  };
}
