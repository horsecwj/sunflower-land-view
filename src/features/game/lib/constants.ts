import Decimal from "decimal.js-light";
import { fromWei } from "web3-utils";
import {
  Bumpkin,
  ChickenPosition,
  GameState,
  Inventory,
  LandExpansion,
} from "../types/game";
import { TerrainTypeEnum } from "./getTerrainImageByKey";
import { BumpkinLevel } from "./level";

// Our "zoom" factor
export const PIXEL_SCALE = 2.625;

// How many pixels a raw green square is
export const SQUARE_WIDTH = 16;

export const GRID_WIDTH_PX = PIXEL_SCALE * SQUARE_WIDTH;

export const CHICKEN_TIME_TO_EGG = 1000 * 60 * 60 * 24 * 2; // 48 hours
export const MUTANT_CHICKEN_BOOST_AMOUNT = 0.1;

export const POPOVER_TIME_MS = 1000;

export const CHICKEN_POSITIONS: ChickenPosition[] = [
  { top: GRID_WIDTH_PX * 1.2, right: GRID_WIDTH_PX * 1.9 },
  { top: GRID_WIDTH_PX * 1.4, right: GRID_WIDTH_PX * 3.3 },
  { top: GRID_WIDTH_PX * 1.7, right: GRID_WIDTH_PX * 0.88 },
  { top: GRID_WIDTH_PX * 2.47, right: GRID_WIDTH_PX * 3 },
  { top: GRID_WIDTH_PX * 2.66, right: GRID_WIDTH_PX * 1.9 },
  { top: GRID_WIDTH_PX * 1.6, right: GRID_WIDTH_PX * 4.6 },
  { top: GRID_WIDTH_PX * 1.72, right: GRID_WIDTH_PX * 5.7 },
  { top: GRID_WIDTH_PX * 1.28, right: GRID_WIDTH_PX * 6.7 },
  { top: GRID_WIDTH_PX * 1.8, right: GRID_WIDTH_PX * 7.7 },
  { top: GRID_WIDTH_PX * 1.44, right: GRID_WIDTH_PX * 8.7 },
  { top: GRID_WIDTH_PX * 1.95, right: GRID_WIDTH_PX * 9.8 },
  { top: GRID_WIDTH_PX * 1.17, right: GRID_WIDTH_PX * 10.6 },
  { top: GRID_WIDTH_PX * 1.78, right: GRID_WIDTH_PX * 11.5 },
  { top: GRID_WIDTH_PX * 1.85, right: GRID_WIDTH_PX * 12.8 },
  { top: GRID_WIDTH_PX * 1.59, right: GRID_WIDTH_PX * 14.12 },
];

export const INITIAL_STOCK: Inventory = {
  "Sunflower Seed": new Decimal(400),
  "Potato Seed": new Decimal(200),
  "Pumpkin Seed": new Decimal(100),
  "Carrot Seed": new Decimal(100),
  "Cabbage Seed": new Decimal(90),
  "Beetroot Seed": new Decimal(80),
  "Cauliflower Seed": new Decimal(80),
  "Parsnip Seed": new Decimal(60),
  "Radish Seed": new Decimal(40),
  "Wheat Seed": new Decimal(40),

  Axe: new Decimal(50),
  Pickaxe: new Decimal(30),
  "Stone Pickaxe": new Decimal(10),
  "Iron Pickaxe": new Decimal(5),

  // One off items
  "Pumpkin Soup": new Decimal(1),
  Sauerkraut: new Decimal(1),
  "Roasted Cauliflower": new Decimal(1),
  Chicken: new Decimal(6),
  "Sunflower Cake": new Decimal(1),
  "Potato Cake": new Decimal(1),
  "Pumpkin Cake": new Decimal(1),
  "Carrot Cake": new Decimal(1),
  "Cabbage Cake": new Decimal(1),
  "Beetroot Cake": new Decimal(1),
  "Cauliflower Cake": new Decimal(1),
  "Parsnip Cake": new Decimal(1),
  "Radish Cake": new Decimal(1),
  "Wheat Cake": new Decimal(1),

  "Boiled Egg": new Decimal(1),
};

