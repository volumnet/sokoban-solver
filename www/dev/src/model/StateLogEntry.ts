/**
 * Запись в логе состояний игры
 */
export type StateLogEntry { 
    fromState: string;
    state: string;
    box: string;
    move: string;
    playerMove: string;
    fullPath: string;
    isWin: boolean;
};
export default StateLogEntry;