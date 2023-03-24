import { formatNumber } from "./lib";
import { Cell } from "./types";

const colors = [
  "red", // 0
  "orange", // 1
  "yellow", // 2
  "green", // 3
  "cyan", // 4
  "blue", // 5
  "violet", // 6
];

export const createRenderer = ({
  onElement,
  x,
  y,
}: {
  onElement: (el: HTMLElement) => void;
  x: number;
  y: number;
}) => {
  // style.css
  const margin = 30;
  const padding = 5;
  const border = 2;

  const aspectRatio = y / x;

  const calcSize = () => {
    const maxWidth = window.innerWidth - margin * 2;
    const maxHeight = window.innerHeight - margin * 2;
    const width = Math.min(maxHeight / aspectRatio, maxWidth);
    const cellSize = Math.round((width - (padding + border) * 2) / x);
    return {
      cellSize,
      cellBorderSize: Math.round(cellSize * 0.04),
      fieldBoxWidth: cellSize * x + (padding + border) * 2,
    };
  };

  const size = calcSize();

  const root = document.createElement("div");
  root.style.display = "none";
  root.classList.add("field-box");
  root.style.width = `${size.fieldBoxWidth}px`;

  const lines = new Array(y);
  for (let line = 0; line < y; line++) {
    lines[line] = new Array(x);
    const row = document.createElement("div");
    root.append(row);
    row.classList.add("row");
    for (let col = 0; col < x; col++) {
      const cell = document.createElement("div");
      cell.style.borderWidth = `${size.cellBorderSize}px`;
      cell.style.width = `${size.cellSize}px`;
      cell.style.height = `${size.cellSize}px`;
      row.append(cell);
      lines[line][col] = cell;
    }
  }

  onElement(root);

  return {
    resize: () => {
      const size = calcSize();
      root.style.width = `${size.fieldBoxWidth}px`;
      for (let line = 0; line < y; line++) {
        for (let col = 0; col < x; col++) {
          const cell = lines[line][col];
          cell.style.borderWidth = `${size.cellBorderSize}px`;
          cell.style.width = `${size.cellSize}px`;
          cell.style.height = `${size.cellSize}px`;
        }
      }
    },
    render: ({
      ai,
      score,
      field,
      updateStatus,
    }: {
      ai: boolean;
      score: number;
      field: Cell[][];
      updateStatus: (html: string) => void;
    }) => {
      root.style.display = field ? "" : "none";

      for (let line = 0; line < y; line++) {
        for (let col = 0; col < x; col++) {
          const cell = field[line]![col]!;
          const classNames = ["brick"];
          classNames.push(cell[0] === 1 ? colors[cell[1]]! : "empty"); // цветная клетка или пустая
          if (cell[2] === 1) classNames.push("active"); // перемещаемая фигура
          if (cell[3] === 1) classNames.push("blink"); // мигать ли
          if (cell[4] === 1) classNames.push("next"); // маркер следующей фигуры
          lines[line][col].className = classNames.join(" ");
        }
      }

      {
        let status = "";
        status += ai ? '<div class="item ai-title">AI</div>' : "";
        status +=
          score > 0
            ? `<div class="item score">${formatNumber(score)}</div>`
            : "";
        updateStatus(status);
      }
    },
  };
};
