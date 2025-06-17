import Level from './Level.ts';
import GameState from './GameState.ts';
import PointSet from './PointSet.ts';
import PointsRepo from './PointsRepo.ts';
import BlockMovement from './BlockMovement.ts';

/**
 * Решение уровня
 */
export default class Solver
{
    static debugTime: number = 0;

    /**
     * Задействованные состояния
     *
     * @type {[key: string Состояние ящиков]: {[key: string Состояние игрока]: boolean}}
     */
    readonly states: {[key: string]: {[key: string]: boolean}} = {};

    /**
     * Вложенность (ходов со сдвигом ящиков)
     * @type {number}
     */
    private _depth: number = 0;

    /**
     * Время начала, мс
     * @type {number}
     */
    private _startTime: number = 0;

    /**
     * Время окончания, мс
     * @type {number}
     */
    private _endTime: number = 0;

    /**
     * ID# таймаута
     * @type {Number}
     */
    protected timeoutId: number = 0;

    /**
     * Конструктор класса
     * @param {Level} level Уровень для решения
     */
    constructor(readonly level: Level, readonly syncInterval: number = 1000)
    {
    }


    /**
     * Вложенность (ходов со сдвигом ящиков)
     * @return {number}
     */
    get depth(): number {
        return this._depth;
    }


    /**
     * Количество вариантов
     * @return {number}
     */
    get variants(): number {
        return Object.keys(this.states).length;
    }


    /**
     * Время начала, мс
     * @return {number}
     */
    get startTime(): number {
        return this._startTime;
    }


    /**
     * Общее время, мс
     * @return {number}
     */
    get totalTime(): number {
        if (!this._startTime) {
            return 0;
        }
        const endTime = this._endTime || (new Date).getTime();
        return endTime - this._startTime;
    }


    /**
     * Решает уровень
     * @param {() => any} callback Функция обновления состояния
     * @return {string|null} Путь к выигрышному состоянию, либо null, если не удалось найти
     */
    async solve(callback: () => any): Promise<string|null>
    {
        let ch: {[key: string]: GameState} = {};
        const initialState = this.level.gameState;
        ch[''] = initialState; // Начальное состояние
        
        this._startTime = (new Date).getTime();
        const mainSt = performance.now();
        while (Object.keys(ch).length && this._depth < 14) {
            const levelSt = performance.now();
            this._depth++;
            const newCh = await this.asyncProcessDepth(ch, callback);
            if (typeof newCh == 'string') {
                this._endTime = (new Date).getTime();
                callback();
                return newCh;
            }
            
            // callback();
            ch = newCh;
            console.log(
                'Вложенность: ' + this._depth, 
                'Состояний: ', Object.keys(ch).length, 
                'Всего состояний: ', this.variants, 
                'Время: ' + (performance.now() - levelSt),
                'Общее время: ' + this.totalTime,
            );
        }
        // console.log(Solver.debugTime);
        return null;
    }


    async asyncProcessDepth(states: {[key: string]: GameState}, callback: () => any): Promise<{[key: string]: GameState}|string>
    {
        let result: {[key: string]: GameState} = {};
        let left = {...states}

        while (Object.keys(left).length) {
            let subresult: {result: {[key: string]: GameState}, left: {[key: string]: GameState}}|string = await this.asyncProcessDepthChunk(left);
            if (typeof subresult == 'string') {
                return subresult;
            }
            Object.assign(result, subresult.result);
            left = subresult.left;
            callback();
        }
        return result;
    }


    async asyncProcessDepthChunk(states: {[key: string]: GameState}): Promise<{result: {[key: string]: GameState}, left: {[key: string]: GameState}}|string>
    {
        return new Promise((resolve, reject) => {
            window.setTimeout(() => {
                let result: {[key: string]: GameState} = {};
                const left = {...states}
                const st = performance.now();
                for (let currentPath in states) {
                    const currentState = states[currentPath];
                    if (currentState.isWin) {
                        resolve(currentPath);
                        break;
                    }
                    const processStateResult = this.processState(currentPath, currentState);
                    delete left[currentPath];
                    // const processStateResult = await this.asyncProcessState(currentPath, currentState);
                    // result = {...result, ...processStateResult}; // Работает слишком долго
                    Object.assign(result, processStateResult);
                    if (performance.now() > st + this.syncInterval) {
                        // console.log('timeout', {result, left});
                        resolve({result, left});
                        return;
                    }
                }
                // console.log('no variants left', {result, left});
                resolve({result, left});
            })
        });
    }


    /**
     * Обрабатывает состояние
     * @param {string} currentPath Путь к текущему состоянию
     * @param {GameState} currentState Текущее состояние
     * @return {{[key: string]: GameState}} Набор следующих состояний
     */
    processState(currentPath: string, currentState: GameState): {[key: string]: GameState}
    {
        const nextStates = currentState.nextStates();
        const newCh: {[key: string]: GameState} = {};
        for (let pathToNextState in nextStates) {
            const nextState = nextStates[pathToNextState];
            const fullPath = currentPath + pathToNextState;
            
            const nextStateBoxesCode = nextState.boxes.toString();
            const nextStatePlayerCode = nextState.player.toString();
            if (!this.states[nextStateBoxesCode]) {
                this.states[nextStateBoxesCode] = {};
            }
            if (!this.states[nextStateBoxesCode][nextStatePlayerCode]) {
                const canReachTo = nextState.canReachTo;
                for (let box of Object.values(nextState.boxes.points)) {
                    for (let move of [BlockMovement.Up, BlockMovement.Right, BlockMovement.Down, BlockMovement.Left]) {
                        const boxNeighbor = box.stepTo(move);
                        if (boxNeighbor && canReachTo[boxNeighbor.str]) {
                            this.states[nextStateBoxesCode][boxNeighbor.str] = true;
                        }
                    }
                }
                newCh[fullPath] = nextState;
            }
        }
        return newCh;
    }
}