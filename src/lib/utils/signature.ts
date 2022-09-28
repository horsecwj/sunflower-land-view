import Web3 from "web3";
const account =
  "a9e0666cdaa71606fc622fb0b4fe025fe849a5778cfc9bed03625f80d109324a";
//todo 正式服是怎麼簽名的
export async function signTransactionMid(web3: Web3, ...args: any) {
  const txHash = web3.utils.keccak256(web3.utils.encodePacked(...args)!);
  console.log("txhash-", txHash);
  const { signature } = await web3.eth.accounts.sign(txHash, account);
  return signature;
}
