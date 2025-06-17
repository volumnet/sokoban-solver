import Point from './Point.ts';
import BlockMovement from './BlockMovement.ts';
import Config from 'app/model/config.ts';

/**
 * Массив точек
 * При перестановке точек, массив остается тем же самым
 */
export default class PointSet
{
    /**
     * Набор точек
     * @type {boolean[][]}
     */
    protected _points: boolean[][] = [];

    /**
     * Набор точек
     * @return {boolean[][]}
     */
    get points() 
    {
        return this._points;
    }

    /**
     * Конструктор класса (общий)
     * @param {{[key: string]: Point}|Point[]} points Точки
     */
    constructor(points: Point[] = [])
    {
        this._points = (new Array(Config.size)).fill(false, 0, Config.size).map(row => (new Array(Config.size)).fill(false, 0, Config.size));
        const arr = [...points];
        for (let point of arr) {
            this._points[point.y][point.x] = true;
        }
    }


    /**
     * Клонировать набор точек
     * @return {PointSet}
     */
    clone(): PointSet
    {
        let newSet = new PointSet();
        newSet._points = this._points.map((row, i) => [...row]);
        return newSet;
    }


    /**
     * Присутствует ли точка в наборе
     * @param  {Point} point Точка
     * @return {boolean}
     */
    hasPoint(point: Point): boolean
    {
        return this._points[point.y][point.x];
    }


    /**
     * Добавляет точку (иммутабельно)
     * @param  {Point} point Точка для добавления
     * @return {PointSet}
     */
    addPoint(point: Point): PointSet
    {
        const newSet = this.clone();
        newSet._points[point.y][point.x] = true;
        return newSet;
    }


    /**
     * Удаляет точку (иммутабельно)
     * @param {Point} point Точка для удаления
     * @return {PointSet}
     */
    deletePoint(point: Point): PointSet
    {
        const newSet = this.clone();
        newSet._points[point.y][point.x] = false;
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
        newSet._points[from.y][from.x] = false;
        newSet._points[to.y][to.x] = true;
        return newSet;
    }


    /**
     * Сдвигает точку (иммутабельно)
     * @param {Point} point Точка для сдвига
     * @param {BlockMovement} movement Сдвиг
     * @return {PointSet|false}
     */
    movePoint(point: Point, movement: BlockMovement): PointSet|false
    {
        if (!this._points[point.y][point.x] || (movement == BlockMovement.None)) {
            return false;
        }
        const newPoint = point.stepTo(movement);
        if (!newPoint || this._points[newPoint.y][newPoint.x]) {
            return false;
        }
        const newSet = this.clone();
        newSet.replacePoint(point, newPoint);
        return newSet;
    }

    /**
     * Сериализует массив точек в строку
     * @return {string}
     */
    toString(): string {
        const result = this._points.map((row, i) => {
            const iStr = i.toString(36);
            const newRow = row.map((cell, j) => cell ? (j.toString(36) + iStr) : '');
            return newRow.join('');
        }).join('');
        return result;
    }
}