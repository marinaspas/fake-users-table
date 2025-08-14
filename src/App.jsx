import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "./App.css";

const daysSinceRegistered = dateStr => {
  const registeredDate = new Date(dateStr);
  const today = new Date();
  const diffTime = today - registeredDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Sortable header cell component
function SortableHeader({ id, label }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    background: "#162dc8ff",
  };

  return (
    <th ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {label}
    </th>
  );
}

export default function FakeDataTable() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "full_name", label: "Full Name" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    { key: "registered_date", label: "Registered Date" },
    { key: "dsr", label: "Days Since Registered" },
  ]);

  useEffect(() => {
    fetch("/fake_users_500.csv")
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: result => {
            const formattedData = result.data.map(row => ({
              id: row.ID,
              first_name: row["First Name"],
              last_name: row["Last Name"],
              full_name: `${row["First Name"]} ${row["Last Name"]}`,
              email: row["Email"],
              city: row["City"],
              registered_date: row["Registered Date"],
              dsr: daysSinceRegistered(row["Registered Date"]),
            }));
            setData(formattedData);
          },
        });
      });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = event => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columns.findIndex(col => col.key === active.id);
      const newIndex = columns.findIndex(col => col.key === over.id);
      setColumns(cols => arrayMove(cols, oldIndex, newIndex));
    }
  };

  return (
    <div>
      <h2>Fake Users (Draggable Columns)</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <table className="styled-table">
          <thead>
            <SortableContext
              items={columns.map(col => col.key)}
              strategy={horizontalListSortingStrategy}
            >
              <tr>
                {columns.map(col => (
                  <SortableHeader
                    key={col.key}
                    id={col.key}
                    label={col.label}
                  />
                ))}
              </tr>
            </SortableContext>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
