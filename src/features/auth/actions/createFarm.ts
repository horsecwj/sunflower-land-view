import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { CharityAddress } from "../components/CreateFarm";
import { signTransactionMid } from "lib/utils/signature";

type Request = {
  charity: string;
  token: string;
  captcha: string;
};

const API_URL = CONFIG.API_URL;

export async function signTransaction(request: Request) {
  const response = await window.fetch(`${API_URL}/farm`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${request.token}`,
    },
    body: JSON.stringify({
      charity: request.charity,
      captcha: request.captcha,
    }),
  });

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.FAILED_REQUEST);
  }

  const {
    data: {
      Signature: signatureTmp,
      Charity: charityTmp,
      Deadline: deadline,
      Fee: fee,
    },
  } = await response.json();

  const charity = request.charity;
  const myWeb3 = await metamask.getWeb3();
  const myAddress = await metamask.getAccount();
  console.log(
    "  myWeb3,\n" + "    charity,\n" + "    fee,\n" + "    myAddress",
    myWeb3,
    charity,
    fee,
    myAddress
  );
  const signature = await signTransactionMid(myWeb3, charity, fee, myAddress);

  return { signature, charity, deadline, fee };
}

type CreateFarmOptions = {
  charity: CharityAddress;
  token: string;
  captcha: string;
};

export async function createFarm({
  charity,
  token,
  captcha,
}: CreateFarmOptions) {
  const transaction = await signTransaction({
    charity,
    token,
    captcha,
  });
  console.log("createFarm.signTransaction-transaction:", transaction);
  await metamask.getFarmMinter().createFarm(transaction);

  const farm = await metamask.getFarm().getNewFarm();

  return farm;
}