export const INITIAL_FIELDS: GameState["fields"] = {
  0: {
    name: "Sunflower",
    plantedAt: 0,
    reward: {
      items: [
        {
          amount: 2,
          name: "Sunflower Seed",
        },
      ],
    },
  },
  1: {
    name: "Sunflower",
    plantedAt: 0,
  },
  2: {
    name: "Sunflower",
    plantedAt: 0,
  },
  5: {
    name: "Carrot",
    plantedAt: 0,
  },
  6: {
    name: "Cabbage",
    plantedAt: 0,
  },
  10: {
    name: "Cauliflower",
    plantedAt: 0,
  },
  11: {
    name: "Beetroot",
    plantedAt: 0,
  },
  16: {
    name: "Parsnip",
    plantedAt: 0,
  },
  17: {
    name: "Radish",
    plantedAt: 0,
  },
};

export const INITIAL_TREES: GameState["trees"] = {
  0: {
    wood: new Decimal(3),
    choppedAt: 0,
    x: 1,
    y: 3,
    height: 2,
    width: 2,
  },
  1: {
    wood: new Decimal(4),
    choppedAt: 0,
    // Not used in land expansion testing...yet
    x: 100,
    y: 3,
    height: 2,
    width: 2,
  },
  2: {
    wood: new Decimal(5),
    choppedAt: 0,
    // Not used in land expansion testing...yet
    x: 100,
    y: 3,
    height: 2,
    width: 2,
  },
  3: {
    wood: new Decimal(5),
    choppedAt: 0,
    // Not used in land expansion testing...yet
    x: 100,
    y: 3,
    height: 2,
    width: 2,
  },
  4: {
    wood: new Decimal(3),
    choppedAt: 0,
    // Not used in land expansion testing...yet
    x: 100,
    y: 3,
    height: 2,
    width: 2,
  },
};

export const INITIAL_GOLD_MINES: LandExpansion["gold"] = {
  0: {
    stone: {
      amount: 0.1,
      minedAt: 0,
    },
    x: -4,
    y: 2,
    height: 1,
    width: 1,
  },
};

export const INITIAL_EXPANSION_IRON: LandExpansion["iron"] = {
  0: {
    stone: {
      amount: 0.1,
      minedAt: 0,
    },
    x: 2,
    y: -1,
    height: 1,
    width: 1,
  },
};

export const INITIAL_STONE: GameState["stones"] = {
  0: {
    amount: new Decimal(2),
    minedAt: 0,
  },
  1: {
    amount: new Decimal(3),
    minedAt: 0,
  },
  2: {
    amount: new Decimal(4),
    minedAt: 0,
  },
};

export const INITIAL_IRON: GameState["iron"] = {
  0: {
    amount: new Decimal(2),
    minedAt: 0,
  },
  1: {
    amount: new Decimal(3),
    minedAt: 0,
  },
};

export const INITIAL_GOLD: GameState["gold"] = {
  0: {
    amount: new Decimal(2),
    minedAt: 0,
  },
};

export const INITIAL_TERRAIN: GameState["terrains"] = {
  0: {
    name: TerrainTypeEnum.terrain11,
    height: 54,
    width: 52,
    x: -2,
    y: 1,
  },
};

export const INITIAL_PLOTS: GameState["plots"] = {
  0: {
    crop: { name: "Sunflower", plantedAt: 0 },
    x: -1,
    y: 1,
    height: 1,
    width: 1,
  },
  1: {
    crop: { name: "Sunflower", plantedAt: 0 },
    x: 0,
    y: 0,
    height: 1,
    width: 1,
  },
  2: {
    crop: { name: "Sunflower", plantedAt: 0 },
    x: -1,
    y: 0,
    height: 1,
    width: 1,
  },
  3: {
    x: -1,
    y: -1,
    height: 1,
    width: 1,
  },
  4: {
    x: -2,
    y: 0,
    height: 1,
    width: 1,
  },
};

export const GENESIS_LAND_EXPANSION: LandExpansion = {
  createdAt: 0,
  readyAt: 0,

  // gold: INITIAL_GOLD_MINES,
  terrains: INITIAL_TERRAIN,
  iron: INITIAL_EXPANSION_IRON,

  plots: INITIAL_PLOTS,
};

