import { GameState, PlayerState, ShotEvent } from "./game";

// A discriminated union — each message type has a unique "type" field.
// In a switch(msg.type) block, TypeScript automatically narrows the type
// so you only access fields that actually exist on that variant.
//
// Example:
//   switch (msg.type) {
//     case "game_init": msg.shots  // TS knows shots exists here
//     case "pong":      msg.shots  // TS ERROR — pong has no shots field
//   }

export type WSMessage =
  | {
      type: "game_init";
      game_id: string;
      shots: ShotEvent[];
      players: PlayerState[];
      game_state: GameState;
    }
  | {
      type: "shot_update";
      shots: ShotEvent[];
      game_state: GameState;
    }
  | {
      type: "roster_update";
      players: PlayerState[];
    }
  | {
      type: "pong";
    };
