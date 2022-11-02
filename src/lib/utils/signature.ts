import Web3 from "web3";

//todo 正式服是怎麼簽名的
export async function signTransactionMid(
  web3: Web3,
  addr: string,
  ...args: any
) {
  return "0xb365d77779d70f6b986c208be3a7830b75e73b38416c9d249cf0634ab8180307";
  const txHash = web3.utils.keccak256(web3.utils.encodePacked(...args)!);
  console.log("txhash-", txHash, "address-", addr);
  return await web3.eth.personal.sign(txHash, addr, "");
}

export function encodeSyncFunction({
  sessionId,
  deadline,
  sender,
  farmId,
  mintIds,
  mintAmounts,
  burnIds,
  burnAmounts,
  tokens,
}: SyncArgs) {
  const web3 = new Web3();
  console.log(
    "test  parameters",
    web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        [
          "bytes32",
          "int256",
          "uint",
          "uint256[]",
          "uint256[]",

          "uint256[]",
          "uint256[]",
          "uint",
        ],
        [
          sessionId,
          tokens,
          farmId,
          mintIds,
          mintAmounts,
          burnIds,
          burnAmounts,
          deadline,
        ]
      )
    )
  );
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      [
        "bytes32",
        "int256",
        "uint",
        "uint256[]",
        "uint256[]",

        "uint256[]",
        "uint256[]",
        "uint",
      ],
      [
        sessionId,
        tokens,
        farmId,
        mintIds,
        mintAmounts,
        burnIds,
        burnAmounts,
        deadline,
      ]
    )
  );
}

export class TestAccount {
  static readonly TEAM = new TestAccount( // ganache-cli account number (0)
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
  );

  static readonly CHARITY = new TestAccount( // ganache-cli account number (1)
    "0xA0C98e54Ac289A886C8a4eD93AC2F3ecE8acF65f",
    "0xd4f9fd3336dc904874ea88f88dbbc476648766c394f37b2f6f9dc62900e1e5e4"
  );

  static readonly PLAYER = new TestAccount( // ganache-cli account number (2)
    "0x6cE0Dbf103eC5EE8318433DdcD326E0E120e988f",
    "a9e0666cdaa71606fc622fb0b4fe025fe849a5778cfc9bed03625f80d109324a"
  );

  private constructor(
    public readonly address: string,
    public readonly privateKey: any
  ) {}
}

export type WithdrawArgs = {
  sessionId: string;
  deadline: number;
  sender: string;
  farmId: number;
  ids: number[];
  amounts: string[];
  sfl: string;
  tax: number;
};

export function encodeWithdrawFunction({
  sessionId,
  deadline,
  sender,
  farmId,
  ids,
  amounts,
  sfl,
  tax,
}: WithdrawArgs) {
  const web3 = new Web3();
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      [
        "bytes32",
        "uint256",
        "address",
        "uint256",
        "uint256[]",
        "uint256[]",
        "uint256",
        "uint256",
      ],
      [
        sessionId,
        deadline.toString(),
        sender,
        farmId.toString(),
        ids as any,
        amounts as any,
        sfl as any,
        tax as any,
      ]
    )
  );
}

export type SyncArgs = {
  sessionId: string;
  deadline: number;
  sender: string;
  farmId: number;
  mintIds: number[];
  mintAmounts: (string | number)[];
  burnIds: number[];
  burnAmounts: (string | number)[];
  tokens: string | number;
};

export type syncSessionArgs = {
  signature: string;
  sessionId: string;
  deadline: number;

  farmId: number;
  mintIds: number[];
  mintAmounts: number[] | string[];
  burnIds: number[];
  burnAmounts: number[] | string[];
  tokens: number;
};
export type WishArgs = {
  deadline: number;
  sender: string;
  tokens: number;
  farmId: number;
};

export function encodeWishArgs({ deadline, sender, tokens, farmId }: WishArgs) {
  const web3 = new Web3();
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ["uint256", "address", "uint256", "uint256"],
      [tokens, sender, deadline, farmId]
    )
  );
}
