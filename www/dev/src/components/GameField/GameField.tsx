import { useState, useRef } from "react";
import { Level, Point, GameState, BlockType, PointsRepo, Config } from "app/model";
import { BlockComponent } from "app/components";

/**
 * Возвращает координаты события мыши
 * @param  {React.MouseEvent<any>} e Событие мыши
 * @param  {HTMLDivElement} el Корневой элемент
 * @param {Point} size Размер поля
 * @return {Point}
 */
function checkCoords(
  e: React.MouseEvent<any>,
  el: HTMLDivElement,
  size: Point,
): Point {
  const box = el.getBoundingClientRect();
  const x = Math.floor(((e.clientX - box.x) / box.width) * size.x);
  const y = Math.floor(((e.clientY - box.y) / box.height) * size.y);
  // console.log(e.clientX, e.clientY, box, ((e.clientX - box.x) / box.width), ((e.clientY - box.y) / box.height), x, y);
  return PointsRepo.get(x, y);
}

/**
 * Компонент уровня
 * @param {string} options.className CSS-класс
 * @param {Level} options.level Уровень
 * @param {?boolean} editorMode Режим редактирования
 * @param {?(point: Point, rightClick?: boolean) => any} options.onBlockClick Обработчик события нажатия кнопки мыши
 * @param {Point} size Размер поля (если не задано, устанавливается в Config.size)
 */
function GameField({
  className = "",
  gameState,
  editorMode = false,
  onBlockClick,
  size,
}: {
  className: string;
  gameState: GameState;
  editorMode?: boolean;
  onBlockClick?: (point: Point, rightClick?: boolean) => any;
  size?: Point;
}) {
  function handleMouseEvents(e: React.MouseEvent<any>) {
    if (!editorRef.current || !mouseState.current || !onBlockClick) {
      return;
    }
    const point = checkCoords(e, editorRef.current, realSize);
    onBlockClick(point, mouseState.current < 0);
  }
  const realSize = size || new Point(Config.size, Config.size);

  const levelBlocks = [];
  const mouseState = useRef(0);
  const editorRef = useRef<HTMLDivElement>(null);

  for (let i = 0; i < realSize.y; i++) {
    for (let j = 0; j < realSize.x; j++) {
      const currentPoint = PointsRepo.get(j, i);
      levelBlocks.push(
        <BlockComponent
          key={j + "x" + i}
          className="game-field__item"
          blockType={gameState.blockType(currentPoint)}
          hasPlayer={
            !!(gameState.player && gameState.player.isSame(currentPoint))
          }
          notAvailable={
            editorMode
              ? false
              : gameState.room.corners.hasPoint(currentPoint) ||
                gameState.nearWalls.hasPoint(currentPoint)
          }
        />,
      );
    }
  }
  return (
    <div
      ref={editorRef}
      className={
        className + " game-field" + (editorMode ? " game-field_editor" : "")
      }
      style={{ "--width": realSize.x, '--height': realSize.y, '--aspect-ratio': (realSize.x + '/' + realSize.y) } as React.CSSProperties}
      onMouseDown={(e) => {
        if (e.button == 0) {
          mouseState.current = 1;
        } else if (e.button == 2) {
          mouseState.current = -1;
        }
        handleMouseEvents(e);
      }}
      onMouseUp={(e) => {
        mouseState.current = 0;
      }}
      onMouseMove={handleMouseEvents}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {levelBlocks}
    </div>
  );
}
GameField.displayName = "GameField";
export default GameField;
