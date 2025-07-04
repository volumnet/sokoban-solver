import { Level, BlockType } from "app/model";
import { BlockComponent } from "app/components";

/**
 * Компонент уровня
 * @param {Level} options.level Уровень
 * @param {string} options.className CSS-класс
 * @param {(blockType: BlockType) => any} options.onClick Обработчик по клику
 */
function LevelLegend({
  className = "",
  selectedBlockType,
  onClick,
}: {
  className: string;
  selectedBlockType: BlockType;
  onClick?: (blockType: BlockType) => any;
}) {
  const children = Object.values(BlockType).map((blockType) => {
    let className = "level-legend-list__item";
    if (blockType == selectedBlockType) {
      className += " level-legend-list__item_active";
    }
    return (
      <BlockComponent
        key={blockType}
        className={className}
        blockType={blockType}
        onClick={() => onClick && onClick(blockType)}
      />
    );
  });
  return (
    <nav className={className + " level-legend level-legend-list"}>
      {children}
    </nav>
  );
}
LevelLegend.displayName = "LevelLegend";
export default LevelLegend;
