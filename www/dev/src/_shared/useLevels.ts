import { useState, useEffect } from "react";
import { Level, LevelStorage } from "app/model";

/**
 * Загружает Тестовый уровень
 * @return {Promise<Level[]>}
 */
async function loadTestLevels(): Promise<Level[]> {
  const levelsResponse = await fetch("/levels.soko.txt");
  const levelsText = await levelsResponse.text();
  const levelsArr = levelsText.split("\n---\n");
  const result = [];
  for (let i = 0; i < levelsArr.length; i++) {
    const level = new Level("Уровень " + (i + 1));
    level.parse(levelsArr[i]);
    result.push(level);
  }
  return result;
}

/**
 * Сохраняет уровень в файл
 * @param {Level} level Уровень для сохранения
 */
function saveLevelToFile(level: Level) {
  const text = level.dataToSave.data;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = (level.name || "Уровень") + ".soko.txt";
  a.click();

  URL.revokeObjectURL(url); // Очистка
}

/**
 * Хук для использования уровней
 * @return {{levels: Level[], saveLevel: (level: Level, index: number) => any, deleteLevel: (index: number) => any}}
 */
export default function useLevels(): {
  levels: Level[];
  saveLevel: (level: Level, index: number) => any;
  deleteLevel: (index: number) => any;
} {
  const storage = new LevelStorage();
  const [levels, originalSetLevels] = useState(storage.load());

  useEffect(() => {
    if (!levels.length) {
      loadTestLevels().then((newLevels: Level[]) => {
        setLevels(newLevels);
      });
    }
  }, [levels]);

  /**
   * Сохраняет уровни
   * @param {Level[]} levels Уровни
   */
  function setLevels(levels: Level[]) {
    storage.save(levels);
    originalSetLevels(levels);
  }

  /**
   * Сохраняет уровень
   * @param  {Level} level Уровень для сохранения
   * @param  {number} index Порядковый номер уровня
   * @return {number} Количество сохраненных уровней
   */
  function saveLevel(level: Level, index: number = -1): number {
    const newLevels = [...levels];
    if (index == -1) {
      newLevels.push(level);
    } else {
      newLevels[index] = level;
    }
    setLevels(newLevels);
    return newLevels.length;
  }

  /**
   * Удаляет уровень
   * @param  {number} index Порядковый номер уровня
   * @return {number} Количество сохраненных уровней
   */
  function deleteLevel(index: number): number {
    const newLevels = [...levels];
    newLevels.splice(index, 1);
    setLevels(newLevels);
    return newLevels.length;
  }

  return {
    levels,
    saveLevel,
    deleteLevel,
  };
}
