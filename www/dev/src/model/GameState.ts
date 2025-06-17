import PointSet from './PointSet.ts';
import Point from './Point.ts';
import BlockMovement from './BlockMovement.ts';
import Room from './Room.ts';
import Level from './Level.ts';

/**
 * Состояние игры
 */
export default class GameState {
    /**
     * Конструктор класса
     * @param {Room} readonly room Состояние комнаты
     * @param {PointSet} readonly boxes Состояние ящиков
     * @param {PointSet} readonly winState Выигрышное состояние
     * @param {Point} readonly player Положение игрока
     */
    constructor( 
        readonly room: Room, 
        readonly boxes: PointSet, 
        readonly winState: PointSet,
        readonly player: Point 
    ) {
    }


    /**
     * Выигрышное состояние
     * @return {boolean}
     */
    get isWin(): boolean
    {
        for (let pointCode in this.winState.points) {
            if (this.boxes.points[pointCode] === undefined) {
                return false;
            }
        }
        return true;
    }


    /**
     * До куда может дойти игрок, не двигая ящики
     * @return {{[key: string Сериализация точки]: string набор шагов}}
     */
    get canReachTo(): {[key: string]: string}
    {
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
        return result;
    }


    /**
     * Получает возможные состояния из текущего
     * @return {[key: string Путь]: GameState}
     */
    get nextStates(): {[key: string]: GameState} {
        // console.time('nextStates');
        const result: {[key: string]: GameState} = {};
        const canReachTo = this.canReachTo;
        for (let box of Object.values(this.boxes.points)) {
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
        if (this.room.corners.hasPoint(newPoint)) { // Угол стены
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
}