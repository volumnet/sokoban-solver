import { BlockType, Block, Point, PointsRepo, PointSet, Room, GameState, Config } from "app/model";

/**
 * Уровень
 */
export default class Level {
  private _blocks: BlockType[][] = [];

  /**
   * Конструктор класса
   * @param {string} name   Название уровня
   * @param {Block[][]} blocks Блоки
   */
  constructor(
    public name: string = "",
    blocks: BlockType[][] = [],
  ) {
    this.blocks = blocks;
  }

  /**
   * Устанавливает блоки
   * @param {BlockType[][]} blocksToSet Блоки для установки
   */
  set blocks(blocksToSet: BlockType[][]) {
    this._blocks = Array.from({ length: Config.size }, () =>
      Array.from({ length: Config.size }, () => BlockType.Empty),
    );
    for (let i = 0; i < Config.size; i++) {
      if (!blocksToSet[i]) {
        continue;
      }
      for (let j = 0; j < Config.size; j++) {
        if (blocksToSet[i][j]) {
          this.setBlock(i, j, blocksToSet[i][j]);
        }
      }
    }
  }

  get blocks(): BlockType[][] {
    return this._blocks;
  }

  /**
   * Размер актуального поля
   * @return {Point}
   */
  get size(): Point {
    let w = 0;
    let h = 0;
    for (let i = 0; i < Config.size; i++) {
      for (let j = 0; j < Config.size; j++) {
        if (this._blocks[i][j] != BlockType.Empty) {
          h = i + 1;
          // console.log('new h is ' + (i + 1) + ' by ' + i + 'x' + j);
          break;
        }
      }
    }
    for (let i = 0; i < Config.size; i++) {
      for (let j = w; j < Config.size; j++) {
        if (this._blocks[i][j] != BlockType.Empty) {
          w = j + 1;
          // console.log('new w is ' + (j + 1) + ' by ' + i + 'x' + j);
        }
      }
    }
    return new Point(w, h);
  }

  /**
   * Возвращает положение игрока, если он есть
   * @return {Point?}
   */
  get player(): Point | null {
    for (let i = 0; i < Config.size; i++) {
      for (let j = 0; j < Config.size; j++) {
        if (this._blocks[i][j] == BlockType.Player) {
          return PointsRepo.get(j, i);
        }
      }
    }
    return null;
  }

  /**
   * Данные для сохранения
   * @return {{ name: string, data: string }}
   */
  get dataToSave(): { name: string; data: string } {
    const levelData = this._blocks.map((arr) => arr.join("")).join("\n");
    const result = {
      name: this.name,
      data: levelData,
    };
    return result;
  }

  /**
   * Получает начальное состояние игры
   * @return {GameState}
   * @throws {String}
   */
  get gameState(): GameState | never {
    const room: Point[] = [];
    const boxes: Point[] = [];
    const winState: Point[] = [];
    for (let i = 0; i < Config.size; i++) {
      for (let j = 0; j < Config.size; j++) {
        switch (this._blocks[i][j]) {
          case BlockType.Wall:
            room.push(PointsRepo.get(j, i));
            break;
          case BlockType.Box:
            boxes.push(PointsRepo.get(j, i));
            break;
          case BlockType.Place:
            winState.push(PointsRepo.get(j, i));
            break;
        }
      }
    }
    return new GameState(
      new Room(room),
      new PointSet(boxes),
      new PointSet(winState),
      this.player,
    );
  }

  /**
   * Распарсить текст
   * @param {string} levelText Текст уровня (# - стена, @ - игрок, . - место ящика, B - ящик, \n - следующая строка)
   */
  parse(levelText: string) {
    this._blocks = [];
    const blocksToSet: BlockType[][] = levelText
      .split("\n")
      .map((textRow: string) => {
        const arr = Array.from(textRow).map((cell) => {
          return Object.values(BlockType).includes(cell as BlockType)
            ? (cell as BlockType)
            : BlockType.Empty;
        });
        return arr;
      });
    this.blocks = blocksToSet;
  }

  /**
   * Клонирует уровень
   * @return {Level}
   */
  clone() {
    return new Level(this.name, this.blocks);
  }

  /**
   * Устанавливает блок
   * @param {number} i Номер строки
   * @param {number} j Номер столбца
   * @param {BlockType} blockType Тип блока
   */
  setBlock(i: number, j: number, blockType: BlockType) {
    // Уберем игрока, если ставим нового
    if (
      blockType == BlockType.Player &&
      this.player &&
      (j != this.player.x || i != this.player.y)
    ) {
      this._blocks[this.player.y][this.player.x] = BlockType.Empty;
    }
    this._blocks[i][j] = blockType;
  }

  /**
   * Устанавливает блок в клонированный уровень (иммутабельный вариант)
   * @param {number} i Номер строки
   * @param {number} j Номер столбца
   * @param {BlockType} blockType Тип блока
   * @return {Level}
   */
  setBlockImmutable(i: number, j: number, blockType: BlockType) {
    const newLevel = this.clone();
    newLevel.setBlock(i, j, blockType);
    return newLevel;
  }
}
