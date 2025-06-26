import { Level } from "app/model";

/**
 * Класс загрузки/сохранения уровней в localStorage
 */
export default class LevelStorage {
  /**
   * Загрузка уровней
   * @return {Levels[]}
   */
  load(): Level[] {
    const levelsText = window.localStorage.levels || "[]";
    const loadedLevels = JSON.parse(levelsText);
    const levels: Level[] = loadedLevels.map(
      (x: { name: string; data: string }) => {
        const level = new Level(x.name);
        level.parse(x.data);
        return level;
      },
    );
    return levels;
  }

  /**
   * Сохранение уровней
   * @param {Level[]} levels Уровни для сохранения
   */
  save(levels: Level[]): void {
    const levelsToSave = levels.map((level) => level.dataToSave);
    const json = JSON.stringify(levelsToSave);
    window.localStorage.levels = json;
  }
}