export const INITIAL_EXPANSIONS: LandExpansion[] = [
  {
    createdAt: 0,
    readyAt: 0,

    terrains: INITIAL_TERRAIN,
    plots: INITIAL_PLOTS,

    iron: {
      0: {
        stone: {
          amount: 2,
          minedAt: 0,
        },
        x: 1,
        y: 2,
        height: 1,
        width: 1,
      },
    },
    stones: {
      0: {
        stone: {
          amount: 2,
          minedAt: 0,
        },
        x: 3,
        y: 2,
        height: 1,
        width: 1,
      },
    },
    trees: {
      0: {
        wood: {
          amount: 3,
          choppedAt: 0,
        },
        x: -3,
        y: 3,
        height: 2,
        width: 2,
      },
    },
  },
  {
    createdAt: 0,
    readyAt: 0,

    gold: INITIAL_GOLD_MINES,
    terrains: {
      0: {
        name: TerrainTypeEnum.terrain5,
        height: 54 / 3,
        width: 52,
        x: -2,
        y: -1,
      },
    },

    plots: {
      0: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: -2,
        y: -1,
        height: 1,
        width: 1,
      },
      1: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: -1,
        y: -1,
        height: 1,
        width: 1,
      },
      2: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: 0,
        y: -1,
        height: 1,
        width: 1,
      },
    } as GameState["plots"],

    trees: {
      0: {
        wood: {
          amount: 3,
          choppedAt: 0,
        },
        x: 1,
        y: 1,
        height: 2,
        width: 2,
      },
    },
  },
  {
    createdAt: 0,
    readyAt: 0,

    // gold: INITIAL_GOLD_MINES,
    terrains: {
      0: {
        name: TerrainTypeEnum.terrain5,
        height: 54 / 3,
        width: 52,
        x: -2,
        y: -1,
      },
    },

    plots: {
      0: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: -2,
        y: -1,
        height: 1,
        width: 1,
      },
      1: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: -1,
        y: -1,
        height: 1,
        width: 1,
      },
      2: {
        crop: { name: "Sunflower", plantedAt: 0 },
        x: 0,
        y: -1,
        height: 1,
        width: 1,
      },
    } as GameState["plots"],

    trees: {
      0: {
        wood: {
          amount: 3,
          choppedAt: 0,
        },
        x: 1,
        y: 1,
        height: 2,
        width: 2,
      },
    },

    fruitPatches: {
      0: {
        height: 2,
        width: 2,
        x: -2,
        y: 3,
        fruit: {
          amount: 1,
          name: "Apple",
          plantedAt: 0,
        },
      },
    },

    mines: {
      0: {
        height: 2,
        width: 2,
        x: 0,
        y: 3,
      },
    },
  },
];

export const INITIAL_BUMPKIN: Bumpkin = {
  id: 1,
  experience: 0,
  tokenUri: "bla",
  equipped: {
    body: "Light Brown Farmer Potion",
    hair: "Basic Hair",
    shirt: "Red Farmer Shirt",
    pants: "Farmer Pants",
    shoes: "Black Farmer Boots",
    tool: "Farmer Pitchfork",
    background: "Farm Background",
  },
  skills: {},
  stamina: {
    value: 10,
    replenishedAt: 0,
  },
  achievements: {
    "Busy Bumpkin": 1,
  },
  activity: {},
};

