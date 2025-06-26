import { useState, useEffect, useRef } from "react";
import { GameState } from "app/model";

/**
 * Компонент состояний игры
 * @param {GameState[]} options.states Состояния игры
 * @param {number} options.index Текущий индекс
 * @param {(index: number) => any} options.onChange Обработчик по изменению значения
 */
function GameHistory({
  states = [],
  index = 0,
  onChange,
}: {
  states?: GameState[];
  index?: number;
  onChange: (index: number) => any;
}) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playbackTimeoutId = useRef<number>(null);
  const rootRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    // console.log(index, states.length, isPlaying);
    if (isPlaying) {
      if (index < states.length - 1) {
        playbackTimeoutId.current = window.setTimeout(() => {
          onChange(index + 1);
        }, 500);
      } else {
        setIsPlaying(false);
      }
    }
    return () => {
      if (!playbackTimeoutId.current) {
        return;
      }
      // console.log('clear timeout ' + performance.now());
      window.clearTimeout(playbackTimeoutId.current);
      playbackTimeoutId.current = null;
    };
  }, [states, index, isPlaying]);

  return (
    <div className="game-history">
      <input
        className="game-history__range"
        type="range"
        min="0"
        max={states.length - 1}
        value={index}
        onChange={(e) => {
          onChange(parseInt(e.target.value) || 0);
        }}
      />
      <div
        className={
          "game-history__stats" +
          (states[index].isWin ? " game-history__stats_win" : "")
        }
      >
        {index + 1} / {states.length}
      </div>
      <div className="game-history__controls">
        <button
          type="button"
          className={
            "game-history__control game-history__control_play" +
            (index == states.length - 1 || isPlaying
              ? " game-history__control_disabled"
              : "")
          }
          onClick={() => setIsPlaying(true)}
        ></button>
        <button
          type="button"
          className={
            "game-history__control game-history__control_pause" +
            (!isPlaying ? " game-history__control_disabled" : "")
          }
          onClick={() => setIsPlaying(false)}
        ></button>
        <button
          type="button"
          className={
            "game-history__control game-history__control_replay" +
            (index == 0 ? " game-history__control_disabled" : "")
          }
          onClick={() => {
            onChange(0);
          }}
        ></button>
      </div>
    </div>
  );
}
GameHistory.displayName = "GameHistory";
export default GameHistory;
