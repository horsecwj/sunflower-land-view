import { metamask } from "lib/blockchain/metamask";
import { fromWei } from "web3-utils";
import Decimal from "decimal.js-light";

import { balancesToInventory, populateFields } from "lib/utils/visitUtils";

import { GameState, Inventory } from "../types/game";
import { LIMITED_ITEM_NAMES } from "../types/craftables";
import { EMPTY } from "../lib/constants";
import { CONFIG } from "lib/config";
import { KNOWN_IDS } from "../types";
import { Recipe } from "lib/blockchain/Sessions";
import { OnChainBumpkin } from "lib/blockchain/BumpkinDetails";

const API_URL = CONFIG.API_URL;

async function loadMetadata(id: number) {
  // Go and fetch the metadata file for this farm
  const url = `${API_URL}/nfts/farm/${id}`;
  const response = await window.fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  });

  const data = await response.json();

  return data;
}
type GetStateArgs = {
  farmAddress: string;
  id: number;
};

export async function isFarmBlacklisted(id: number) {
  const metadata = await loadMetadata(id);

  return metadata.image.includes("blacklisted");
}
//let result = (param1, param2) => param1+param2;

//function add(param1, param2){
//   return param1+param2;
// }

//let result = v => 5+v; name 是map 循环每一项时的 list 中的值，就是 LIMITED_ITEM_NAMES 中的 item ，箭头函数简写为（）=> konwIds[name]
const RECIPES_IDS = LIMITED_ITEM_NAMES.map((name) => KNOWN_IDS[name]);

export type LimitedItemRecipeWithMintedAt = Recipe & {
  mintedAt: number;
};

export async function getOnChainState({
  farmAddress,
  id,
}: GetStateArgs): Promise<{
  game: GameState;
  owner: string;
  limitedItems: LimitedItemRecipeWithMintedAt[];
  bumpkin?: OnChainBumpkin;
}> {
  if (!CONFIG.API_URL) {
    return { game: EMPTY, owner: "", limitedItems: [] };
  }

  const balanceFn = metamask.getToken().balanceOf(farmAddress);
  const balancesFn = metamask.getInventory().getBalances(farmAddress);
  const farmFn = metamask.getFarm().getFarm(id);
  const bumpkinFn = metamask.getBumpkinDetails().loadBumpkins();
  console.log(
    "farmAddress,balanceFn,balancesFn,farmFn,bumpkinFn",
    farmAddress,
    balanceFn,
    balancesFn,
    farmFn,
    bumpkinFn
  );
  //从会话合约中获取数据的短期解决方法
  // Short term workaround to get data from session contract//食谱
  console.log("RECIPES_IDS", RECIPES_IDS);
  const recipesFn = metamask.getSessionManager().getRecipes(RECIPES_IDS);

  const mintedAtsFn = metamask
    .getSessionManager()
    .getMintedAtBatch(id, RECIPES_IDS);

  // Promise all
  const [balance, balances, farm, recipes, mintedAts, bumpkins] =
    await Promise.all([
      balanceFn,
      balancesFn,
      farmFn,
      recipesFn,
      mintedAtsFn,
      bumpkinFn,
    ]);
  //LIMITED_ITEM_NAMES KNOWN_IDS
  console.log("KNOWN_IDS ", KNOWN_IDS);

  console.log("LIMITED_ITEM_NAMES ", LIMITED_ITEM_NAMES);
  console.log("balance ", balance);
  console.log(" balances -", balances);
  console.log(" farm, -", farm);
  console.log(" recipes ", recipes);
  console.log("  mintedAts,  -", mintedAts);
  console.log(" bumpkins-", bumpkins);
  const limitedItems = recipes.map((recipe, index) => ({
    ...recipe,
    mintedAt: mintedAts[index],
  }));

  const inventory = balancesToInventory(balances);
  const fields = populateFields(inventory);

  console.log({ bumpkins });
  return {
    game: {
      ...EMPTY,
      balance: new Decimal(fromWei(balance)),
      farmAddress,
      fields,
      inventory,
    },
    owner: farm.owner,
    limitedItems,
    bumpkin: bumpkins[0],
  };
}

export async function getTreasuryItems() {
  if (!API_URL) return {} as Inventory;

  const treasuryItems = await metamask
    .getInventory()
    .getBalances(CONFIG.TREASURY_ADDRESS);

  return balancesToInventory(treasuryItems);
}
