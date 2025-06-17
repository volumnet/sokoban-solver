import Level from './Level.ts';
import GameState from './GameState.ts';
import PointSet from './PointSet.ts';

/**
 * Решение уровня
 */
export default class Solver
{
    /**
     * Состояния
     * @type {[key: string Конкатенация состояния игрока и ящиков]: string Минимальный путь к состоянию}
     */
    readonly states: {[key: string]: string} = {};

    /**
     * Вложенность (ходов со сдвигом ящиков)
     * @type {number}
     */
    private _depth: number = 0;

    /**
     * Конструктор класса
     * @param {Level} level Уровень для решения
     */
    constructor(readonly level: Level)
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
     * Решает уровень
     * @param {() => any} callback Функция обновления состояния
     * @return {string|null} Путь к выигрышному состоянию, либо null, если не удалось найти
     */
    async solve(callback: () => any): Promise<string|null>
    {
        let ch: {[key: string]: GameState} = {};
        const initialState = this.level.gameState;
        ch[''] = initialState; // Начальное состояние
        
        while (Object.keys(ch).length && this._depth < 8) {
            const st = performance.now();
            let newCh: {[key: string]: GameState} = {};
            for (let currentPath in ch) {
                const currentState = ch[currentPath];
                const processStateResult = this.processState(currentPath, currentState);
                if (typeof(processStateResult) == 'string') {
                    return processStateResult;
                } else {
                    newCh = {...newCh, ...processStateResult};
                }
            }
            ch = newCh;
            this._depth++;
            console.log('Вложенность: ' + this._depth, 'Состояний: ', Object.keys(ch).length, 'Всего состояний: ', Object.keys(this.states).length, 'Время: ' + (performance.now() - st));
        }
        return null;
    }


    /**
     * Обрабатывает состояние
     * @param {string} currentPath Путь к текущему состоянию
     * @param {GameState} currentState Текущее состояние
     * @return {string|{[key: string]: GameState}} Путь к выигрышному состоянию, либо набор следующих состояний
     */
    processState(currentPath: string, currentState: GameState): string|{[key: string]: GameState}
    {
        const nextStates = currentState.nextStates;
        const newCh: {[key: string]: GameState} = {};
        for (let pathToNextState in nextStates) {
            const nextState = nextStates[pathToNextState];
            const nextStateCode = nextState.player.toString() + nextState.boxes.toString();
            const fullPath = currentPath + pathToNextState;
            if (nextState.isWin) {
                return fullPath;
            }
            if (!this.states[nextStateCode]) {
                newCh[fullPath] = nextState;
                this.states[nextStateCode] = fullPath;
            }
        }
        return newCh;
    }
}