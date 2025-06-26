import Point from "./Point.ts";
import Config from "./Config.ts";

/**
 * Репозиторий точек
 */
export default class PointsRepo {
  /**
   * Набор точек
   * @type {Point[][]}
   */
  protected static points: Point[][] = [];

  /**
   * Набор точек по кодам
   * @type {Point[][]}
   */
  protected static pointsByCodes: { [key: string]: Point } = {};

  /**
   * Инициализирован ли репозиторий
   * @type {boolean}
   */
  protected static initialized: boolean = false;

  /**
   * Получает точку по координатам
   * @param  {number} x [description]
   * @param  {number} y [description]
   * @return {Point}    [description]
   */
  public static get(x: number, y: number): Point {
    if (!PointsRepo.initialized) {
      PointsRepo.init();
    }
    return PointsRepo.points[y][x];
  }

  /**
   * Возвращает точку из строки
   * @param {string} pos Строковое представление точки
   */
  static fromString(pos: string): Point {
    if (!PointsRepo.initialized) {
      PointsRepo.init();
    }
    return PointsRepo.pointsByCodes[pos];
  }

  /**
   * Инициализация
   */
  protected static init() {
    for (let i = 0; i < Config.size; i++) {
      if (!PointsRepo.points[i]) {
        PointsRepo.points.push([]);
      }
      for (let j = 0; j < Config.size; j++) {
        if (!PointsRepo.points[i][j]) {
          const point = new Point(j, i);
          PointsRepo.points[i].push(point);
          PointsRepo.pointsByCodes[point.toString()] = point;
        }
      }
    }
    this.initialized = true;
  }
}