export const INITIAL_FARM: GameState = {
  balance: new Decimal(0),
  fields: INITIAL_FIELDS,
  inventory: {
    "Fat Chicken": new Decimal(1),
    Chicken: new Decimal(6),
    "Chicken Coop": new Decimal(1),
    Wood: new Decimal(50),
    Gold: new Decimal(10),
    Stone: new Decimal(10),
    Sunflower: new Decimal(5),
    Potato: new Decimal(12),
    Carrot: new Decimal("502"),
    "Roasted Cauliflower": new Decimal(1),
    "Carrot Cake": new Decimal(1),
    Radish: new Decimal(100),
    Wheat: new Decimal(100),
    Egg: new Decimal(15),
    "Rusty Shovel": new Decimal(1),
    Axe: new Decimal(3),
    Observatory: new Decimal(1),
    Pickaxe: new Decimal(3),
    "Stone Pickaxe": new Decimal(3),
    "Iron Pickaxe": new Decimal(5),
    "Trading Ticket": new Decimal(50),
    "Chef Hat": new Decimal(1),
    "Human War Banner": new Decimal(1),
    Warrior: new Decimal(1),
    "Boiled Egg": new Decimal(3),
    "Mashed Potato": new Decimal(1),
    "Sunflower Cake": new Decimal(1),
    "Pumpkin Soup": new Decimal(1),
  },
  stock: INITIAL_STOCK,
  trees: INITIAL_TREES,
  stones: INITIAL_STONE,
  iron: INITIAL_IRON,
  gold: INITIAL_GOLD,
  chickens: {},
  skills: {
    farming: new Decimal(0),
    gathering: new Decimal(0),
  },
  stockExpiry: {
    "Sunflower Cake": "1970-06-06",
    "Potato Cake": "1970-01-01T00:00:00.000Z",
    "Pumpkin Cake": "1970-01-01T00:00:00.000Z",
    "Carrot Cake": "2022-08-30T00:00:00.000Z",
    "Cabbage Cake": "1970-01-01T00:00:00.000Z",
    "Beetroot Cake": "1970-01-01T00:00:00.000Z",
    "Cauliflower Cake": "1970-01-01T00:00:00.000Z",
    "Parsnip Cake": "1970-01-01T00:00:00.000Z",
    "Radish Cake": "2025-01-01T00:00:00.000Z",
    "Wheat Cake": "1970-01-01T00:00:00.000Z",
  },
  terrains: INITIAL_TERRAIN,
  plots: INITIAL_PLOTS,

  expansions: INITIAL_EXPANSIONS,
  buildings: {
    Market: [
      {
        coordinates: {
          x: 4,
          y: 4,
        },
        createdAt: 0,
        id: "123",
        readyAt: 0,
      },
    ],
  },
  airdrops: [
    {
      createdAt: Date.now(),
      id: "123",
      items: {
        "Rapid Growth": 5,
      },
      sfl: 3,
      message: "You are a legend!",
    },
  ],
  collectibles: {},
  warCollectionOffer: {
    warBonds: 10,
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 10000).toISOString(),
    ingredients: [
      {
        amount: 50,
        name: "Wood",
      },
    ],
  },
  bumpkin: INITIAL_BUMPKIN,

  grubShop: {
    opensAt: new Date("2022-10-05").getTime(),
    closesAt: new Date("2022-10-08").getTime(),
    orders: [
      {
        id: "asdj123",
        name: "Boiled Egg",
        sfl: new Decimal(10),
      },
      {
        id: "asdasd",
        name: "Beetroot Cake",
        sfl: new Decimal(20),
      },
      {
        id: "3",
        name: "Sunflower Cake",
        sfl: new Decimal(20),
      },
      {
        id: "4",
        name: "Bumpkin Broth",
        sfl: new Decimal(20),
      },
      {
        id: "5",
        name: "Mashed Potato",
        sfl: new Decimal(20),
      },
      {
        id: "6",
        name: "Wheat Cake",
        sfl: new Decimal(20),
      },
      {
        id: "7",
        name: "Pumpkin Soup",
        sfl: new Decimal(20),
      },
      {
        id: "8",
        name: "Mashed Potato",
        sfl: new Decimal(20),
      },
    ],
  },
};

export const EMPTY: GameState = {
  balance: new Decimal(fromWei("0")),
  fields: {},
  inventory: {
    "Chicken Coop": new Decimal(1),
    Wood: new Decimal(50),
    Gold: new Decimal(10),
    Stone: new Decimal(10),
  },
  chickens: {},
  stock: {},
  trees: INITIAL_TREES,
  stones: INITIAL_STONE,
  iron: INITIAL_IRON,
  gold: INITIAL_GOLD,
  skills: {
    farming: new Decimal(0),
    gathering: new Decimal(0),
  },
  stockExpiry: {},
  terrains: INITIAL_TERRAIN,
  plots: INITIAL_PLOTS,
  expansions: INITIAL_EXPANSIONS,
  buildings: {},
  collectibles: {},
};

export const MAX_STAMINA: Record<BumpkinLevel, number> = {
  1: 10,
  2: 50,
  3: 100,
  4: 200,
  5: 300,
};

export const CHOP_STAMINA_COST = 2;
export const STONE_MINE_STAMINA_COST = 2;
export const IRON_MINE_STAMINA_COST = 2;
export const PLANT_STAMINA_COST = 1;
export const GOLD_MINE_STAMINA_COST = 2;
