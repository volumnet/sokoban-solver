import Point from './Point.ts';
import BlockMovement from './BlockMovement.ts';
import Solver from './Solver.ts';

/**
 * Массив точек
 * При перестановке точек, массив остается тем же самым
 */
export default class PointSet
{
    /**
     * Набор точек
     * @type {[key: string Текстовое представление точки]: Point Точка}
     */
    protected _points: {[key: string]: Point} = {};

    /**
     * Набор точек
     * @return {[key: string Текстовое представление точки]: Point Точка}
     */
    get points(): {[key: string]: Point}
    {
        return this._points;
    }

    /**
     * Количество точек
     * @type {number}
     */
    get length(): number
    {
        return Object.values(this._points).length;
    }

    /**
     * Конструктор класса (общий)
     * @param {{[key: string]: Point}|Point[]} points Точки
     */
    constructor(points: Point[] = [])
    {
        // arr.sort(); // Не нужно, предполагаем что хэш-массив не сортируемый
        for (let point of points) {
            this._points[point.toString()] = point;
        }
    }


    /**
     * Присутствует ли точка в наборе
     * @param  {Point} point Точка
     * @return {boolean}
     */
    hasPoint(point: Point): boolean
    {
        return !!this._points[point.toString()];
    }


    /**
     * Клонировать набор точек
     * @return {PointSet}
     */
    clone(): PointSet
    {
        let newSet = new PointSet();
        newSet._points = {...this._points};
        return newSet;
    }


    /**
     * Добавляет точку (иммутабельно)
     * @param  {Point} point Точка для добавления
     * @return {PointSet}
     */
    addPoint(point: Point): PointSet
    {
        if (this._points[point.toString()]) {
            return this;
        }
        const newSet = this.clone();
        newSet._points[point.toString()] = point;
        return newSet;
    }


    /**
     * Удаляет точку (иммутабельно)
     * @param {Point} point Точка для удаления
     * @return {PointSet}
     */
    deletePoint(point: Point): PointSet
    {
        if (!this._points[point.toString()]) {
            return this;
        }
        const newSet = this.clone();
        delete newSet._points[point.toString()];
        return newSet;
    }


    /**
     * Заменяет точку (иммутабельно)
     * @param {Point} from Точка для удаления
     * @param {Point} to Точка для добавления
     * @return {PointSet}
     */
    replacePoint(from: Point, to: Point): PointSet
    {
        const newSet = this.clone();
        delete newSet._points[from.toString()];
        newSet._points[to.toString()] = to;
        return newSet;
    }


    /**
     * Сдвигает точку (иммутабельно)
     * @param {Point} point Точка для сдвига
     * @param {BlockMovement} movement Сдвиг
     * @return {PointSet}
     */
    movePoint(point: Point, movement: BlockMovement): PointSet
    {
        if (movement == BlockMovement.None) {
            return this;
        }
        if (!this._points[point.str]) {
            return this;
        }
        const newPoint = point.stepTo(movement);
        if (!newPoint) {
            return this;
        }
        if (newPoint == point) {
            return this;
        }
        return this.replacePoint(point, newPoint);
    }

    /**
     * Сериализует массив точек в строку
     * @return {string}
     */
    toString(): string {
        const result = Object.keys(this._points).sort().join('');
        return result;
    }
}