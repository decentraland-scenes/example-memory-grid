import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import { GridMap } from "./modules/grid"
import { SCENE_CENTER, winSound } from "./modules/globals"
import { levelData } from "./modules/levelData"
import { engine, Entity, InputModifier, MeshRenderer, Transform, UiText } from "@dcl/sdk/ecs"
import { SoundBox } from "./modules/soundbox"
import { addEnvironment } from "./modules/environment"
import { checkWin, displaySolution, hideMarkedCells, hideSolutionCells, showMarkedCells, toggleFlashCells } from "./modules/cell"
//import { checkCurrentPlayer, gameDataEntity, initPlayerData,
import { MainMenu } from "./modules/menu"
import { GameStateData, GRID_STATE } from "./modules/gameState"
import { movePlayerTo } from "~system/RestrictedActions"
import { MusicPlayer } from "./modules/music"
import { syncEntity } from "@dcl/sdk/network"
import { getPlayer } from "@dcl/sdk/players"
import { blockCamera, freeCamera, initCamera, lockPlayer, unlockPlayer } from "./modules/lockPlayer"
import { SCOREBOARD_VALUE_TYPE } from "./ui"
import { floatingMessageSystem, spawnFloatingMessage } from "./modules/floatingMessages"
import * as ui from "./ui"


export let gameStateEntity:Entity

export class Game {
    sceneRoot:Entity
    // currentLevel:number = 0
    // currentSubLevel:number = 0
    // maxSubLevel:number = 5
    // maxLevel:number = 6
    map:GridMap
    checkFrequncy:number = 1
    elapsedTime:number = 0
    flashTime:number = 1
    soundBox:SoundBox
    musicPlayer:MusicPlayer
    mainMenu:MainMenu    
    instructions:ui.InstructionsBoard
    

    constructor(){

       // miniGames.queue.initPlayerData(this)

        this.sceneRoot = engine.addEntity()
        Transform.create(this.sceneRoot,{
            position:Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y, SCENE_CENTER.z),
            rotation:Quaternion.fromEulerDegrees(0,0,0)
        })

       
        gameStateEntity = engine.addEntity()

        GameStateData.createOrReplace(gameStateEntity, {
            cells: [],   
            state: GRID_STATE.SHOW_CHALLENGE,
            showChallengeTime: 10,
            displaySolutionTime:20,
            roundTime: 30,
            gameStartCountdownTime:3,
            tries: 3,
            sfxOn:true,
            currentLevel:0,
            currentSubLevel:0,
            elapsedTime: 0,
            maxLevel:6,
            maxSubLevel:3,
            secondCounter:0
    
    
        })
        
    

        this.soundBox = new SoundBox()  

        addEnvironment(this.sceneRoot)     
        this.map = new GridMap({
                position: Vector3.create(0, 2.2, -7.7),
                rotation:Quaternion.fromEulerDegrees(-90,180,0),
                parent:this.sceneRoot
            },
            4,
            4,
            levelData[0],                       
            Quaternion.fromEulerDegrees(0,180,0),
            this
        )

        this.map.initGrid()

        this.mainMenu = new MainMenu(this)       

        engine.addSystem(floatingMessageSystem)

        // virutal camera
        initCamera()
        InputModifier.createOrReplace(engine.PlayerEntity, {
            mode: {
                $case: 'standard',
                standard: {
                    disableAll: false,
                },
            },
        })
       
