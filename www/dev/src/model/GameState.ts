import PointSet from './PointSet.ts';
import Point from './Point.ts';
import Config from './Config.ts';
import BlockMovement from './BlockMovement.ts';
import BlockType from './BlockType.ts';
import Room from './Room.ts';
import Level from './Level.ts';
import Solver from './Solver.ts';

/**
 * Состояние игры
 */
export default class GameState {
    
    /**
     * Набор точек около стен
     * @type {PointSet}
     */
    protected _nearWalls: PointSet|null = null;

    /**
     * Является ли состояние выигрышным
     * @type {[type]}
     */
    protected _isWin: boolean|null = null;

    /**
     * До куда может дойти игрок, не двигая ящики
     * @type {{[key: string Сериализация точки]: string набор шагов}|null}
     */
    protected _canReachTo: {[key: string]: string}|null = null; 

    /**
     * Конструктор класса
     * @param {Room} readonly room Состояние комнаты
     * @param {PointSet} readonly boxes Состояние ящиков
     * @param {PointSet} readonly winState Выигрышное состояние
     * @param {Point|null} readonly player Положение игрока
     */
    constructor( 
        readonly room: Room, 
        readonly boxes: PointSet, 
        readonly winState: PointSet,
        readonly player: Point|null
    ) {
    }


    /**
     * Проверяет корректность уровня
     * @return {boolean|never}
     * @throws string
     */
    check(): true|never
    {
        if (!this.boxes.length) {
            throw 'Нужен хотя бы один ящик';
        }
        if (this.winState.length > this.boxes.length) {
            throw ('Не хватает ящиков (еще ' + (this.winState.length - this.boxes.length) + ')');
        }
        if (!this.player) {
            throw 'Не указано положение игрока';
        }
        return true;
    }


    /**
     * Получает набор точек возле стен
     * @return {PointSet}
     */
    get nearWalls(): PointSet {
        if (!this._nearWalls) {
            let wallsPoints: Point[] = [];
            for (let corner of Object.values(this.room.corners.points)) {
                // Идем вправо, проверяем верх
                for (let move of [BlockMovement.Up, BlockMovement.Right, BlockMovement.Down, BlockMovement.Left]) {
                    const wall = this.checkWall(corner, move);
                    wallsPoints = wallsPoints.concat(wall);
                }
            }
            this._nearWalls = new PointSet(wallsPoints);
            // console.log(this._nearWalls.points)
        }
        return this._nearWalls;
    }


    /**
     * Получает тип блока по точке
     * @param {Point} point Точка
     * @return {BlockType}
     */
    blockType(point: Point): BlockType
    {
        if (this.room.hasPoint(point)) {
            return BlockType.Wall;
        }
        if (this.boxes.hasPoint(point)) {
            return BlockType.Box;
        }
        if (this.winState.hasPoint(point)) {
            return BlockType.Place;
        }
        return BlockType.Empty;
    }


    /**
     * Проверяет стену со стороны, начиная от точки
     * @param  {Point} initial Начальная точка для проверки
     * @param  {BlockMovement} checkDirection Направление для проверки стены
     * @return {Point[]} Набор точек возле стены
     */
    checkWall(initial: Point, checkDirection: BlockMovement): Point[]
    {
        const result: Point[] = [];
        let next: Point|null = initial;
        // console.log(initial);
        let moveDirection: BlockMovement = BlockMovement.Right;
        if ((checkDirection == BlockMovement.Left) || (checkDirection == BlockMovement.Right)) {
            moveDirection = BlockMovement.Down;
        }
        // console.log('moving to ' + moveDirection, 'check to ' + checkDirection)
        do {
            const possibleWall = next.stepTo(checkDirection);
            if (this.winState.hasPoint(next)) { // Это выигрышная позиция, не считаем за стену
                // console.log(next.str + ' is win');
                return [];
            }
            if (possibleWall && !this.room.hasPoint(possibleWall)) { // Нет стены с обозначенного направления, вся стена аннулируется
                // console.log(next.str + ' has not wall aside ' + possibleWall.str);
                return [];
            }
            if (this.room.hasPoint(next)) { // Текущая позиция - стена, прерываем цикл с текущим результатом
                // console.log(next.str + ' is wall');
                break;
            }
            // console.log(next.str + ' is ok');
            result.push(next);
        } while (next = next.stepTo(moveDirection));
        return result;
    }


