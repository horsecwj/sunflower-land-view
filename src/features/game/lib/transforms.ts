import Decimal from "decimal.js-light";
import {
  FieldItem,
  GameState,
  Inventory,
  InventoryItemName,
  Rock,
  Tree,
} from "../types/game";
import { IDS, KNOWN_IDS } from "features/game/types";
import { tokenMulNum } from "src/lib/config";
import { toWei } from "web3-utils";
import { getItemUnit } from "features/game/lib/conversion";

// eslint-disable-next-line @typescript-eslint/no-var-requires

/**
 * Converts API response into a game state
 */

export function saveGame(farm: any) {
  return {
    inventory: Object.keys(farm.inventory).reduce(
      (items, item) => ({
        ...items,
        [item]: new Decimal(farm.inventory[item]).toString(),
      }),
      {} as Record<InventoryItemName, string>
    ),
    stock: Object.keys(farm.stock).reduce(
      (items, item) => ({
        ...items,
        [item]: new Decimal(farm.stock[item]).toString(),
      }),
      {} as Record<InventoryItemName, string>
    ),
    trees: Object.keys(farm.trees).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.trees[item],
          wood: new Decimal(farm.trees[item].wood).toString(),
        },
      }),
      {}
    ),
    stones: Object.keys(farm.stones).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.stones[item],
          amount: new Decimal(farm.stones[item].amount).toString(),
        },
      }),
      {}
    ),
    iron: Object.keys(farm.iron).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.iron[item],
          amount: new Decimal(farm.iron[item].amount).toString(),
        },
      }),
      {}
    ),
    gold: Object.keys(farm.gold).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.gold[item],
          amount: new Decimal(farm.gold[item].amount).toString(),
        },
      }),
      {}
    ),
    chickens: farm.chickens || {},
    stockExpiry: farm.stockExpiry || {},
    skills: {
      farming: new Decimal(farm.skills.farming).toString(),
      gathering: new Decimal(farm.skills.gathering).toString(),
    },
    balance: new Decimal(farm.balance).toString(),
    fields: farm.fields,
    id: farm.id,
    tradeOffer: farm.tradeOffer
      ? {
          ...farm.tradeOffer,
          ingredients: farm.tradeOffer.ingredients.map((ingredient: any) => ({
            ...ingredient,
            amount: new Decimal(ingredient.amount).toString(),
          })),
        }
      : undefined,
    tradedAt: farm.tradedAt,
    shrubs: farm.shrubs,
    pebbles: farm.pebbles,
    terrains: farm.terrains,
    plots: farm.plots,
    expansions: farm.expansions,
    expansionRequirements: farm.expansionRequirements
      ? {
          resources: farm.expansionRequirements.resources.map(
            (resource: any) => ({
              item: resource.item,
              amount: new Decimal(resource.amount).toString(),
            })
          ),
          sfl: new Decimal(farm.expansionRequirements.sfl),
          seconds: new Decimal(farm.expansionRequirements.seconds),
        }
      : undefined,
    bumpkin: farm.bumpkin,
    buildings: farm.buildings,
    airdrops: farm.airdrops,
    collectibles: farm.collectibles,
    warCollectionOffer: farm.warCollectionOffer,
  };
}

