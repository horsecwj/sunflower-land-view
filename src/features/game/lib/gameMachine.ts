import {
  createMachine,
  Interpreter,
  assign,
  TransitionsConfig,
  State,
} from "xstate";
import {
  PLAYING_EVENTS,
  PlacementEvent,
  PLACEMENT_EVENTS,
  GameEvent,
  PlayingEvent,
  GameEventName,
} from "../events";

import { Context as AuthContext } from "features/auth/lib/authMachine";
import { metamask } from "../../../lib/blockchain/metamask";

import { GameState, InventoryItemName } from "../types/game";
import { loadSession, MintedAt } from "../actions/loadSession";
import { INITIAL_FARM, EMPTY } from "./constants";
import { autosave } from "../actions/autosave";
import { CollectibleName, LimitedItemName } from "../types/craftables";
import { sync } from "../actions/sync";
import { getOnChainState } from "../actions/onchain";
import { ErrorCode, ERRORS } from "lib/errors";
import { getLowestGameState, updateGame } from "./transforms";
import { getFingerPrint } from "./botDetection";
import { SkillName } from "../types/skills";
import { levelUp } from "../actions/levelUp";
import { reset } from "features/farming/hud/actions/reset";
import {
  acknowledgeRead,
  hasAnnouncements,
} from "features/announcements/announcementsStorage";
import { OnChainEvent, unseenEvents } from "../actions/onChainEvents";
import { expand } from "../expansion/actions/expand";
import { checkProgress, processEvent } from "./processEvent";
import { editingMachine } from "../expansion/placeable/editingMachine";
import { BuildingName } from "../types/buildings";
import { Context } from "../GameProvider";
import { InitialBumpkinParts, mintBumpkin } from "../actions/mintBumpkin";

export type PastAction = GameEvent & {
  createdAt: Date;
};

export interface Context {
  state: GameState;
  onChain: GameState;
  actions: PastAction[];
  offset: number;
  owner?: string;
  sessionId?: string;
  errorCode?: keyof typeof ERRORS;
  fingerprint?: string;
  itemsMintedAt?: MintedAt;
  notifications?: OnChainEvent[];
  maxedItem?: InventoryItemName | "SFL";
  goblinSwarm?: Date;
  deviceTrackerId?: string;
  status?: "COOL_DOWN";
}

type MintEvent = {
  type: "MINT";
  item: LimitedItemName;
  captcha: string;
};

type LevelUpEvent = {
  type: "LEVEL_UP";
  skill: SkillName;
};

type WithdrawEvent = {
  type: "WITHDRAW";
  sfl: number;
  ids: number[];
  amounts: string[];
  captcha: string;
};

type SyncEvent = {
  captcha: string;
  type: "SYNC";
};

type EditEvent = {
  placeable: BuildingName | CollectibleName;
  action: GameEventName<PlacementEvent>;
  type: "EDIT";
};

type MintBumpkinEvent = {
  type: "MINT_BUMPKIN";
  parts: InitialBumpkinParts;
};

export type BlockchainEvent =
  | {
      type: "SAVE";
    }
  | SyncEvent
  | {
      type: "REFRESH";
    }
  | {
      type: "ACKNOWLEDGE";
    }
  | {
      type: "EXPIRED";
    }
  | {
      type: "CONTINUE";
    }
  | {
      type: "RESET";
    }
  | WithdrawEvent
  | GameEvent
  | MintEvent
  | LevelUpEvent
  | EditEvent
  | MintBumpkinEvent
  | { type: "EXPAND" };
