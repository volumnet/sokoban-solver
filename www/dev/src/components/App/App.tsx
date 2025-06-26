import { useEffect, useState } from "react";
import { Level } from "app/model";
import { Levels, LevelComponent } from "app/components";
import useLevels from "app/_shared/useLevels.ts";

/**
 * Приложение
 */
function App() {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState(
    null as number | null,
  );
  const { levels, saveLevel, deleteLevel } = useLevels();
  useEffect(() => {
    const defaultTitle = "SOKOBAN solver";
    if (!document.title || document.title !== defaultTitle) {
      document.title = defaultTitle;
    }
  }, []);

  let children;
  if (selectedLevelIndex !== null) {
    let level: Level;
    if (selectedLevelIndex == -1) {
      level = new Level();
    } else {
      level = levels[selectedLevelIndex];
    }

    children = (
      <LevelComponent
        key={selectedLevelIndex}
        level={level}
        selectedLevelIndex={selectedLevelIndex}
        onClose={() => setSelectedLevelIndex(null)}
        onSave={(level: Level) => {
          const levelsCount = saveLevel(level, selectedLevelIndex);
          if (selectedLevelIndex == -1) {
            setSelectedLevelIndex(levelsCount - 1);
          }
        }}
        onDelete={() => {
          deleteLevel(selectedLevelIndex);
          setSelectedLevelIndex(null);
        }}
      />
    );
  } else {
    children = (
      <>
        <h3>Выберите уровень:</h3>
        <Levels
          levels={levels}
          onSelect={(index) => setSelectedLevelIndex(index)}
        />
      </>
    );
  }

  return (
    <div className="body__background-holder">
      <h1 className="body__logo logo">SOKOBAN solver</h1>
      {children}
    </div>
  );
}
App.displayName = "App";
export default App;
