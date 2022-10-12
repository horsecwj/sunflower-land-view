import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { GetGameState, SaveGameState } from "features/game/actions/loadSession";
import {
  diffGameInventory,
  diffRes,
  makeGame,
} from "features/game/lib/transforms";
import { GameState } from "features/game/types/game";
import { EMPTY } from "../lib/constants";

import Web3 from "web3";
import {
  encodeSyncFunction,
  SyncArgs,
  syncSessionArgs,
} from "lib/utils/signature";
const API_URL = CONFIG.API_URL;

type Options = {
  farmId: number;
  sessionId: string;
  token: string;
  captcha?: string;
  gameState: GameState;
};

export async function sync({
  farmId,
  sessionId,
  token,
  captcha,
  gameState,
}: Options) {
  const response = await window.fetch(`${API_URL}/sync/${farmId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sessionId: sessionId,
      captcha,
    }),
  });
  console.log("i am in sync farmId", farmId);
  console.log("i am in sync sessionId", sessionId);
  console.log("i am in sync token", token);
  console.log("i am in sync captcha", captcha);
  const { farmJson: resJson, flag: flag } = await GetGameState(
    farmId,
    token,
    true
  );
  console.log("farmJson -", resJson, "\n", "flag-", flag);
  const resjj = JSON.parse(resJson);
  const serverState = makeGame(resjj);
  console.log("GetGameState ", serverState);
  let dirrRess: diffRes;
  if (flag) {
    dirrRess = diffGameInventory(serverState, EMPTY);
  } else {
    dirrRess = diffGameInventory(gameState, serverState);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }
  const {
    addIndex,
    addNum,
    decrease,
    decreaseNum,
    addNumNumber,
    decreaseNumNumber,
    tokensString,
  } = dirrRess;

  // addIndex = [601, 301];
  // addNum = ["2", "3"];
  //
  // decrease = [301];
  // decreaseNum = ["3"];
  // addNumNumber = [2, 3];
  // decreaseNumNumber = [3];
  // const tokens = "10";
  // const tokensNumber = Number("10");

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }
  const myWeb3 = await metamask.getWeb3();
  const myAddress = await metamask.getAccount();
  const validDeadline = 10000000000000;

  const args: SyncArgs = {
    sessionId,
    deadline: validDeadline,
    sender: myAddress,
    farmId,
    mintIds: addIndex,
    mintAmounts: addNumNumber,
    burnIds: decrease,
    burnAmounts: decreaseNumNumber,
    tokens: tokensString,
  };

  const signature = await sign(myWeb3, args);
  const args2: syncSessionArgs = {
    signature,
    sessionId,
    deadline: validDeadline,
    farmId,
    mintIds: addIndex,
    mintAmounts: addNumNumber,
    burnIds: decrease,
    burnAmounts: decreaseNumNumber,
    tokens: Number(tokensString),
  };
  console.log("args", args);
  console.log("signature2", signature);
  console.log("args2", args2);

  // const transaction = await response.json();
  const newSessionId = await metamask.getSessionManager().sync(args2);
  await SaveGameState(farmId, "", gameState, false, token, true);
  return { verified: true, sessionId: "newSessionId" };
}

async function sign(web3: Web3, args: SyncArgs) {
  return "0xb365d77779d70f6b986c208be3a7830b75e73b38416c9d249cf0634ab8180307";
  const sha = encodeSyncFunction({
    ...args,
  });
  console.log("sync sing sha ", sha);
  const myAddress = await metamask.getAccount();

  return await web3.eth.personal.sign(sha, myAddress, "");
}

export async function syncProgress({
  farmId,
  sessionId,
  token,
  captcha,
}: Options) {
  const response = await window.fetch(`${API_URL}/sync-progress/${farmId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sessionId: sessionId,
      captcha,
    }),
  });

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }

  const transaction = await response.json();

  // TODO
  const newSessionId = await metamask
    .getSessionManager()
    .syncProgress(transaction);

  return { verified: true, sessionId: newSessionId };
}