//对于每个游戏事件，将其转换为 XState 事件 + 处理程序
// // For each game event, convert it to an XState event + handler
const GAME_EVENT_HANDLERS: TransitionsConfig<Context, BlockchainEvent> =
  Object.keys(PLAYING_EVENTS).reduce(
    (events, eventName) => ({
      ...events,
      [eventName]: [
        {
          target: "hoarding",
          cond: (context: Context, event: PlayingEvent) => {
            const { valid } = checkProgress({
              state: context.state as GameState,
              action: event,
              onChain: context.onChain as GameState,
            });
            console.log(
              "hoarding hoarding",
              "events",
              events,
              "events",
              eventName
            );
            return !valid;
          },
          actions: assign((context: Context, event: PlayingEvent) => {
            const { maxedItem } = checkProgress({
              state: context.state as GameState,
              action: event,
              onChain: context.onChain as GameState,
            });
            console.log(
              "hoarding assign",
              "events",
              events,
              "events",
              eventName
            );

            return { maxedItem };
          }),
        },
        {
          actions: assign((context: Context, event: PlayingEvent) => ({
            state: processEvent({
              state: context.state as GameState,
              action: event,
            }) as GameState,

            actions: [
              ...context.actions,
              {
                ...event,
                createdAt: new Date(),
              },
            ],
          })),
        },
      ],
    }),
    {}
  );

const PLACEMENT_EVENT_HANDLERS: TransitionsConfig<Context, BlockchainEvent> =
  Object.keys(PLACEMENT_EVENTS).reduce(
    (events, eventName) => ({
      ...events,
      [eventName]: {
        actions: assign((context: Context, event: PlacementEvent) => ({
          state: processEvent({
            state: context.state as GameState,
            action: event,
          }) as GameState,
          actions: [
            ...context.actions,
            {
              ...event,
              createdAt: new Date(),
            },
          ],
        })),
      },
    }),
    {}
  );

export type BlockchainState = {
  value:
    | "loading"
    | "announcing"
    | "deposited"
    | "gameRules"
    | "playing"
    | "autosaving"
    | "syncing"
    | "synced"
    | "expanding"
    | "expanded"
    | "levelling"
    | "error"
    | "refreshing"
    | "swarming"
    | "hoarding"
    | "editing"
    | "noBumpkinFound"
    | "mintingBumpkin"
    | "bumpkinMinted"
    | "coolingDown";
  context: Context;
};

export type StateKeys = keyof Omit<BlockchainState, "context">;
export type StateValues = BlockchainState[StateKeys];

export type MachineState = State<Context, BlockchainEvent, BlockchainState>;

export type MachineInterpreter = Interpreter<
  Context,
  any,
  BlockchainEvent,
  BlockchainState
>;

type Options = AuthContext & { isNoob: boolean };