    /**
     * Выигрышное состояние
     * @return {boolean}
     */
    get isWin(): boolean
    {
        if (this._isWin === null) {
            let newWin = true;
            for (let pointCode in this.winState.points) {
                if (this.boxes.points[pointCode] === undefined) {
                    newWin = false;
                }
            }
            this._isWin = newWin;
        }
        return this._isWin;
    }


    /**
     * До куда может дойти игрок, не двигая ящики
     * @return {{[key: string Сериализация точки]: string набор шагов}|never}
     */
    get canReachTo(): {[key: string]: string}|never
    {
        this.check();
        if (!this.player) {
            return {};
        }
        if (!this._canReachTo) {
            const result: {[key: string]: string} = {};
            result[this.player.toString()] = '';
            let ch: {[key: string]: string} = {...result};
            while (Object.keys(ch).length) {
                const newCh: {[key: string]: string} = {};
                for (let pointCode in ch) {
                    const point = Point.fromString(pointCode);
                    for (let move of [BlockMovement.Up, BlockMovement.Right, BlockMovement.Down, BlockMovement.Left]) {
                        const newPoint = point.stepTo(move);
                        if (newPoint) {
                            const newPointStr = newPoint.toString();
                            if ((result[newPointStr] === undefined) && !this.isEngaged(newPoint)) { // undefined, поскольку первая точка со значением ''
                                newCh[newPointStr] = result[newPointStr] = ch[pointCode] + move;
                            }
                        }
                    };
                }
                ch = newCh;
            }
            this._canReachTo = result;
        }
        return this._canReachTo;
    }


    /**
     * Получает возможные состояния из текущего
     * @param {Point|null} restrictToBox ограничить движение только текущим ящиком
     * @return {[key: string Путь]: GameState}
     */
    nextStates(restrictToBox: Point|null = null): {[key: string]: GameState} 
    {
        // console.time('nextStates');
        const result: {[key: string]: GameState} = {};
        const canReachTo = this.canReachTo;
        let boxesSet: Point[];
        if (restrictToBox) {
            boxesSet = [restrictToBox];
        } else {
            boxesSet = Object.values(this.boxes.points);
        }
        for (let box of boxesSet) {
            for (let move of [BlockMovement.Up, BlockMovement.Right, BlockMovement.Down, BlockMovement.Left]) {
                let oppositeMove: BlockMovement = BlockMovement.None;
                let oppositeSide;
                switch (move) {
                    case BlockMovement.Up:
                        oppositeMove = BlockMovement.Down;
                        break;
                    case BlockMovement.Right:
                        oppositeMove = BlockMovement.Left;
                        break;
                    case BlockMovement.Down:
                        oppositeMove = BlockMovement.Up;
                        break;
                    case BlockMovement.Left:
                        oppositeMove = BlockMovement.Right;
                        break;
                }
                if (oppositeMove == BlockMovement.None) { // Не задано движение (для совместимости)
                    continue;
                }
                oppositeSide = box.stepTo(oppositeMove);
                if (!oppositeSide) { // Не доступна противоположная движению сторона
                    continue;
                }
                const oppositeSidePath = canReachTo[oppositeSide.toString()];
                if (oppositeSidePath === undefined) { // Не может пройти до противоположной стороны; undefined, поскольку первая точка со значением ''
                    continue;
                }
                if (!this.blockMovementAvailable(box, move)) { // Не получится сдвинуть блок в эту сторону
                    continue;
                }
                const newPath = oppositeSidePath + move;
                const newBoxes = this.boxes.movePoint(box, move);
                if (newBoxes) {
                    const newState = new GameState(this.room, newBoxes, this.winState, box);
                    newState._nearWalls = this.nearWalls; // Наследуем точки возле стены, т.к. room и winState не меняются
                    // console.log(box, move, newPath, newState);
                    result[newPath] = newState;
                }
            };
        }
        // console.timeEnd('nextStates');
        return result;
    }


