import { BlockType, BlockMovement } from "app/model";

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
