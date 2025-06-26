import { Point, PointsRepo, PointSet, Config } from "app/model";

/**
 * Состояние комнаты
 */
export default class Room extends PointSet {
  /**
   * Угловые позиции
   * Определяются здесь, поскольку у ящиков более строгие требования
   * @type {{[key: string] Сериализация точки: true}}
   */
  readonly corners: PointSet = new PointSet();

  /**
   * Конструктор класса
   * @param {{[key: string]: Point}|Point[]} points Точки
   */
  constructor(points: Point[]) {
    super(points);

    const cornersPoints = this.getCorners();
    this.corners = new PointSet(cornersPoints);
    // console.log(this.corners)
  }

  /**
   * Получает список углов
   * @return {Point[]}
   */
  private getCorners(): Point[] {
    const cornersPoints: Point[] = [];
    for (let i = 0; i < Config.size; i++) {
      for (let j = 0; j < Config.size; j++) {
        if (this.points[j.toString(36) + i.toString(36)]) {
          // Если есть позиция, то не считаем угловым
          continue;
        }
        const point = PointsRepo.get(j, i);
        const up = point.up;
        const hasUp = !up || !!this.hasPoint(up);
        const down = point.down;
        const hasDown = !down || !!this.hasPoint(down);
        const left = point.left;
        const hasLeft = !left || !!this.hasPoint(left);
        const right = point.right;
        const hasRight = !right || !!this.hasPoint(right);
        // Если есть одновременно стена слева или справа, и сверху или снизу, то считаем позицию угловой
        if ((hasUp || hasDown) && (hasLeft || hasRight)) {
          cornersPoints.push(point);
        }
      }
    }
    return cornersPoints;
  }
}
