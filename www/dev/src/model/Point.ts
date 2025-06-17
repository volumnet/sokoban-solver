import BlockMovement from './BlockMovement.ts';
import Level from './Level.ts';
import Config from 'app/model/config.ts';

/**
 * Точка в пространстве
 */
export default class Point extends Array<number> {
    constructor(x: number, y: number) {
        super(x, y);
        if (this.length !== 2) {
            throw new Error('Point должен содержать ровно 2 числа');
        }
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


    /**
     * Точка вверху данной, если есть
     * @return {Point|null}
     */
    get up(): Point|null {
        return this.stepTo(BlockMovement.Up);
    }


    /**
     * Точка внизу данной, если есть
     * @return {Point|null}
     */
    get down(): Point|null {
        return this.stepTo(BlockMovement.Down);
    }


    /**
     * Точка слева от данной, если есть
     * @return {Point|null}
     */
    get left(): Point|null {
        return this.stepTo(BlockMovement.Left);
    }


    /**
     * Точка слева от данной, если есть
     * @return {Point|null}
     */
    get right(): Point|null {
        return this.stepTo(BlockMovement.Right);
    }


    // Переопределим push и unshift, чтобы не сломать структуру
    override push(...items: number[]): number {
        throw new Error('Запрет изменения элементов в Point');
    }


    override unshift(...items: number[]): number {
        throw new Error('Запрет изменения элементов в Point');
    }


    /**
     * Сериализует точку в строку
     * @return {string}
     */
    toString(): string {
      return this[0].toString(36) + this[1].toString(36);
    }


    /**
     * Возвращает точку из строки
     * @param {string} pos Строковое представление точки
     */
    static fromString(pos: string): Point
    {
        const x = parseInt(pos[0] || '0', 36);
        const y = parseInt(pos[1] || '0', 36);
        return new Point(x, y);
    }


    /**
     * Получает соседнюю (либо ту же) точку
     * @param  {BlockMovement} movement Движение
     * @return {Point|null} null, если невозможно двигаться (край поля)
     */
    stepTo(movement: BlockMovement): Point|null
    {
        switch (movement) {
            case BlockMovement.None:
                return this;
                break;
            case BlockMovement.Left:
                if (this[0] > 0) {
                    return new Point(this[0] - 1, this[1]);
                }
                break;
            case BlockMovement.Right:
                if (this[0] < Config.size - 1) {
                    return new Point(this[0] + 1, this[1]);
                }
                break;
            case BlockMovement.Up:
                if (this[1] > 0) {
                    return new Point(this[0], this[1] - 1);
                }
                break;
            case BlockMovement.Down:
                if (this[1] < Config.size - 1) {
                    return new Point(this[0], this[1] + 1);
                }
                break;
        }
        return null;
    }
}