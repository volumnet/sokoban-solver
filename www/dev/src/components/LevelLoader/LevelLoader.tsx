import { useState, useRef } from "react";

/**
 * Загрузчик файлов
 * @param {?String} options.className  CSS-класс
 * @param {?(file: File) => any} options.onFileLoad Обработчик загрузки файла
 */
function LevelLoader({
  className = "",
  onFileLoad,
}: {
  className?: string;
  onFileLoad?: (file: File) => any;
}) {
  const [dragOver, setDragOver] = useState(false);
  let fieldRef = useRef<HTMLInputElement>(null);

  /**
   * Обработчик файла
   * @param  {File} file Файл
   */
  async function handleFile(file: File) {
    if (fieldRef.current) {
      fieldRef.current.value = "";
    }
    onFileLoad && onFileLoad(file);
  }

  /**
   * Событие обработки отпускания файла
   * @param {React.DragEvent<HTMLLabelElement>} e Событие
   */
  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    if (!e?.dataTransfer?.files?.length) {
      if (fieldRef.current) {
        fieldRef.current.value = "";
      }
      return;
    }
    const filesArr = Array.from(e.dataTransfer.files);
    handleFile(filesArr[0]);
  }

  /**
   * Событие изменения поля
   * @param  {React.ChangeEvent<HTMLInputElement>} e Событие
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e?.target?.files?.length) {
      if (fieldRef.current) {
        fieldRef.current.value = "";
      }
      return;
    }
    const filesArr = Array.from(e.target.files);
    handleFile(filesArr[0]);
  }

  return (
    <label
      className={
        className +
        " level-loader btn btn-default" +
        (dragOver ? " level-loader_drag" : "")
      }
      onDragOver={() => setDragOver(true)}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        handleDrop(e);
        setDragOver(false);
      }}
    >
      <input
        type="file"
        accept=".txt"
        ref={fieldRef}
        onChange={(e) => handleChange(e)}
      />
      Загрузить файл
    </label>
  );
}
LevelLoader.displayName = "LevelLoader";
export default LevelLoader;
