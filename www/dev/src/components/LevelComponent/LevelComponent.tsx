import { useState, useRef } from "react";
import { Level, BlockType, Solver, LevelFileProcessor } from "app/model";
import { LevelLegend, LevelEditorComponent, LevelGamePlayComponent, GameField, LevelLoader } from "app/components";

/**
 * Компонент уровня
 * @param {Level} options.level Уровень
 * @param {?() => any} options.onClose Обработчик события закрытия
 * @param {?() => any} options.onDelete Обработчик события удаления
 */
function LevelComponent({
  level,
  selectedLevelIndex,
  onClose,
  onSave,
  onDelete,
}: {
  level: Level;
  selectedLevelIndex: number;
  onClose: () => any;
  onSave: (level: Level) => any;
  onDelete: () => any;
}) {
  const [editorMode, setEditorMode] = useState(selectedLevelIndex === -1);

  if (editorMode) {
    return (
      <LevelEditorComponent
        level={level}
        onClose={() => {
          if (selectedLevelIndex == -1) {
            onClose();
          }
          setEditorMode(false);
        }}
        onSave={(newLevel: Level) => {
          onSave(newLevel);
          setEditorMode(false);
        }}
      />
    );
  }

  return (
    <LevelGamePlayComponent
      level={level}
      onClose={onClose}
      onEdit={() => setEditorMode(true)}
      onDelete={onDelete}
    />
  );
}
LevelComponent.displayName = "LevelComponent";
export default LevelComponent;
