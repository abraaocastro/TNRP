export type MessageType =
  | "TOGGLE_OVERLAY"
  | "GET_STATE"
  | "SET_STATE"
  | "ADD_PLAYER"
  | "REMOVE_PLAYER";

export interface ToggleOverlayMessage {
  type: "TOGGLE_OVERLAY";
}

export interface GetStateMessage {
  type: "GET_STATE";
}

export interface SetStateMessage {
  type: "SET_STATE";
  active: boolean;
}

export interface AddPlayerMessage {
  type: "ADD_PLAYER";
  url: string;
}

export interface RemovePlayerMessage {
  type: "REMOVE_PLAYER";
  playerId: string;
}

export type Message =
  | ToggleOverlayMessage
  | GetStateMessage
  | SetStateMessage
  | AddPlayerMessage
  | RemovePlayerMessage;

export interface TabState {
  active: boolean;
}
