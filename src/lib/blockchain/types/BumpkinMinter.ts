/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import type BN from "bn.js";
import type { ContractOptions } from "web3-eth-contract";
import type { EventLog } from "web3-core";
import type { EventEmitter } from "events";
import type {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

export interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type OwnershipTransferred = ContractEventLog<{
  previousOwner: string;
  newOwner: string;
  0: string;
  1: string;
}>;

export interface BumpkinMinter extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): BumpkinMinter;
  clone(): BumpkinMinter;
  methods: {
    addGameRole(_game: string): NonPayableTransactionObject<void>;

    executed(arg0: string | number[]): NonPayableTransactionObject<boolean>;

    feeWallet(): NonPayableTransactionObject<string>;

    freeBumpkinMintedAt(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    gameAddGameRole(_game: string): NonPayableTransactionObject<void>;

    gameRemoveGameRole(_game: string): NonPayableTransactionObject<void>;

    gameRoles(arg0: string): NonPayableTransactionObject<boolean>;

    getItemAllowList(
      itemIds: (number | string | BN)[]
    ): NonPayableTransactionObject<boolean[]>;

    itemAllowList(
      arg0: number | string | BN
    ): NonPayableTransactionObject<boolean>;

    mintBumpkin(
      signature: string | number[],
      deadline: number | string | BN,
      mintFee: number | string | BN,
      farmId: number | string | BN,
      itemIds: (number | string | BN)[],
      tokenURI: string
    ): PayableTransactionObject<void>;

    mintedAt(arg0: string): NonPayableTransactionObject<string>;

    owner(): NonPayableTransactionObject<string>;

    removeGameRole(_game: string): NonPayableTransactionObject<void>;

    renounceOwnership(): NonPayableTransactionObject<void>;

    setItemAllowList(
      itemIds: (number | string | BN)[],
      allowed: boolean[]
    ): NonPayableTransactionObject<void>;

    signer(): NonPayableTransactionObject<string>;

    transferFeeWallet(_feeWallet: string): NonPayableTransactionObject<void>;

    transferOwnership(newOwner: string): NonPayableTransactionObject<void>;

    transferSigner(_signer: string): NonPayableTransactionObject<void>;

    verify(
      hash: string | number[],
      signature: string | number[]
    ): NonPayableTransactionObject<boolean>;
  };
  events: {
    OwnershipTransferred(cb?: Callback<OwnershipTransferred>): EventEmitter;
    OwnershipTransferred(
      options?: EventOptions,
      cb?: Callback<OwnershipTransferred>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "OwnershipTransferred", cb: Callback<OwnershipTransferred>): void;
  once(
    event: "OwnershipTransferred",
    options: EventOptions,
    cb: Callback<OwnershipTransferred>
  ): void;
}
