import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { LimitedItemName } from "../types/craftables";

type Request = {
  farmId: number;
  sessionId: string;
  item: LimitedItemName;
  token: string;
  captcha: string;
  id: number;
};

const API_URL = CONFIG.API_URL;
export type mintArgs = {
  signature: string;
  sessionId: string;
  nextSessionId: string;
  deadline: number;
  // Data
  farmId: number;
  mintId: number;
  fee: string;
};
async function mintRequest(request: Request): Promise<{
  signature: string;
  sessionId: string;
  nextSessionId: string;
  deadline: number;
  // Data
  farmId: number;
  mintId: number;
  fee: string;
}> {
  const response = await window.fetch(`${API_URL}/mint/${request.farmId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${request.token}`,
    },
    body: JSON.stringify({
      sessionId: request.sessionId,
      item: request.item,
      captcha: request.captcha,
    }),
  });
  console.log("mint request over");
  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status !== 200 || !response.ok) {
    throw new Error("Could not mint your object");
  }
  console.log("request in mint args ", request);
  return {
    deadline: 10000000000000,
    farmId: request.farmId,
    fee: "0",
    mintId: request.id,
    nextSessionId: request.sessionId,
    sessionId: request.sessionId,
    signature:
      "0x7fc46024c66e4abacd4b7f866c890f4b0921a0262d1efc3452723718b06bf2b04a0294a8362b6934f06711cbcd2c34767b9d7f1ee5d71de96f8e2f6fbb8c24361c",
  };
}

export async function mint(request: Request) {
  const transaction = await mintRequest(request);
  console.log("min transcation", transaction);
  const sessionId = await metamask.getSessionManager().mint(transaction);

  return { sessionId, verified: true };
}