export function makeGame(farm: any): GameState {
  return {
    inventory: Object.keys(farm.inventory).reduce(
      (items, item) => ({
        ...items,
        [item]: new Decimal(farm.inventory[item]),
      }),
      {} as Record<InventoryItemName, Decimal>
    ),
    stock: Object.keys(farm.stock).reduce(
      (items, item) => ({
        ...items,
        [item]: new Decimal(farm.stock[item]),
      }),
      {} as Record<InventoryItemName, Decimal>
    ),
    trees: Object.keys(farm.trees).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.trees[item],
          wood: new Decimal(farm.trees[item].wood),
        },
      }),
      {} as Record<number, Tree>
    ),
    stones: Object.keys(farm.stones).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.stones[item],
          amount: new Decimal(farm.stones[item].amount),
        },
      }),
      {} as Record<number, Rock>
    ),
    iron: Object.keys(farm.iron).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.iron[item],
          amount: new Decimal(farm.iron[item].amount),
        },
      }),
      {} as Record<number, Rock>
    ),
    gold: Object.keys(farm.gold).reduce(
      (items, item) => ({
        ...items,
        [item]: {
          ...farm.gold[item],
          amount: new Decimal(farm.gold[item].amount),
        },
      }),
      {} as Record<number, Rock>
    ),
    chickens: farm.chickens || {},
    stockExpiry: farm.stockExpiry || {},
    skills: {
      farming: new Decimal(farm.skills.farming),
      gathering: new Decimal(farm.skills.gathering),
    },
    balance: new Decimal(farm.balance),
    fields: farm.fields,
    id: farm.id,
    tradeOffer: farm.tradeOffer
      ? {
          ...farm.tradeOffer,
          ingredients: farm.tradeOffer.ingredients.map((ingredient: any) => ({
            ...ingredient,
            amount: new Decimal(ingredient.amount),
          })),
        }
      : undefined,
    grubOrdersFulfilled: farm.grubOrdersFulfilled,
    grubShop: farm.grubShop
      ? {
          ...farm.grubShop,
          orders: farm.grubShop.orders.map((order: any) => ({
            ...order,
            sfl: new Decimal(order.sfl),
          })),
        }
      : undefined,
    tradedAt: farm.tradedAt,
    terrains: farm.terrains,
    plots: farm.plots,
    expansions: farm.expansions,
    expansionRequirements: farm.expansionRequirements
      ? {
          resources: farm.expansionRequirements.resources.map(
            (resource: any) => ({
              item: resource.item,
              amount: new Decimal(resource.amount),
            })
          ),
          sfl: new Decimal(farm.expansionRequirements.sfl),
          seconds: new Decimal(farm.expansionRequirements.seconds),
        }
      : undefined,
    bumpkin: farm.bumpkin,
    buildings: farm.buildings,
    airdrops: farm.airdrops,
    collectibles: farm.collectibles,
    warCollectionOffer: farm.warCollectionOffer,
  };
}

type Rocks = Record<number, Rock>;

/**
 * Updates a rock with the new amount of mineral inside of it
 */
function updateRocks(oldRocks: Rocks, newRocks: Rocks): Rocks {
  return Object.keys(oldRocks).reduce((rocks, rockId) => {
    const id = Number(rockId);
    const rock = oldRocks[id];
    return {
      ...rocks,
      [id]: {
        ...rock,
        amount: newRocks[id].amount,
      } as Rock,
    };
  }, {} as Record<number, Rock>);
}

/**
 * Merge RNG from server
 */
