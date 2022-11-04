import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { BumpkinParts } from "../types/bumpkin";

const API_URL = CONFIG.API_URL;

export type InitialBumpkinParts = Pick<BumpkinParts, "hair" | "body" | "shirt">;
type Options = {
  bumpkinParts: InitialBumpkinParts;
  token: string;
  farmId: number;
};

type Response = {
  payload: {
    deadline: number;
    farmId: number;
    fee: string;
    itemIds: number[];
    sender: string;
    tokenUri: string;
  };
  signature: string;
};

export async function mintBumpkin({ bumpkinParts, token, farmId }: Options) {
  const response = await window.fetch(`${API_URL}/mint-bumpkin/${farmId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bumpkinParts,
    }),
  });
  console.log(bumpkinParts);
  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }
  const args: Response = {
    payload: {
      deadline: 10000000000000,
      farmId: farmId,
      fee: "0",
      itemIds: [],
      sender: "",
      tokenUri: "cwj.html",
    },
    signature:
      "0x7fc46024c66e4abacd4b7f866c890f4b0921a0262d1efc3452723718b06bf2b04a0294a8362b6934f06711cbcd2c34767b9d7f1ee5d71de96f8e2f6fbb8c24361c",
  };
  const transaction: Response = await response.json();
  console.log("mintBumpkin transaction ");
  await metamask.getBumpkinMinter().createBumpkin({
    signature: transaction.signature,
    deadline: transaction.payload.deadline,
    farmId: transaction.payload.farmId,
    fee: transaction.payload.fee,
    partIds: transaction.payload.itemIds,
    tokenUri: transaction.payload.tokenUri,
  });

  await waitForBumpkin();
}

async function waitForBumpkin() {
  const bumpkins = await metamask.getBumpkinDetails().loadBumpkins();

  console.log({ waiting: bumpkins });
  if (bumpkins.length === 0) {
    await waitForBumpkin();
  }

  // Possible pending block bug
  if (bumpkins[0].owner !== metamask.myAccount) {
    await waitForBumpkin();
  }
}
