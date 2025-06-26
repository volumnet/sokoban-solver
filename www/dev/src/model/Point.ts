import BlockMovement from "./BlockMovement.ts";
import Config from "./Config.ts";
import PointsRepo from "./PointsRepo.ts";

/**
 * Точка в пространстве
 */
export default class Point extends Array<number> {
  /**
   * Сериализация (строковое представление) точки
   * @type {string}
   */
  readonly str: string = "";

  /**
   * Точка сверху
   * @type {Point|null}
   */
  protected _up: Point | null | undefined = undefined;

  /**
   * Точка снизу
   * @type {Point|null}
   */
  protected _down: Point | null | undefined = undefined;

  /**
   * Точка слева
   * @type {Point|null}
   */
  protected _left: Point | null | undefined = undefined;

  /**
   * Точка справа
   * @type {Point|null}
   */
  protected _right: Point | null | undefined = undefined;

  constructor(x: number, y: number) {
    super(x, y);
    this.str = this.x.toString(36) + this.y.toString(36);
    if (this.length !== 2) {
      throw new Error("Point должен содержать ровно 2 числа");
    }
  }

  /**
   * Положение слева
   * @return {Point|null} [description]
   */
  get left(): Point | null {
    if (this._left === undefined) {
      if (this[0] > 0) {
        this._left = PointsRepo.get(this[0] - 1, this[1]);
      } else {
        this._left = null;
      }
    }
    return this._left;
  }

  /**
   * Положение справа
   * @return {Point|null} [description]
   */
  get right(): Point | null {
    if (this._right === undefined) {
      if (this[0] < Config.size - 1) {
        this._right = PointsRepo.get(this[0] + 1, this[1]);
      } else {
        this._right = null;
      }
    }
    return this._right;
  }

  /**
   * Положение сверху
   * @return {Point|null} [description]
   */
  get up(): Point | null {
    if (this._up === undefined) {
      if (this[1] > 0) {
        this._up = PointsRepo.get(this[0], this[1] - 1);
      } else {
        this._up = null;
      }
    }
    return this._up;
  }

  /**
   * Положение снизу
   * @return {Point|null} [description]
   */
  get down(): Point | null {
    if (this._down === undefined) {
      if (this[1] < Config.size - 1) {
        this._down = PointsRepo.get(this[0], this[1] + 1);
      } else {
        this._down = null;
      }
    }
    return this._down;
  }

  /**
   * Координата X
   * @return {number}
   */
  get x(): number {
    return this[0];
  }

  /**
   * Координата Y
   * @return {number}
   */
  get y(): number {
    return this[1];
  }

  // Переопределим push и unshift, чтобы не сломать структуру
  override push(...items: number[]): number {
    throw new Error("Запрет изменения элементов в Point");
  }

  override unshift(...items: number[]): number {
    throw new Error("Запрет изменения элементов в Point");
  }

  /**
   * Сериализует точку в строку
   * @return {string}
   */
  toString(): string {
    return this.str;
  }

  /**
   * Возвращает точку из строки
   * @param {string} pos Строковое представление точки
   */
  static fromString(pos: string): Point {
    return PointsRepo.fromString(pos);
  }

  /**
   * Получает соседнюю (либо ту же) точку
   * @param  {BlockMovement} movement Движение
   * @return {Point|null} null, если невозможно двигаться (край поля)
   */
  stepTo(movement: BlockMovement): Point | null {
    switch (movement) {
      case BlockMovement.None:
        return this;
        break;
      case BlockMovement.Left:
        return this.left;
        break;
      case BlockMovement.Right:
        return this.right;
        break;
      case BlockMovement.Up:
        return this.up;
        break;
      case BlockMovement.Down:
        return this.down;
        break;
    }
    return null;
  }

  /**
   * Та же самая точка
   * @param  {Point} point Точка для проверки
   * @return {boolean}
   */
  isSame(point: Point): boolean {
    if (this == point) {
      return true;
    }
    if (this.x == point.x && this.y == point.y) {
      return true;
    }
    return false;
  }
}
