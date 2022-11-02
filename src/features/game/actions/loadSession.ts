import { removeSession } from "features/auth/actions/login";
import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { sanitizeHTTPResponse } from "lib/network";
import { makeGame, saveGame } from "../lib/transforms";
import { GameState, InventoryItemName } from "../types/game";
import { INITIAL_FARM } from "../lib/constants";
import { serialize as serializeT } from "class-transformer";
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
  deviceTrackerId: string;
  status?: "COOL_DOWN";
  flag?: boolean;
};

const API_URL = CONFIG.API_URL;

export async function SaveGameState(
  farmId: number,
  owner: string,
  state: GameState,
  first: boolean,
  token: string,
  synced: boolean
) {
  let stateSerialize = "";
  if (first) {
    const resGame = saveGame(INITIAL_FARM);
    stateSerialize = serializeT(resGame);
  } else {
    const resGame = saveGame(state);
    stateSerialize = serializeT(resGame);
  }
  console.log("save state", `${API_URL}/saveState/${farmId}`);
  const response = await window.fetch(`${API_URL}/saveState/${farmId}`, {
    method: "POST",
    //mode: "no-cors",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    body: JSON.stringify({
      stateSerialize,
      owner,
      synced,
      first,
    }),
  });
  if (response.status === 503) {
    throw new Error(ERRORS.MAINTENANCE);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }
  return true;
}

export async function GetGameState(
  farmId: number,
  token: string,
  synced: boolean
) {
  const response = await window.fetch(`${API_URL}/getState/${farmId}`, {
    method: "post",
    //mode: "no-cors",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    body: JSON.stringify({
      synced,
    }),
  });
  if (response.status === 503) {
    throw new Error(ERRORS.MAINTENANCE);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }
  const dataSrc = await response.json();
  console.log("dataSrc-", dataSrc);
  const {
    data: {
      Res: { farmJson: farmJson, createdAt: created_at, updatedAt: updated_at },
    },
  } = dataSrc;
  let flag = false;
  console.log(
    "created_at",
    created_at,
    updated_at,
    "updated_at",
    "res ",
    created_at == updated_at
  );
  if (created_at == updated_at) {
    flag = true;
  } else {
    flag = false;
  }
  return { farmJson, flag };
}

export async function GetSyncedGameState(farmId: number, token: string) {
  const response = await window.fetch(`${API_URL}/getSyncedState/${farmId}`, {
    method: "get",
    //mode: "no-cors",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
  });
  if (response.status === 503) {
    throw new Error(ERRORS.MAINTENANCE);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }
  const {
    data: {
      Res: { farmJson },
    },
  } = await response.json();
  return farmJson;
}
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
    DeviceTrackerId,
    Status,
  } = await sanitizeHTTPResponse<{
    Farm: any;
    StartedAt: string;
    IsBlacklisted: boolean;
    WhitelistedAt: string;
    ItemsMintedAt: MintedAt;
    BlacklistStatus: Response["blacklistStatus"];
    DeviceTrackerId: string;
    Status?: "COOL_DOWN";
  }>(response);
  const farm = Farm;
  const startedAt = StartedAt;
  const isBlacklisted = IsBlacklisted;
  const whitelistedAt = WhitelistedAt;
  const itemsMintedAt = ItemsMintedAt;
  const blacklistStatus = BlacklistStatus;
  const deviceTrackerId = DeviceTrackerId;
  const status = Status;

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
    blacklistStatus,
    deviceTrackerId,
    status
  );
  saveSession(request.farmId);
  console.log("saveSession over");

  // let startedTime;
  // if (farm == 0) {
  //   startedTime = new Date(Date.now());
  // } else {
  //   startedTime = new Date(startedAt);
  // }
  const startedTime = new Date(Date.now());
  console.log("saveSession startedTime ", startedTime, startedTime, farm);
  let offset = 0;
  // Clock is not in sync with actual UTC time
  if (Math.abs(startedTime.getTime() - Date.now()) > 1000 * 30) {
    offset = startedTime.getTime() - Date.now();
  }

  const { farmJson: resJson, flag: flag } = await GetGameState(
    request.farmId,
    request.token,
    false
  );
  const resjj = JSON.parse(resJson);
  const serverState = makeGame(resjj);
  console.log("GetGameState ", serverState);

  return {
    offset,
    game: serverState,
    isBlacklisted,
    whitelistedAt,
    itemsMintedAt,
    blacklistStatus,
    deviceTrackerId,
    status,
    flag,
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
