import { removeSession } from "features/auth/actions/login";
import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { sanitizeHTTPResponse } from "lib/network";
import { makeGame } from "../lib/transforms";
import { GameState, InventoryItemName } from "../types/game";
import { INITIAL_FARM } from "../lib/constants";
const GAME_STATE: GameState = INITIAL_FARM;

type Request = {
  sessionId: string;
  bumpkinTokenUri?: string;
  farmId: number;
  token: string;
};

export type MintedAt = Partial<Record<InventoryItemName, number>>;
type Response = {
  game: GameState;
  offset: number;
  isBlacklisted?: boolean;
  whitelistedAt?: string;
  itemsMintedAt?: MintedAt;
  blacklistStatus?: "investigating" | "permanent";
};

const API_URL = CONFIG.API_URL;

export async function loadSession(
  request: Request
): Promise<Response | undefined> {
  if (!API_URL) return;
  console.log(
    "i am in loadSession ",
    request.bumpkinTokenUri,
    request.sessionId
  );
  const response = await window.fetch(`${API_URL}/session/${request.farmId}`, {
    method: "POST",
    //mode: "no-cors",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${request.token}`,
      accept: "application/json",
    },
    body: JSON.stringify({
      sessionId: request.sessionId,
      bumpkinTokenUri: request.bumpkinTokenUri,
      clientVersion: CONFIG.CLIENT_VERSION as string,
    }),
  });

  if (response.status === 503) {
    throw new Error(ERRORS.MAINTENANCE);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status === 401) {
    removeSession(metamask.myAccount as string);
  }

  if (response.status >= 400) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  const {
    Farm,
    StartedAt,
    IsBlacklisted,
    WhitelistedAt,
    ItemsMintedAt,
    BlacklistStatus,
  } = await sanitizeHTTPResponse<{
    Farm: any;
    StartedAt: string;
    IsBlacklisted: boolean;
    WhitelistedAt: string;
    ItemsMintedAt: MintedAt;
    BlacklistStatus: Response["blacklistStatus"];
  }>(response);
  const farm = Farm;
  const startedAt = StartedAt;
  const isBlacklisted = IsBlacklisted;
  const whitelistedAt = WhitelistedAt;
  const itemsMintedAt = ItemsMintedAt;
  const blacklistStatus = BlacklistStatus;

  console.log(
    "farm,=" +
      "    startedAt," +
      "    isBlacklisted," +
      "    whitelistedAt," +
      "    itemsMintedAt," +
      "    blacklistStatus,",
    farm,
    startedAt,
    isBlacklisted,
    whitelistedAt,
    itemsMintedAt,
    blacklistStatus
  );
  saveSession(request.farmId);
  console.log("saveSession over");
  let startedTime;
  if (farm == 0) {
    startedTime = new Date(Date.now());
  } else {
    startedTime = new Date(startedAt);
  }
  console.log("saveSession startedTime ", startedTime, startedTime, farm);
  let offset = 0;
  // Clock is not in sync with actual UTC time
  if (Math.abs(startedTime.getTime() - Date.now()) > 1000 * 30) {
    offset = startedTime.getTime() - Date.now();
  }
  if (farm == 0) {
    return {
      offset,
      game: GAME_STATE,
      isBlacklisted,
      whitelistedAt,
      itemsMintedAt,
      blacklistStatus,
    };
  }
  return {
    offset,
    game: makeGame(farm),
    isBlacklisted,
    whitelistedAt,
    itemsMintedAt,
    blacklistStatus,
  };
}

const host = window.location.host.replace(/^www\./, "");
const LOCAL_STORAGE_KEY = `sb_wiz.xtc.t.${host}-${window.location.pathname}`;

// Farm ID -> ISO Date
type FarmSessions = Record<number, { account: string }>;

export function getSessionId(): string {
  const item = localStorage.getItem(LOCAL_STORAGE_KEY);
  console.log("getSessionId item", item);
  let id = "";
  if (item) {
    const sessions = JSON.parse(item) as FarmSessions;
    console.log("getSessionId sessions:", sessions);
    id = Object.values(sessions).join(":");
  }

  return id;
}

export function saveSession(farmId: number) {
  let sessions: FarmSessions = {};

  const item = localStorage.getItem(LOCAL_STORAGE_KEY);
  console.log("saveSession item ", item);
  if (item) {
    sessions = JSON.parse(item) as FarmSessions;
  }

  const farmSession = {
    farmId,
    loggedInAt: Date.now(),
    account: metamask.myAccount,
  };

  const cacheKey = Buffer.from(JSON.stringify(farmSession)).toString("base64");
  console.log("saveSession cacheKey ", cacheKey);
  const newSessions = {
    ...sessions,
    [farmId]: cacheKey,
  };

  return localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newSessions));
}
