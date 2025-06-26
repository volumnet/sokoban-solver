import { Level } from "app/model";

/**
 * Список уровней
 * @param {Level[]} options.levels Список уровней
 * @param {(index: number Номер уровня) => any} options.onSelect Обработчик клика
 */
function Levels({
  levels,
  onSelect,
}: {
  levels: Level[];
  onSelect: (index: number) => any;
}) {
  const children = levels.map((level, index) => (
    <li key={index} className="levels__item">
      <button className="levels__link" onClick={() => onSelect(index)}>
        {level.name}
      </button>
    </li>
  ));
  return (
    <nav className="levels">
      <ul className="levels__list">
        {children}
        <li className="levels__item">
          <button
            className="levels__link levels__link_new"
            onClick={() => onSelect(-1)}
          >
            Новый
          </button>
        </li>
      </ul>
    </nav>
  );
}
Levels.displayName = "Levels";
export default Levels;
