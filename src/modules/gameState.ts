import { engine, Schemas } from "@dcl/sdk/ecs";

export enum GRID_STATE {
    IDLE,
    START_COUNTDOWN,
    SHOW_CHALLENGE,
    INTERACTIVE,
    DISPLAY_SOLUTION,
    SET_NEXT_LEVEL
}

export const GameStateData = engine.defineComponent('game-state-data', {    
    cells:Schemas.Array(Schemas.Array(Schemas.Entity)),
    state:Schemas.EnumNumber<GRID_STATE>(GRID_STATE, GRID_STATE.IDLE),
    elapsedTime:Schemas.Number,
    roundTime:Schemas.Number,
    showChallengeTime:Schemas.Number,
    displaySolutionTime:Schemas.Number,
    gameStartCountdownTime:Schemas.Number,
    sfxOn:Schemas.Boolean,
    tries:Schemas.Number,
    currentLevel:Schemas.Number,
    currentSubLevel:Schemas.Number,
    maxSubLevel:Schemas.Number,
    maxLevel:Schemas.Number,
    gameTime:Schemas.Number,
    secondCounter:Schemas.Number

})
