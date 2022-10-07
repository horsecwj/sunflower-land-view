import Decimal from "decimal.js-light";
import { EVENTS, GameEvent } from "../events";
import { FOODS, getKeys } from "../types/craftables";
import { GameState, Inventory, InventoryItemName } from "../types/game";
import { SKILL_TREE } from "../types/skills";

const maxItems: Inventory = {
  // Seed limits + buffer of 10
  Sunflower: new Decimal("3000"),
  Potato: new Decimal("2000"),
  Pumpkin: new Decimal("1000"),
  Carrot: new Decimal("1000"),
  Cabbage: new Decimal("1000"),
  Beetroot: new Decimal("1000"),
  Cauliflower: new Decimal("1000"),
  Parsnip: new Decimal("500"),
  Radish: new Decimal("500"),
  Wheat: new Decimal("500"),

  Chicken: new Decimal("20"),
  Egg: new Decimal("60"),
  "Speed Chicken": new Decimal("5"),
  "Rich Chicken": new Decimal("5"),
  "Fat Chicken": new Decimal("5"),

  "Sunflower Seed": new Decimal(410),
  "Potato Seed": new Decimal(210),
  "Pumpkin Seed": new Decimal(110),
  "Carrot Seed": new Decimal(110),
  "Cabbage Seed": new Decimal(100),
  "Beetroot Seed": new Decimal(90),
  "Cauliflower Seed": new Decimal(90),
  "Parsnip Seed": new Decimal(70),
  "Radish Seed": new Decimal(50),
  "Wheat Seed": new Decimal(50),

  Gold: new Decimal("90"),
  Iron: new Decimal("400"),
  Stone: new Decimal("500"),
  Wood: new Decimal("500"),

  "War Bond": new Decimal(500),
  "Human War Banner": new Decimal(1),
  "Goblin War Banner": new Decimal(1),
  "Chef Hat": new Decimal(1),
  "Rapid Growth": new Decimal(100),

  // Max of 1 food item
  ...(Object.keys(FOODS()) as InventoryItemName[]).reduce(
    (acc, name) => ({
      ...acc,
      [name]: new Decimal(1),
    }),
    {}
  ),

  // Max of 1 skill badge 徽章
  ...(Object.keys(SKILL_TREE) as InventoryItemName[]).reduce(
    (acc, name) => ({
      ...acc,
      [name]: new Decimal(1),
    }),
    {}
  ),
};

/**在单个会话中人类可能的 SFL
 * Humanly possible SFL in a single session
 */
const MAX_SESSION_SFL = 175;

type checkProgressArgs = ProcessEventArgs & { onChain: GameState };

export function checkProgress({ state, action, onChain }: checkProgressArgs): {
  valid: boolean;
  maxedItem?: InventoryItemName | "SFL";
} {
  let newState: GameState;

  try {
    newState = processEvent({ state, action });
  } catch {
    // Not our responsibility to catch events, pass on to the next handler
    // /捕获事件不是我们的责任，传递给下一个处理程序
    return { valid: true };
  }
  console.log("state  ", state);
  console.log("action,", action, " onChain ", onChain);

  console.log("checkProgress  newState", newState, onChain.balance);

  const progress = newState.balance.sub(onChain.balance);

  /** 合同强制 SFL 上限 以防万一玩家陷入腐败状态并设法赚取额外的 SFL
   * Contract enforced SFL caps
   * Just in case a player gets in a corrupt state and manages to earn extra SFL
   */
  if (progress.gt(MAX_SESSION_SFL)) {
    return { valid: false, maxedItem: "SFL" };
  }

  let maxedItem: InventoryItemName | undefined = undefined;

  // Check inventory amounts
  const validProgress = getKeys(newState.inventory).every((name) => {
    const onChainAmount = onChain.inventory[name] || new Decimal(0);

    const diff =
      newState.inventory[name]?.minus(onChainAmount) || new Decimal(0);

    const max = maxItems[name] || new Decimal(0);

    if (max.eq(0)) return true;

    if (diff.gt(max)) {
      maxedItem = name;

      return false;
    }

    return true;
  });
  console.log("valid: validProgress, maxedItem", validProgress, maxedItem);
  return { valid: validProgress, maxedItem };
}

type ProcessEventArgs = {
  state: GameState;
  action: GameEvent;
};

export function processEvent({ state, action }: ProcessEventArgs): GameState {
  console.log("processEvent", state, action);
  const handler = EVENTS[action.type];

  if (!handler) {
    throw new Error(`Unknown event type: ${action}`);
  }

  const newState = handler({
    state,
    // TODO - fix type error
    action: action as never,
  });

  return newState;
}
