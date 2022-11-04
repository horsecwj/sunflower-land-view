import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";

const API_URL = CONFIG.API_URL;

type Options = {
  farmId: number;
  sessionId: string;
  sfl: number;
  ids: number[];
  amounts: string[];
  token: string;
  captcha: string;
};
export async function withdraw({
  farmId,
  sessionId,
  sfl,
  ids,
  amounts,
  token,
  captcha,
}: Options) {
  const response = await window.fetch(`${API_URL}/withdraw/${farmId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      sessionId: sessionId,
      sfl: sfl,
      ids: ids,
      amounts: amounts,
      captcha,
    }),
  });

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }
  //"0xb365d77779d70f6b986c208be3a7830b75e73b38416c9d249cf0634ab8180307"
  const argsWtihdraw: WithdrawType = {
    signature:
      "0xb365d77779d70f6b986c208be3a7830b75e73b38416c9d249cf0634ab8180307",
    sessionId,

    deadline: 10000000000000,
    farmId: farmId,
    ids: ids,
    amounts: amounts,
    sfl: 0,
    tax: 30,
  };
  console.log("argsWtihdraw", argsWtihdraw);

  const transaction = await response.json();
  const newSessionId = await metamask
    .getSessionManager()
    .withdraw(argsWtihdraw);
  return { sessionId: newSessionId, verified: true };
}

export type WithdrawType = {
  signature: string;
  sessionId: string;
  deadline: number;
  // Data
  farmId: number;
  ids: number[];
  amounts: string[];
  sfl: number;
  tax: number;
};
