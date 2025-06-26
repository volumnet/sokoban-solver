import { BlockType } from "app/model";

/**
 * Компонент уровня
 * @param {Level} options.level Уровень
 * @param {string} options.className CSS-класс
 * @param {BlockType} options.blockType Тип блока
 * @param {?boolean} options.notAvailable Блок не доступен (для игрового режима)
 * @param {?boolean} options.hasPlayer Игрок в этом блоке
 * @param {?() => any} options.onClick Обработчик по клику
 * @param {?() => any} options.onContextMenu Обработчик по клику правой кнопки мыши
 * @param {?() => any} options.onMouseMove Обработчик по движению мыши
 * @param {?() => any} options.onMouseDown Обработчик по нажатию мыши
 */
function BlockComponent({
  className = "",
  blockType,
  notAvailable = false,
  hasPlayer = false,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseMove,
}: {
  className: string;
  blockType: BlockType;
  notAvailable?: boolean;
  hasPlayer?: boolean;
  onClick?: (e?: any) => any;
  onContextMenu?: (e?: any) => any;
  onMouseDown?: (e?: any) => any;
  onMouseMove?: (e?: any) => any;
}) {
  let newClassName = className + " block";
  switch (blockType) {
    case BlockType.Wall:
      newClassName += " block_wall";
      break;
    case BlockType.Player:
      newClassName += " block_player";
      break;
    case BlockType.Box:
      newClassName += " block_box";
      break;
    case BlockType.Place:
      newClassName += " block_place";
      break;
  }
  if (hasPlayer) {
    newClassName += " block_player";
  }
  if (notAvailable && blockType == BlockType.Empty) {
    newClassName += " block_not-available";
  }
  return (
    <div
      className={newClassName}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
    />
  );
}
BlockComponent.displayName = "BlockComponent";
export default BlockComponent;
