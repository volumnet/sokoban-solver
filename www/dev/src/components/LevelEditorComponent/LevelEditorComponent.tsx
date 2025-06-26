import { useState, useRef } from "react";
import { Level, Point, BlockType, LevelFileProcessor } from "app/model";
import { LevelLegend, GameField, LevelLoader } from "app/components";

/**
 * Компонент редактора уровня
 * @param {Level} options.level Уровень
 * @param {?() => any} options.onClose Обработчик события закрытия
 */
function LevelEditorComponent({
  level,
  onClose,
  onSave,
}: {
  level: Level;
  onClose: () => any;
  onSave: (level: Level) => any;
}) {
  const [selectedBlockType, setSelectedBlockType] = useState(BlockType.Wall);
  const [name, setName] = useState(level.name);
  const [currentLevel, setCurrentLevel] = useState(level.clone());
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Проверяет и сохраняет уровень
   */
  function checkAndSave() {
    try {
      if (
        formRef.current &&
        formRef.current.reportValidity() &&
        currentLevel.gameState.check()
      ) {
        const newLevel = currentLevel.clone();
        newLevel.name = name;
        onSave(newLevel);
      }
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Сохраняет уровень в файл
   */
  function saveToFile() {
    try {
      new LevelFileProcessor().save(currentLevel);
    } catch (e) {
      alert(e);
    }
  }

  /**
   * Загружает файл
   * @param  {File} file Файл для загрузки
   */
  async function loadFile(file: File) {
    const processor = new LevelFileProcessor();
    const newLevel = await processor.load(file);
    setName(newLevel.name);
    setCurrentLevel(newLevel);
  }

  return (
    <form className="level" ref={formRef}>
      <main className="level__main">
        <input
          type="text"
          className="form-control"
          placeholder="Введите название уровня"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <GameField
          key="field-editor"
          className="level__field"
          gameState={currentLevel.gameState}
          editorMode={true}
          onBlockClick={(point: Point, erase?: boolean) => {
            const newBlockType = erase ? BlockType.Empty : selectedBlockType;
            if (currentLevel.blocks[point.y][point.x] == newBlockType) {
              return;
            }
            const newLevel = currentLevel.setBlockImmutable(
              point.y,
              point.x,
              newBlockType,
            );
            setCurrentLevel(newLevel);
          }}
        />
      </main>
      <aside className="level__aside">
        <LevelLegend
          className="level__legend"
          selectedBlockType={selectedBlockType}
          onClick={setSelectedBlockType}
        />
        <div className="level__controls">
          <button
            type="button"
            className="btn btn-primary"
            onClick={checkAndSave}
          >
            Сохранить
          </button>
          <LevelLoader onFileLoad={loadFile} />
          <button
            type="button"
            className="btn btn-default"
            onClick={saveToFile}
          >
            Сохранить в файл
          </button>
          <button type="button" className="btn btn-default" onClick={onClose}>
            « Назад
          </button>
        </div>
      </aside>
    </form>
  );
}
LevelEditorComponent.displayName = "LevelEditorComponent";
export default LevelEditorComponent;
