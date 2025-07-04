import { useState, useRef, useEffect, useCallback } from 'react';
import { Level, BlockType, GameState, Point, BlockMovement, LevelFileProcessor, Solver, StateLogEntry } from 'app/model';
import { LevelLegend, GameField, GameHistory, LevelLoader } from 'app/components';

/**
 * Компонент игры уровня
 * @param {Level} options.level Уровень
 * @param {() => any} options.onEdit Обработчик события редактирования
 * @param {() => any} options.onDelete Обработчик события удаления
 * @param {() => any} options.onClose Обработчик события закрытия
 */
function LevelGamePlayComponent({
  level,
  onEdit,
  onDelete,
  onClose,
}: {
  level: Level;
  onEdit: () => any;
  onDelete: () => any;
  onClose: () => any;
}) {
  const [gameStates, setGameStates] = useState([level.gameState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    depth: 0,
    variants: 0,
    time: 0,
    active: false,
    hasStatesLog: false,
  });
  const solver = useRef<Solver>(null);
  const currentGameState: GameState = gameStates[currentIndex];
  /**
   * Добавляет новый шаг
   * @param {BlockMovement} move Шаг
   */
  const handleMove = useCallback(
    (move: BlockMovement) => {
      try {
        const newState = currentGameState.playMove(move);
        if (newState) {
          setGameStates([...gameStates.slice(0, currentIndex + 1), newState]);
          setCurrentIndex(currentIndex + 1);
          if (!currentGameState.isWin && newState.isWin) {
            window.setTimeout(() => alert('Вы выиграли!'));
          }
        }
      } catch (e) {
        alert(e);
      }
    },
    [currentIndex, gameStates, currentGameState],
  );

  /**
   * Отмена последнего шага
   */
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  /**
   * Повтор последнего шага
   */
  const handleRedo = useCallback(() => {
    if (currentIndex < gameStates.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  }, [gameStates, currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          handleMove(BlockMovement.Up);
          break;
        case 'ArrowDown':
        case 'KeyS':
          handleMove(BlockMovement.Down);
          break;
        case 'ArrowLeft':
        case 'KeyA':
          handleMove(BlockMovement.Left);
          break;
        case 'ArrowRight':
        case 'KeyD':
          handleMove(BlockMovement.Right);
          break;
        case 'KeyZ':
          if (e.ctrlKey) {
            handleUndo();
          }
          break;
        case 'KeyY':
          if (e.ctrlKey) {
            handleRedo();
          }
          break;
      }
      if (
        ['ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].indexOf(e.code) != -1 ||
        (['KeyZ', 'KeyY'].indexOf(e.code) != -1 && e.ctrlKey)
      ) {
        e.preventDefault();
      }
    };
    // console.log('added keydown ' + performance.now());
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      // console.log('removed keydown ' + performance.now());
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleMove, handleUndo, handleRedo]);

  async function handleSolve(gameState: GameState, gameStateIndex: number) {
    try {
      setStats({ depth: 0, variants: 0, time: 0, active: false, hasStatesLog: false });
      solver.current = new Solver(gameState, 1000, true);
      const result = await solver.current.solve(() => {
        if (!solver.current) {
          return;
        }
        setStats({
          depth: solver.current.depth,
          variants: solver.current.variants,
          time: Math.round(solver.current.totalTime / 1000),
          active: solver.current.active,
          hasStatesLog: false,
        });
      });
      if (result) {
        setGameStates([...gameStates.slice(0, currentIndex + 1), ...result]);
        if (solver.current) {
          setStats({
            depth: solver.current.depth,
            variants: solver.current.variants,
            time: Math.round(solver.current.totalTime / 1000),
            active: solver.current.active,
            hasStatesLog: solver.current.variants > 0 && solver.current.writeLog,
          });
        }
        window.setTimeout(() => {
          alert('Решение найдено!');
          console.log(solver);
        });
      }
    } catch (e) {
      alert(e);
    }
  }

  function handleStop() {
    if (!solver.current) {
      return;
    }
    solver.current.stop();
    setStats({ ...stats, active: solver.current.active, hasStatesLog: false });
  }

  function saveStatesLog() {
    if (!solver?.current?.statesLog?.length) {
      return;
    }
    let text = "Из состояния;В состояние;Ящик;Движение;Ходы игрока;Полный путь;Выигрыш\n";
    text += solver.current.statesLog.map((stateLogEntry: StateLogEntry): string => {
      return (
        stateLogEntry.fromState + ';' +
        stateLogEntry.state + ';' +
        stateLogEntry.box + ';' +
        stateLogEntry.move + ';' +
        stateLogEntry.playerMove + ';' +
        stateLogEntry.fullPath + ';' +
        (stateLogEntry.isWin ? '1' : '')
      );
    }).join("\n");
    const blob = new Blob([text], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = (level.name || "Уровень") + " - ходы.log.csv";
    a.click();

    URL.revokeObjectURL(url); // Очистка

  }

  return (
    <div className="level">
      <main className="level__main">
        <h3>{level.name}</h3>
        <GameHistory
          states={gameStates}
          index={currentIndex}
          onChange={(index: number) => {
            setCurrentIndex(index);
          }}
        />
        <div className="level__hint level__hint_desktop">
          Используйте стрелки или клавиши WASD, чтобы двигаться
          <br />
          Используйте Ctrl+Z / Ctrl+Y для отмены/повтора хода, либо слайдер истории ходов вверху.
        </div>
        <div className="level__hint level__hint_mobile">
          Нажимайте на свободное поле, чтобы по возможности переместиться туда.
          <br />
          Нажимайте на ящик рядом с вами, чтобы передвинуть его.
        </div>
        <GameField
          key="field"
          className="level__field"
          gameState={currentGameState}
          editorMode={false}
          size={level.size}
          onBlockClick={(point: Point) => {
            const currentPosition: Point | null = currentGameState.player;
            if (!currentPosition) {
              return;
            }
            if (currentGameState.boxes.hasPoint(point)) {
              if (point.stepTo(BlockMovement.Up) == currentPosition) {
                handleMove(BlockMovement.Down);
              }
              if (point.stepTo(BlockMovement.Down) == currentPosition) {
                handleMove(BlockMovement.Up);
              }
              if (point.stepTo(BlockMovement.Left) == currentPosition) {
                handleMove(BlockMovement.Right);
              }
              if (point.stepTo(BlockMovement.Right) == currentPosition) {
                handleMove(BlockMovement.Left);
              }
              return;
            }
            const path = currentGameState.canReachTo[point.toString()];
            if (path) {
              const newStates = currentGameState.getStatesFromPath(path);
              setGameStates([...gameStates.slice(0, currentIndex + 1), ...newStates]);
              setCurrentIndex(currentIndex + newStates.length);
            }
            return;
          }}
        />
      </main>
      <aside className="level__aside">
        <div className="level__controls">
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            Редактировать
          </button>
          {stats.active ? (
            <button type="button" className="btn btn-warning" onClick={() => handleStop()}>
              Остановить
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-success"
              onClick={() => handleSolve(currentGameState, currentIndex)}
            >
              Решить
            </button>
          )}
          {stats.hasStatesLog ? (
            <button type="button" className="btn btn-default" onClick={saveStatesLog}>
              Сохранить лог состояний
            </button>
          ) : (
            ''
          )}
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => confirm('Вы действительно хотите удалить этот уровень?') && onDelete()}
          >
            Удалить
          </button>
          <button type="button" className="btn btn-default" onClick={onClose}>
            « Назад
          </button>
          {stats.depth ? (
            <div className="level__stat">
              Глубина: <strong>{stats.depth}</strong>
              <br />
              Вариантов: <strong>{stats.variants}</strong>
              <br />
              Время: <strong>{stats.time}</strong> с
            </div>
          ) : (
            ''
          )}
        </div>
      </aside>
    </div>
  );
}
LevelGamePlayComponent.displayName = 'LevelGamePlayComponent';
export default LevelGamePlayComponent;
