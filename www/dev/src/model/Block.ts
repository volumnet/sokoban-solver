import BlockType from "./BlockType.ts";
import BlockMovement from "./BlockMovement.ts";

/**
 * Блок
 */
export default class Block {
  /**
   * Тип блока
   * @type {BlockType}
   */
  type: BlockType = BlockType.Empty;

  /**
   * Движение блока
   * @type {BlockMovement}
   */
  movement: BlockMovement = BlockMovement.None;
}
