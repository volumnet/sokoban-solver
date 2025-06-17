import Point from './Point.ts';
import PointSet from './PointSet.ts';
import Level from './Level.ts';
import BlockMovement from './BlockMovement.ts';
import Config from 'app/model/config.ts';

/**
 * Состояние комнаты
 */
export default class Room extends PointSet
{
    /**
     * Угловые позиции
     * Определяются здесь, поскольку у ящиков более строгие требования
     * @type {{[key: string] Сериализация точки: true}}
     */
    readonly corners: PointSet;

    /**
     * Конструктор класса
     * @param {{[key: string]: Point}|Point[]} points Точки
     */
    constructor(points: Point[]) {
        super(points);
        this.corners = new PointSet();
        
        for (let i = 0; i < Config.size; i++) {
            for (let j = 0; j < Config.size; j++) {
                if (this.points[i][j]) { // Если есть позиция, то не считаем угловым
                    continue;
                }
                const point = new Point(j, i);
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
                    this.corners.addPoint(point);
                }
            }
        }
        // console.log(this.corners)
    }
}