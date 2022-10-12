import { removeSession } from "features/auth/actions/login";
import { metamask } from "lib/blockchain/metamask";
import { CONFIG } from "lib/config";
import { ERRORS } from "lib/errors";
import { sanitizeHTTPResponse } from "lib/network";
import { GameEventName, PlacementEvent, PlayingEvent } from "../events";
import { SellAction } from "../events/sell";
import { PastAction } from "../lib/gameMachine";
import { makeGame } from "../lib/transforms";
import { CraftAction } from "../types/craftables";
import { getSessionId, SaveGameState } from "./loadSession";
import { classToPlain } from "class-transformer";
import { GameState } from "../types/game";

type Request = {
  actions: PastAction[];
  farmId: number;
  sessionId: string;
  token: string;
  offset: number;
  fingerprint: string;
  gameState: GameState;
};

const API_URL = CONFIG.API_URL;

const EXCLUDED_EVENTS: GameEventName<PlayingEvent | PlacementEvent>[] = [
  "expansion.revealed",
  "bot.detected",
];

/**
 * Squashes similar events into a single event
 * Filters out UI only events
 */
function squashEvents(events: PastAction[]): PastAction[] {
  return events.reduce((items, event, index) => {
    if (EXCLUDED_EVENTS.includes(event.type)) {
      return items;
    }

    if (index > 0) {
      const previous = items[items.length - 1];

      const isShopEvent =
        (event.type === "item.crafted" && previous.type === "item.crafted") ||
        (event.type === "item.sell" && previous.type === "item.sell");

      // We can combine the amounts when buying/selling the same item
      if (isShopEvent && event.item === previous.item) {
        return [
          ...items.slice(0, -1),
          {
            ...event,
            amount:
              (previous as SellAction | CraftAction).amount + event.amount,
          } as PastAction,
        ];
      }
    }

    return [...items, event];
  }, [] as PastAction[]);
}

function serialize(events: PastAction[], offset: number) {
  return events.map((action) => ({
    ...action,
    createdAt: new Date(action.createdAt.getTime() + offset).toISOString(),
  }));
}

export async function autosaveRequest(
  request: Omit<Request, "actions" | "offset"> & { actions: any[] }
) {
  const ttl = (window as any)["x-amz-ttl"];

  // Useful for using cached results
  const cachedKey = getSessionId();
  console.log("request.farmId", request.farmId);
  console.log("autosaveRequest url:", `${API_URL}/autosave/${request.farmId}`);

  return await window.fetch(`${API_URL}/autosave/${request.farmId}`, {
    method: "POST",
    headers: {
      ...{
        "content-type": "application/json;charset=UTF-8",
        Authorization: `Bearer ${request.token}`,
        "X-Fingerprint": request.fingerprint,
      },
      ...(ttl ? { "X-Amz-TTL": (window as any)["x-amz-ttl"] } : {}),
    },
    body: JSON.stringify({
      sessionId: request.sessionId,
      actions: request.actions,
      clientVersion: CONFIG.CLIENT_VERSION as string,
      cachedKey,
    }),
  });
}

function CURDEvents(events: PastAction[], state: GameState) {
  for (const val in events) {
    const tempEvent = events[val];
    console.log("CURDEvents", val, events[val]);
    if (tempEvent.type == "tree.chopped") {
      console.log("tree is cut down ");
      // tempEvent as
    }
  }

  return state;
}
export async function autosave(request: Request) {
  if (!API_URL) return { verified: true };

  // Shorten the payload
  const events = squashEvents(request.actions);
  console.log("events", events);
  const actions = serialize(events, request.offset);
  console.log("actions", actions);
  if (actions.length === 0) {
    return { verified: true };
  }
  const requestjSON = classToPlain(request);
  console.log("request.gameState", request.gameState);
  console.log("requestjSON", requestjSON);
  // CURDEvents(request.actions, request.gameState);
  const response = await autosaveRequest({
    ...request,
    actions,
  });
  await SaveGameState(
    request.farmId,
    "",
    request.gameState,
    false,
    request.token,
    false
  );
  if (response.status === 503) {
    throw new Error(ERRORS.MAINTENANCE);
  }

  if (response.status === 401) {
    removeSession(metamask.myAccount as string);
  }

  if (response.status === 429) {
    throw new Error(ERRORS.TOO_MANY_REQUESTS);
  }

  if (response.status !== 200 || !response.ok) {
    throw new Error("Could not save game");
  }

  const { farm } = await sanitizeHTTPResponse<{
    farm: any;
  }>(response);

  const game = makeGame(request.gameState);

  return { verified: true, farm: request.gameState };
}