        //GAME LOOP
        engine.addSystem((dt:number)=>{

           
            const gameState = GameStateData.getMutable(gameStateEntity)


            switch(gameState.state){

                case GRID_STATE.IDLE: {
                    hideMarkedCells()
                    break;
                }
                case GRID_STATE.START_COUNTDOWN: {
                    hideMarkedCells()
                    if(gameState.elapsedTime < gameState.gameStartCountdownTime){
                        gameState.elapsedTime += dt
                        gameState.secondCounter +=dt

                        if (gameState.secondCounter > 1){
                            // this.mainMenu.countdown.setTimeSeconds(Math.ceil(gameState.gameStartCountdownTime - gameState.elapsedTime))
                            this.mainMenu.countdown.setTimeAnimated(Math.ceil(gameState.gameStartCountdownTime - gameState.elapsedTime))
                            gameState.secondCounter = 0
                        }
                        
                        
                    }
                    else{
                        this.mainMenu.countdown.hide()
                        this.startLevel(gameState.currentLevel)
                        gameState.secondCounter = 0
                    }
                    break;
                }
                case GRID_STATE.SHOW_CHALLENGE: {

                    if(gameState.elapsedTime < gameState.showChallengeTime){
                        gameState.elapsedTime += dt
                        gameState.secondCounter +=dt
                        if (gameState.secondCounter > 1){
                            this.mainMenu.timer.setTimeSeconds(Math.ceil(gameState.showChallengeTime - gameState.elapsedTime))
                            gameState.secondCounter = 0
                        }
                        // this.map.hideHover()
                    }
                    else{
                        console.log("NOW INTERACTIVE")
                        gameState.elapsedTime = 0
                        gameState.secondCounter = 0
                        gameState.state = GRID_STATE.INTERACTIVE
                        hideSolutionCells()
                        // this.map.showHover()
                    }
                    break;
                }
                case GRID_STATE.INTERACTIVE: {

                    GameStateData.getMutable(gameStateEntity).gameTime +=dt
                    if(gameState.elapsedTime < gameState.roundTime){
                        gameState.elapsedTime += dt
                        gameState.secondCounter +=dt

                        if (gameState.secondCounter > 1){
                            this.mainMenu.timer.setTimeSeconds(gameState.roundTime - gameState.elapsedTime)
                            gameState.secondCounter = 0
                        }

                    }
                    else{
                        console.log("ROUNDS UP - SHOWING SOLUTION")                        
                        this.checkSolution()
                        // this.map.hideHover()
                    }
                    break;
                }
                case GRID_STATE.DISPLAY_SOLUTION: {
                    if(gameState.elapsedTime < gameState.displaySolutionTime){
                        gameState.elapsedTime += dt
                        gameState.secondCounter +=dt

                        if (gameState.secondCounter > 1){
                            this.mainMenu.timer.setTimeSeconds(gameState.displaySolutionTime - gameState.elapsedTime)
                            gameState.secondCounter = 0
                        }
                        
                        this.flashTime +=dt
                        if(this.flashTime > this.checkFrequncy){
                            this.flashTime = 0
                            //if(checkCurrentPlayer()){
                                
                                toggleFlashCells()
                            // }
                        
                        }
                    
                    }
                    else{
                        console.log("GAME END")
                        console.log("MAP COMPLETE : " + this.map.isLevelComplete())

                        if(this.map.isLevelComplete()){
                            console.log("PROGRESS TO NEXT LEVEL")

                            // STEP SUBLEVEL ON SAME DIFFICULTY
                            if(gameState.currentSubLevel ++ < gameState.maxSubLevel-1){
                                this.startLevel(gameState.currentLevel)
                                console.log("NOW ON SUBLEVEL: " + gameState.currentSubLevel)
                                this.mainMenu.updateSublevels(gameState.currentLevel, gameState.maxSubLevel, gameState.currentSubLevel)
                            }
                            //STEP DIFFICULTY LEVEL TO NEXT
                            else{
                                if(gameState.currentLevel + 1 <= gameState.maxLevel){

                                    gameState.currentLevel++
                                    this.startLevel(gameState.currentLevel)
                                    gameState.currentSubLevel = 0          
                                    this.mainMenu.updateSublevels(gameState.currentLevel, gameState.maxSubLevel, gameState.currentSubLevel)                              
            

                                    this.mainMenu.levelButtons[gameState.currentLevel].enable()
                                    this.mainMenu.levelButtons[gameState.currentLevel].changeIcon(ui.uiAssets.numbers[gameState.currentLevel+1])  
                                    
            
                                    gameState.elapsedTime = 0
                                    gameState.state = GRID_STATE.SHOW_CHALLENGE
                                }
                                else{
                                    this.exitPlayer()
                                    
                                }
                            }
                            
                        }
                        else{
                            console.log("RETRY IF THERE ARE MORE TRIES LEFT")
                            
                            // this.spendOneTry()
                            console.log("TRIES LEFT: " + gameState.tries)

                            //RESTART LEVEL IF PLAYER HAS TRIES LEFT
                            if(this.spendOneTry()){
                                console.log("RESTARTING LEVEL: " + gameState.currentLevel)
                                this.startLevel(gameState.currentLevel)                               
                            }
                            else{
                                //EXIT PLAYER FROM GAME AREA
                                console.log("EXITING GAME - NO MORE TRIES LEFT")
                                this.exitPlayer()
                            }
                            
                        //  }
                        }                       
                        
                    }
                    break;
                }
            }          
            
        })

