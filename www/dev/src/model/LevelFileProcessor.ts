import Level from "./Level.ts";

/**
 * Класс загрузки/сохранения уровня в файл
 */
export default class LevelFileProcessor {
  /**
   * Загрузка уровня
   * @return {Level|never}
   */
  async load(file: File): Promise<Level | never> {
    if (!/\.soko\.txt$/gi.test(file.name)) {
      throw "Файл должен быть с расширением .soko.txt";
    }
    const name = file.name.replace(/\.soko\.txt$/gi, "");
    const text: string = await this.getFileContents(file);

    const level = new Level(name);
    level.parse(text);
    return level;
  }

  /**
   * Возвращает текст файла
   * @param {File} file Файл для обработки
   * @return {String}
   */
  private async getFileContents(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var fr = new FileReader();
      fr.onload = () => {
        resolve(fr.result as string);
      };
      fr.onerror = reject;
      fr.readAsText(file);
    });
  }

  /**
   * Сохранение уровней
   * @param {Level} level Уровень для сохранения
   */
  save(level: Level): void {
    const text = level.dataToSave.data;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = (level.name || "Уровень") + ".soko.txt";
    a.click();

    URL.revokeObjectURL(url); // Очистка
  }
}