// Hashed eth 0 value
export const INITIAL_SESSION =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function startGame(authContext: Options) {
  return createMachine<Context, BlockchainEvent, BlockchainState>(
    {
      id: "gameMachine",
      initial: "loading",
      context: {
        actions: [],
        state: EMPTY,
        onChain: EMPTY,
        sessionId: INITIAL_SESSION,
        offset: 0,
      },
      states: {
        loading: {
          invoke: {
            src: async (context) => {
              const farmId = authContext.farmId as number;
              console.log("i am in game loading,famrId-", farmId);
              const onChainState = await getOnChainState({
                farmAddress: authContext.address as string,
                id: farmId,
              });

              const onChainEvents = await unseenEvents({
                farmAddress: authContext.address as string,
                farmId: authContext.farmId as number,
              });
              const onChain = onChainState.game;
              const owner = onChainState.owner;
              console.log("onChainonChain", onChain);
              console.log(",owner, ", owner);
              console.log(" bumpkin, ", onChainState.bumpkin);
              console.log(" onChainEvents", onChainEvents);
              // Get sessionId
              const sessionId =
                farmId &&
                (await metamask.getSessionManager().getSessionId(farmId));
              console.log("sessionId", sessionId);
              // Load the farm session ,
              if (sessionId) {
                const fingerprint = await getFingerPrint();
                console.log("onChainState.bumpkin?.tokenURI");
                const response = await loadSession({
                  farmId,
                  bumpkinTokenUri: onChainState.bumpkin?.tokenURI,
                  sessionId,
                  token: authContext.rawToken as string,
                });
                console.log("loadSession response,", response);
                if (!response) {
                  throw new Error("NO_FARM");
                }

                const {
                  game,
                  offset,
                  whitelistedAt,
                  itemsMintedAt,
                  deviceTrackerId,
                  status,
                  flag,
                } = response;
                console.log(
                  "game, offset, whitelistedAt, itemsMintedAt",
                  game,
                  offset,
                  whitelistedAt,
                  itemsMintedAt,
                  deviceTrackerId,
                  status
                );
                // Show whatever is lower, on chain or offchain
                // const availableState = getLowestGameState({
                //   first: onChain.game,
                //   second: game,
                // });
                // add farm address
                if (!flag) {
                  const availableState = getLowestGameState({
                    first: onChain,
                    second: game,
                  });
                  game.inventory = availableState.inventory;
                }

                game.farmAddress = authContext.address;

                return {
                  state: {
                    ...game,
                    id: Number(authContext.farmId),
                  },
                  sessionId,
                  offset,
                  whitelistedAt,
                  fingerprint,
                  itemsMintedAt,
                  onChain,
                  owner,
                  notifications: onChainEvents,
                  deviceTrackerId,
                  status,
                };
              }

              return { state: INITIAL_FARM, onChain };
            },
            onDone: [
              {
                target: "notifying",
                cond: (_, event) => event.data?.notifications?.length > 0,
                actions: "assignGame",
              },
              {
                target: "announcing",
                cond: () => hasAnnouncements(),
                actions: "assignGame",
              },
              {
                target: "mintingBumpkin",
                cond: (_, event) => {
                  console.log(
                    "noBumpkinFound",
                    event.data?.state.bumpkin,
                    !event.data?.state.bumpkin &&
                      window.location.hash.includes("/land")
                  );
                  return (
                    !event.data?.state.bumpkin &&
                    window.location.hash.includes("/land")
                  );
                },
                actions: "assignGame",
              },
              {
                target: "playing",
                cond: (_, event) => {
                  console.log("playing");
                  return true;
                },
                actions: "assignGame",
              },
            ],
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        noBumpkinFound: {
          on: {
            MINT_BUMPKIN: {
              cond: (_, event) => {
                console.log("i am in src : noBumpkinFound");
                return true;
              },
              target: "mintingBumpkin",
            },
          },
        },
        bumpkinMinted: {
          on: {
            CONTINUE: {
              target: "loading",
            },
          },
        },
        notifying: {
          on: {
            ACKNOWLEDGE: {
              target: "refreshing",
            },
          },
        },
        announcing: {
          on: {
            ACKNOWLEDGE: [
              {
                target: "noBumpkinFound",
                cond: (context) => {
                  console.log(
                    "i am in announcing and state is ",
                    !context.state.bumpkin
                  );
                  return (
                    !context.state.bumpkin &&
                    window.location.hash.includes("/land")
                  );
                },
                actions: [() => acknowledgeRead()],
              },
              {
                target: "playing",
                actions: [() => acknowledgeRead()],
              },
            ],
          },
        },
        playing: {
          invoke: {
            /**
             * 检查区块链是否不同步的游戏内循环这是一个罕见的事件，但它可以避免用户取得太多无法同步的进度*/
            src: (context) => (cb) => {
              const interval = setInterval(async () => {
                const sessionID = await metamask
                  .getSessionManager()
                  ?.getSessionId(authContext?.farmId as number);

                if (sessionID !== context.sessionId) {
                  cb("EXPIRED");
                }

                const bumpkins = await metamask
                  .getBumpkinDetails()
                  .loadBumpkins();
                const tokenURI = bumpkins[0]?.tokenURI;

                if (tokenURI !== context.state.bumpkin?.tokenUri) {
                  cb("EXPIRED");
                }
              }, 1000 * 30);

              return () => {
                clearInterval(interval);
              };
            },
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
          on: {
            ...GAME_EVENT_HANDLERS,
            SAVE: {
              target: "autosaving",
            },
            SYNC: {
              target: "syncing",
            },
            LEVEL_UP: {
              target: "levelling",
            },
            EXPIRED: {
              target: "error",
              actions: assign((_) => ({
                errorCode: ERRORS.SESSION_EXPIRED as ErrorCode,
              })),
            },
            RESET: {
              target: "refreshing",
            },
            REFRESH: {
              target: "loading",
            },
            EXPAND: {
              target: "expanding",
            },
            EDIT: {
              target: "editing",
            },
          },
        },
        autosaving: {
          on: {
            ...GAME_EVENT_HANDLERS,
          },
          invoke: {
            src: async (context, event) => {
              const saveAt = (event as any)?.data?.saveAt || new Date();

              if (context.actions.length === 0) {
                return { verified: true, saveAt, farm: context.state };
              }

              const { verified, farm } = await autosave({
                farmId: Number(authContext.farmId),
                sessionId: context.sessionId as string,
                actions: context.actions,
                token: authContext.rawToken as string,
                offset: context.offset,
                fingerprint: context.fingerprint as string,
                deviceTrackerId: context.deviceTrackerId as string,

                gameState: context.state,
              });
              //这使 UI 有时间在单击保存和自动保存时指示正在进行保存
              // This gives the UI time to indicate that a save is taking place both when clicking save
              // and when autosaving
              await new Promise((res) => setTimeout(res, 1000));

              return {
                saveAt,
                verified,
                farm,
              };
            },
            onDone: [
              {
                target: "playing",
                actions: assign((context: Context, event) => {
                  // Actions that occured since the server request
                  const recentActions = context.actions.filter(
                    (action) =>
                      action.createdAt.getTime() > event.data.saveAt.getTime()
                  );

                  return {
                    actions: recentActions,
                    state: updateGame(event.data.farm, context.state),
                  };
                }),
              },
            ],
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        syncing: {
          invoke: {
            src: async (context, event) => {
              // Autosave just in case
              if (context.actions.length > 0) {
                await autosave({
                  farmId: Number(authContext.farmId),
                  sessionId: context.sessionId as string,
                  actions: context.actions,
                  token: authContext.rawToken as string,
                  offset: context.offset,
                  fingerprint: context.fingerprint as string,
                  gameState: context.state,
                  deviceTrackerId: context.deviceTrackerId as string,
                });
              }

              const { sessionId } = await sync({
                farmId: Number(authContext.farmId),
                sessionId: context.sessionId as string,
                token: authContext.rawToken as string,
                captcha: (event as SyncEvent).captcha,
                gameState: context.state,
              });

              return {
                sessionId: sessionId,
              };
            },
            onDone: {
              target: "synced",
              actions: assign((_, event) => ({
                sessionId: event.data.sessionId,
                actions: [],
              })),
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
                actions: assign((_) => ({
                  actions: [],
                })),
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
        },
        levelling: {
          invoke: {
            src: async (context, event) => {
              // Autosave just in case
              if (context.actions.length > 0) {
                await autosave({
                  farmId: Number(authContext.farmId),
                  sessionId: context.sessionId as string,
                  actions: context.actions,
                  token: authContext.rawToken as string,
                  offset: context.offset,
                  fingerprint: context.fingerprint as string,
                  gameState: context.state,
                  deviceTrackerId: context.deviceTrackerId as string,
                });
              }

              const { farm } = await levelUp({
                farmId: Number(authContext.farmId),
                sessionId: context.sessionId as string,
                token: authContext.rawToken as string,
                fingerprint: context.fingerprint as string,
                skill: (event as LevelUpEvent).skill,
                offset: context.offset,
                gameState: context.state,
                deviceTrackerId: context.deviceTrackerId as string,
              });

              return {
                farm,
              };
            },
            onDone: [
              {
                target: "playing",
                actions: assign((_, event) => ({
                  // Remove events
                  actions: [],
                  // Update immediately with state from server
                  state: event.data.farm,
                })),
              },
            ],
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        mintingBumpkin: {
          invoke: {
            src: async (_, event) => {
              console.log("i am in mintingBumpkin");
              await mintBumpkin({
                farmId: Number(authContext.farmId),
                token: authContext.rawToken as string,
                bumpkinParts: (event as MintBumpkinEvent).parts,
              });
            },
            onDone: {
              target: "bumpkinMinted",
            },
            onError: [
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
        },
        refreshing: {
          invoke: {
            src: async (context, event) => {
              // Autosave just in case
              const { success } = await reset({
                farmId: Number(authContext.farmId),
                token: authContext.rawToken as string,
                fingerprint: context.fingerprint as string,
              });

              return {
                success,
              };
            },
            onDone: [
              {
                target: "loading",
              },
            ],
            onError: {
              target: "error",
              actions: "assignErrorMessage",
            },
          },
        },
        error: {
          on: {
            CONTINUE: "playing",
          },
        },
        synced: {
          on: {
            REFRESH: {
              target: "loading",
            },
          },
        },
        //  withdrawn
        expanding: {
          invoke: {
            src: async (context, event) => {
              // Autosave just in case
              if (context.actions.length > 0) {
                await autosave({
                  farmId: Number(authContext.farmId),
                  sessionId: context.sessionId as string,
                  actions: context.actions,
                  token: authContext.rawToken as string,
                  offset: context.offset,
                  fingerprint: context.fingerprint as string,
                  gameState: context.state,
                  deviceTrackerId: context.deviceTrackerId as string,
                });
              }

              const sessionId = await expand({
                farmId: Number(authContext.farmId),
                token: authContext.rawToken as string,
              });

              return {
                sessionId: sessionId,
              };
            },
            onDone: {
              target: "expanded",
              actions: assign((_, event) => ({
                sessionId: event.data.sessionId,
                actions: [],
              })),
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
                actions: assign((_) => ({
                  actions: [],
                })),
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
        },
        expanded: {
          on: {
            REFRESH: {
              target: "loading",
            },
          },
        },
        hoarding: {
          on: {
            SYNC: {
              target: "syncing",
            },
            ACKNOWLEDGE: {
              target: "playing",
            },
          },
        },
        swarming: {
          on: {
            REFRESH: {
              target: "loading",
            },
          },
        },
        editing: {
          invoke: {
            id: "editing",
            autoForward: true,
            src: editingMachine,
            data: {
              placeable: (_: Context, event: EditEvent) => event.placeable,
              action: (_: Context, event: EditEvent) => event.action,
              coordinates: { x: 0, y: 0 },
              collisionDetected: true,
            },
            onDone: {
              target: "playing",
            },
            onError: [
              {
                target: "playing",
                cond: (_, event: any) =>
                  event.data.message === ERRORS.REJECTED_TRANSACTION,
              },
              {
                target: "error",
                actions: "assignErrorMessage",
              },
            ],
          },
          on: {
            ...PLACEMENT_EVENT_HANDLERS,
          },
        },
      },
    },
    {
      actions: {
        assignErrorMessage: assign<Context, any>({
          errorCode: (_context, event) => event.data.message,
          actions: [],
        }),
        assignGame: assign<Context, any>({
          state: (_, event) => event.data.state,
          onChain: (_, event) => event.data.onChain,
          owner: (_, event) => event.data.owner,
          offset: (_, event) => event.data.offset,
          sessionId: (_, event) => event.data.sessionId,
          fingerprint: (_, event) => event.data.fingerprint,
          itemsMintedAt: (_, event) => event.data.itemsMintedAt,
          notifications: (_, event) => event.data.notifications,
          deviceTrackerId: (_, event) => event.data.deviceTrackerId,
          status: (_, event) => event.data.status,
        }),
      },
    }
  );
}