        //syncEntity garbage Collector
        engine.addSystem((dt:number)=>{
            
            const gameState = GameStateData.getMutable(gameStateEntity)

            if(gameState.state != GRID_STATE.INTERACTIVE){
                
                
            }
        })

       

        //INSTRUCTIONS
        this.instructions = new ui.InstructionsBoard({
            position: Vector3.create(7.64,3.5, 4 + 2.95),
            rotation: Quaternion.fromEulerDegrees(0,90,0),
            parent: this.sceneRoot
        },
        2.8,
        2.8,
        "images/instructions_memory_grid.png"
        )  

        //MUSIC
        this.musicPlayer = new MusicPlayer()
    }   

    

    newGame(){
       
        console.log("GETS THROUGH PLAYER CHECK")
        //movePlayerTo({ newRelativePosition: Vector3.create(11, 0, 8),cameraTarget: Vector3.create(16,3,8) })
        lockPlayer()
        blockCamera() 
        this.mainMenu.countdown.show()
        //this.musicPlayer.playMusic()
        this.startLevel(0)
        const gameState = GameStateData.getMutable(gameStateEntity)
        gameState.state = GRID_STATE.START_COUNTDOWN
        gameState.secondCounter = 0
        this.mainMenu.updateSublevels(0, levelData[0].subLevels, 0)
        GameStateData.getMutable(gameStateEntity).gameTime = 0

    }

    startLevel(level:number){       
        
        
        
        const gameStateNonMutable = GameStateData.get(gameStateEntity)

        if(level < gameStateNonMutable.maxLevel){        
            
            const gameState = GameStateData.getMutable(gameStateEntity)
           // gameState.tries--
           
                
                this.map.setLevel(levelData[level])
                gameState.currentLevel = level 
                gameState.maxSubLevel = levelData[level].subLevels
               
                gameState.state = GRID_STATE.SHOW_CHALLENGE
                gameState.elapsedTime = 0
                showMarkedCells()
                this.mainMenu.updateTries(gameState.tries)
                spawnFloatingMessage("MEMORIZE PATTERN", Vector3.create(0,0.25,-1 ), 0.15, this.mainMenu.menuRoot, Color4.Green() )
                

           
        }
    }

    spendOneTry():boolean{
        const gameState = GameStateData.getMutable(gameStateEntity)

        if(gameState.tries-- <= 0){

            this.mainMenu.updateTries(gameState.tries)
            return false
        }         
        this.mainMenu.updateTries(gameState.tries)
        return true
    }

    checkSolution(){
        const gameState = GameStateData.getMutable(gameStateEntity)

        if(gameState.state == GRID_STATE.INTERACTIVE){
            gameState.elapsedTime = 0
            gameState.state = GRID_STATE.DISPLAY_SOLUTION
            if(checkWin()){
                this.map.winGame(gameState.sfxOn)   
                this.mainMenu.updateSublevels(gameState.currentLevel, gameState.maxSubLevel, gameState.currentSubLevel+1)             
            }
            else{
                this.map.loseGame(gameState.sfxOn)
            }
           // displaySolution()
        }
        
    }
   

    exitPlayer(){       
        unlockPlayer()
        freeCamera()
        GameStateData.getMutable(gameStateEntity).tries = 3
        //this.musicPlayer.stopMusic()
        GameStateData.getMutable(gameStateEntity).state = GRID_STATE.IDLE
       
    }

    toggleSFX(){
        const gameState = GameStateData.getMutable(gameStateEntity)

        gameState.sfxOn = !gameState.sfxOn 
        
    }

    
}

