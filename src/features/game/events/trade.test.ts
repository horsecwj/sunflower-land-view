import Decimal from "decimal.js-light";
import { INITIAL_FARM } from "../lib/constants";
import { GameState, TradeOffer } from "../types/game";
import { trade } from "./trade";

const GAME_STATE: GameState = {
  ...INITIAL_FARM,
  fields: {},
  balance: new Decimal(0),
  inventory: {},
};

const CHICKEN_OFFER: TradeOffer = {
  name: "Chicken",
  amount: 1,
  startAt: "2022-06-08T00:00:00.000Z",
  endAt: "2022-06-20T00:00:00.000Z",
  ingredients: [
    {
      name: "Beetroot",
      amount: new Decimal(50),
    },
    {
      name: "Carrot",
      amount: new Decimal(100),
    },
  ],
};

describe("trade", () => {
  //如果没有报价，则不交易物品
  it("does not trade an item if nothing is on offer", () => {
    expect(() =>
      trade({
        action: {
          type: "item.traded",
        },
        state: {
          ...GAME_STATE,
          tradeOffer: undefined,
        },
      })
    ).toThrow("Nothing to trade");
  });
  //如果缺少多种成分，则不交易
  it("does not trade if missing multiple ingredients", () => {
    expect(() =>
      trade({
        action: {
          type: "item.traded",
        },
        state: {
          ...GAME_STATE,
          tradeOffer: CHICKEN_OFFER,
        },
      })
    ).toThrow("Insufficient ingredient: Beetroot");
  });
  //如果缺少成分，则不交易
  it("does not trade if missing  ingredient", () => {
    expect(() =>
      trade({
        action: {
          type: "item.traded",
        },
        state: {
          ...GAME_STATE,
          inventory: {
            Beetroot: new Decimal(50),
          },
          tradeOffer: CHICKEN_OFFER,
        },
      })
    ).toThrow("Insufficient ingredient: Carrot");
  });
  //只交易一次报价
  it("only trades an offer once", () => {
    expect(() =>
      trade({
        action: {
          type: "item.traded",
        },
        state: {
          ...GAME_STATE,
          inventory: {
            Beetroot: new Decimal(50),
            Carrot: new Decimal(200),
          },
          tradedAt: "2022-06-14T00:00:00.000Z",
          tradeOffer: CHICKEN_OFFER,
        },
      })
    ).toThrow("Already traded");
  });
  //交易不同的物品
  it("trades different items", () => {
    const state = trade({
      action: {
        type: "item.traded",
      },
      state: {
        ...GAME_STATE,
        inventory: {
          Beetroot: new Decimal(50),
          Carrot: new Decimal(200),
        },
        // Made a trade long ago in the past
        tradedAt: new Date(Date.now() - 100000).toISOString(),
        tradeOffer: {
          name: "Chicken",
          amount: 1,
          ingredients: [
            {
              name: "Beetroot",
              amount: new Decimal(50),
            },
            {
              name: "Carrot",
              amount: new Decimal(100),
            },
          ],
          // Some older times
          startAt: new Date(Date.now() - 1000).toISOString(),
          endAt: new Date(Date.now() + 1000).toISOString(),
        },
      },
    });

    expect(state.inventory.Chicken).toEqual(new Decimal(1));
  });

  it("trades an item", () => {
    const state = trade({
      action: {
        type: "item.traded",
      },
      state: {
        ...GAME_STATE,
        inventory: {
          Beetroot: new Decimal(50),
          Carrot: new Decimal(200),
        },
        tradeOffer: CHICKEN_OFFER,
      },
    });

    expect(state.inventory.Chicken).toEqual(new Decimal(1));
    expect(state.inventory.Beetroot).toEqual(new Decimal(0));
    expect(state.inventory.Carrot).toEqual(new Decimal(100));
    expect(state.tradedAt).toEqual(expect.any(String));
  });

  it("prevents multiple trades of an item", () => {
    const state = trade({
      action: {
        type: "item.traded",
      },
      state: {
        ...GAME_STATE,
        inventory: {
          Beetroot: new Decimal(500),
          Carrot: new Decimal(2000),
        },
        tradeOffer: {
          name: "Chicken",
          amount: 1,
          ingredients: [
            {
              name: "Beetroot",
              amount: new Decimal(50),
            },
            {
              name: "Carrot",
              amount: new Decimal(100),
            },
          ],
          // Some older times
          startAt: new Date(Date.now() - 1000).toISOString(),
          endAt: new Date(Date.now() + 1000).toISOString(),
        },
      },
    });

    expect(() =>
      trade({
        action: {
          type: "item.traded",
        },
        state,
      })
    ).toThrow("Already traded");
  });

  it("trades for mulitple items", () => {
    const state = trade({
      action: {
        type: "item.traded",
      },
      state: {
        ...GAME_STATE,
        inventory: {
          Sunflower: new Decimal(50),
        },
        tradeOffer: {
          name: "Potato",
          amount: 5,
          startAt: "2022-06-08T00:00:00.000Z",
          endAt: "2022-06-20T00:00:00.000Z",
          ingredients: [
            {
              name: "Sunflower",
              amount: new Decimal(5),
            },
          ],
        },
      },
    });

    expect(state.inventory.Potato).toEqual(new Decimal(5));
    expect(state.inventory.Sunflower).toEqual(new Decimal(45));
    expect(state.tradedAt).toEqual(expect.any(String));
  });
});