export interface diffRes {
  addIndex: number[];
  addNum: string[];
  addNumNumber: number[];
  decrease: number[];
  decreaseNum: string[];
  decreaseNumNumber: number[];
  tokensString: string;
  addNumString: string[];
  decreaseString: string[];
}
export function diffGameInventory(
  newGameState: any,
  oldGameState: any
): diffRes {
  const addIndex: number[] = [];
  const addNum: string[] = [];
  const decrease: number[] = [];
  const decreaseNum: string[] = [];

  const addNumNumber: number[] = [];
  const decreaseNumNumber: number[] = [];
  const addNumString: string[] = [];
  const decreaseString: string[] = [];
  const finalInventory = Object.keys(newGameState.inventory).reduce(
    (items, item) => ({
      ...items,
      [item]: new Decimal(newGameState.inventory[item]).sub(
        new Decimal(oldGameState.inventory[item] | 0)
      ),
    }),
    {} as Record<InventoryItemName, Decimal>
  );
  const tokens = new Decimal(newGameState.balance)
    .sub(new Decimal(oldGameState.balance | 0))
    .mul(tokenMulNum)
    .toString();
  const tokensFinal = toWei(tokens, "ether");
  console.log("balance diff ", tokens);
  console.log(finalInventory);
  const keyList = Object.keys(finalInventory);
  console.log("keyList", keyList);

  //
  const keyList_KNOWN_IDS = Object.keys(KNOWN_IDS);
  const tempKownIds: number[] = [];
  const tempKownIdsNumb: string[] = [];

  for (const tmp in keyList_KNOWN_IDS) {
    const keyValue = keyList_KNOWN_IDS[tmp];
    tempKownIds.push(KNOWN_IDS[keyValue as InventoryItemName]);
    const tempNum = BigInt(100);
    tempKownIdsNumb.push(tempNum.toString());
  }
  console.log("transFormTs konwIds");
  console.log(JSON.stringify(tempKownIds));
  console.log(JSON.stringify(IDS));
  console.log("tempKownIds ---- \n", tempKownIds, "\n----------");
  for (const name in keyList) {
    const keyValue = keyList[name];
    const ids = KNOWN_IDS[keyValue as InventoryItemName];

    const resNum = finalInventory[keyValue as InventoryItemName].comparedTo(0);
    const unit = getItemUnit(keyValue as InventoryItemName);
    // console.log("name,ids,", keyValue, ids, unit);

    if (resNum == 1) {
      addIndex.push(ids);
      addNum.push(finalInventory[keyValue as InventoryItemName].toString());
      addNumNumber.push(
        Number(finalInventory[keyValue as InventoryItemName].toString())
      );
      addNumString.push(
        toWei(finalInventory[keyValue as InventoryItemName].toString(), unit)
      );
    }
    if (resNum == -1) {
      decrease.push(ids);
      decreaseNum.push(
        finalInventory[keyValue as InventoryItemName].abs().toString()
      );
      decreaseNumNumber.push(
        Number(finalInventory[keyValue as InventoryItemName].abs().toString())
      );
      decreaseString.push(
        toWei(
          finalInventory[keyValue as InventoryItemName].abs().toString(),
          unit
        )
      );
    }
  }

  return {
    addIndex,
    addNum,
    decrease,
    decreaseNum,
    addNumNumber,
    decreaseNumNumber,
    tokensString: tokens,
    addNumString,
    decreaseString,
  };
}
export function updateGame(
  newGameState: GameState,
  oldGameState: GameState
): GameState {
  if (!newGameState) {
    return oldGameState;
  }

  // TODO: How to handle expansions????
  //仅更新从服务器生成的随机数值
  // Only update random number values generated from the server
  try {
    return {
      ...oldGameState,
      // Update random reward
      fields: Object.keys(oldGameState.fields).reduce((fields, fieldId) => {
        const id = Number(fieldId);
        const field = oldGameState.fields[id];
        return {
          ...fields,
          [id]: {
            ...field,
            reward: newGameState.fields[id].reward,
          },
        };
      }, {} as Record<number, FieldItem>),
      // Update tree with the random amount of wood from the server
      trees: Object.keys(oldGameState.trees).reduce((trees, treeId) => {
        const id = Number(treeId);
        const tree = oldGameState.trees[id];
        return {
          ...trees,
          [id]: {
            ...tree,
            wood: newGameState.trees[id].wood,
          },
        };
      }, {} as Record<number, Tree>),
      stones: updateRocks(oldGameState.stones, newGameState.stones),
      iron: updateRocks(oldGameState.iron, newGameState.iron),
      gold: updateRocks(oldGameState.gold, newGameState.gold),
      skills: newGameState.skills,
      chickens: newGameState.chickens,
    };
  } catch (e) {
    console.log({ e });
    return oldGameState;
  }
}

/**
 * Returns the lowest values out of 2 game states
 */
export function getLowestGameState({
  first,
  second,
}: {
  first: GameState;
  second: GameState;
}) {
  const balance = first.balance.lt(second.balance)
    ? first.balance
    : second.balance;

  const items = [
    ...new Set([
      ...(Object.keys(first.inventory) as InventoryItemName[]),
      ...(Object.keys(second.inventory) as InventoryItemName[]),
    ]),
  ];
  console.log("getLowestGameState", getLowestGameState);
  const inventory: Inventory = items.reduce((inv, name) => {
    const firstAmount = first.inventory[name] || new Decimal(0);
    const secondAmount = second.inventory[name] || new Decimal(0);
    const amount1 = firstAmount.eq(0) ? secondAmount : firstAmount;
    const amount2 = firstAmount.lt(secondAmount) ? firstAmount : secondAmount;
    const amount = amount1.eq(0) ? amount2 : amount1;
    // console.log(
    //   "name",
    //   name,
    //   "amouont1",
    //   amount1,
    //   "amount2",
    //   amount2,
    //   "amount",
    //   amount
    // );
    if (amount.eq(0)) {
      return inv;
    }

    return {
      ...inv,
      [name]: amount,
    };
  }, {});

  return {
    balance,
    inventory,
  };
}