    /**
     * Доступно ли движение блока
     * @param {Point} block Блок для движения
     * @param {BlockMovement} move  Движение
     * @return {boolean}
     */
    blockMovementAvailable(block: Point, move: BlockMovement): boolean
    {
        const newPoint = block.stepTo(move);
        if (!newPoint) {
            return false;
        }
        if (this.isEngaged(newPoint)) { // Место занято
            return false;
        }
        if (this.winState.hasPoint(newPoint)) { // Выигрышное место
            return true;
        }
        if (this.room.corners.hasPoint(newPoint)) { // Угол стены, но не выигрышная позиция
            return false;
        }
        if (this.nearWalls.hasPoint(newPoint)) { // Позиция возле стены (не выигрышная, это определяется при определении стен)
            return false;
        }

        const up = newPoint.up;
        const hasUp = !up || !!this.isEngaged(up);
        const down = newPoint.down;
        const hasDown = !down || !!this.isEngaged(down);
        const left = newPoint.left;
        const hasLeft = !left || !!this.isEngaged(left);
        const right = newPoint.right;
        const hasRight = !right || !!this.isEngaged(right);
        const upLeft = up?.left;
        const hasUpLeft = !upLeft || !!this.isEngaged(upLeft);
        const upRight = up?.right; 
        const hasUpRight = !upRight || !!this.isEngaged(upRight);
        const downLeft = down?.left;
        const hasDownLeft = !downLeft || !!this.isEngaged(downLeft);
        const downRight = down?.right; 
        const hasDownRight = !downRight || !!this.isEngaged(downRight);

        switch (move) {
            case BlockMovement.Up:
                if (hasUp && ((hasLeft && hasUpLeft) || (hasRight && hasUpRight))) {
                    return false;
                }
                break;
            case BlockMovement.Down:
                if (hasDown && ((hasLeft && hasDownLeft) || (hasRight && hasDownRight))) {
                    return false;
                }
                break;
            case BlockMovement.Left:
                if (hasLeft && ((hasUp && hasUpLeft) || (hasDown && hasDownLeft))) {
                    return false;
                }
                break;
            case BlockMovement.Right:
                if (hasRight && ((hasUp && hasUpRight) || (hasDown && hasDownRight))) {
                    return false;
                }
                break;
        }

        return true;
    }


    /**
     * Позиция занята
     * @param {Point} point
     * @return {boolean}
     * @todo Оптимизировать по возможности, время 5.126/13.513 сек.
     */
    isEngaged(point: Point): boolean {
        if (this.room.hasPoint(point)) { // Стена
            return true;
        }
        if (this.boxes.hasPoint(point)) { // Ящик
            return true;
        }
        return false;
    }


    /**
     * Движение в процессе игры
     * @param  {BlockMovement} move Движение
     * @return {GameState|null|neven} Следующее состояние, либо null, если невозможно сходить
     * @throws {string} Если движение приведет к проигрышу
     */
    playMove(move: BlockMovement): GameState|null|never
    {
        if (!this.player) {
            return null; // Нет игрока
        }
        const nextPoint = this.player.stepTo(move);
        if (!nextPoint) {
            return null; // Невозможно сходить, конец экрана
        }
        if (this.room.hasPoint(nextPoint)) {
            return null; // Уперся в стену
        }
        if (this.boxes.hasPoint(nextPoint)) { // Двигаем ящик
            const nextNextPoint = nextPoint.stepTo(move);
            if (!nextNextPoint) {
                return null; // Невозможно передвинуть, конец экрана
            }
            if (this.isEngaged(nextNextPoint)) {
                return null; // Ящик уперся в стену или другой ящик
            }
            if (!this.blockMovementAvailable(nextPoint, move)) {
                throw 'Этот ход приведет к проигрышу, не надо так!';
            }
            const newBoxes = this.boxes.movePoint(nextPoint, move);
            if (!newBoxes) {
                return null; // Невозможно сходить 
            }
            return new GameState(this.room, newBoxes, this.winState, nextPoint);
        }

        // Просто двигаемся
        return new GameState(this.room, this.boxes, this.winState, nextPoint);
    }


    /**
     * Получает набор состояний, соответствующий пути
     * @param  {string} path Сериализация пути
     * @return {GameState[]}
     */
    getStatesFromPath(path: string): GameState[]
    {
        const result: GameState[] = [];
        let currentState: GameState|null = this;
        for (let i = 0; i < path.length; i++) {
            currentState = currentState.playMove(path[i] as BlockMovement);
            if (!currentState) {
                break;
            }
            result.push(currentState);
        }
        return result;
    }
}