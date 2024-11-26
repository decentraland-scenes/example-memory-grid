import { engine, Entity, pointerEventsSystem, Transform } from "@dcl/sdk/ecs";
import { Game, gameStateEntity } from "../game";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import * as utils from "@dcl-sdk/utils"
import { GameStateData, GRID_STATE } from "./gameState";

import * as ui from "../ui"


const uiAssets = ui.uiAssets

export class MainMenu{
    menuRoot:Entity
    menuWidth:number = 10
    playButton:ui.MenuButton
    exitButton:ui.MenuButton
    resetButton:ui.MenuButton
    musicButton:ui.MenuButton
    soundsButton:ui.MenuButton
    levelButtons:ui.MenuButton[]
    levelLabel:ui.MenuLabel
    sublevelRoot:Entity    
    checkSolutionButton:ui.MenuButton
    timer:ui.Timer3D
    triesCounter:ui.Counter3D
    countdown:ui.Timer3D
    boardCenter:Vector3 
    boardTop:Vector3
    subLevelMarkers:ui.BoxIcon[]
    levelButtonSpacing:number = 0.55


    constructor(game:Game){

        const gameState = GameStateData.getMutable(gameStateEntity)


        let menuRow1Height:number = 0
        let menuRow2Height:number = -1.8
        let menuRow3Height:number = -2.9
        let buttonScale:number = 2.1
        let levelButtonScale:number = 1.8
        let buttonSpacing:number = 0.64
       
        this.boardCenter = Vector3.create(1, -1.5, -0.3)
        this.boardTop = Vector3.create(0.95, 0.9,-0.05)

        
        this.subLevelMarkers  = []
        this.levelButtons = []

        this.menuRoot = engine.addEntity()
        Transform.create(this.menuRoot, {
            position: Vector3.create(0,3.77,-7.75),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(1,1,1),
            parent:game.sceneRoot
        })

        this.sublevelRoot = engine.addEntity()
        Transform.create(this.sublevelRoot,{
            position:Vector3.create(-3.15,-0.3 - this.levelButtonSpacing*0, -0.05),
            parent:this.menuRoot
        })

         //PLAY BUTTON
         this.playButton = new ui.MenuButton({
            position: Vector3.create(0, 1.0377,3.2),
            rotation: Quaternion.fromEulerDegrees(-42.411,180,0),
            scale: Vector3.create(1.3, 1.3, 1.3),
            parent: game.sceneRoot
        },
        
        uiAssets.shapes.RECT_GREEN,
        uiAssets.icons.playText,        
        "PLAY/SIGN UP",
        ()=>{
            game.newGame()
        })       

         //EXIT BUTTON
         this.exitButton = new ui.MenuButton({
            position: Vector3.create(2.85,menuRow1Height,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(2.6, 2.6, 2.6),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.RECT_RED,
        uiAssets.icons.exitText,        
        "EXIT GAME",
        ()=>{            
            //setCurrentPlayer() 
            game.exitPlayer()          
        })

         //SOUND BUTTON
         this.soundsButton = new ui.MenuButton({
            position: Vector3.create(2.5,menuRow1Height-0.75,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale, buttonScale, buttonScale),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_RED,
        uiAssets.icons.sound,        
        "TOGGLE SOUNDS",
        ()=>{            
            game.toggleSFX()     
        })

         //MUSIC BUTTON
         this.musicButton = new ui.MenuButton({
            position: Vector3.create(2.5+ buttonSpacing,menuRow1Height-0.75,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale, buttonScale, buttonScale),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_RED,
        uiAssets.icons.music,        
        "TOGGLE MUSIC",
        ()=>{            
           game.musicPlayer.toggleMusic()
        })


         //RESTART BUTTON
         this.resetButton = new ui.MenuButton({
            position: Vector3.create(2.5, menuRow3Height ,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale, buttonScale, buttonScale),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_RED,
        uiAssets.icons.restart,        
        "RETRY",
        ()=>{  

            const gameState = GameStateData.getMutable(gameStateEntity)
            //only allow retry button when game has started
            if(gameState.state != GRID_STATE.START_COUNTDOWN)
            {
                if(game.spendOneTry()){
                    game.startLevel(gameState.currentLevel)
                }    
                else{
                    game.exitPlayer()
                }    
            }
           
            
        })

        //TRIES COUNTER
        this.triesCounter = new ui.Counter3D({
            position: Vector3.create(3.15, menuRow3Height ,0),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale: Vector3.create(0.5, 0.5, 0.5),
            parent: this.menuRoot
        }, 
        1, 
        1.1, 
        false,
        50
        )
        this.triesCounter.setNumber(3)

         //CHECK SOLUTION BUTTON
         this.checkSolutionButton = new ui.MenuButton({
            position: Vector3.create(2.8, menuRow2Height ,0),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(buttonScale*2, buttonScale*2, buttonScale*2),
            parent: this.menuRoot
        },
        
        uiAssets.shapes.SQUARE_GREEN,
        uiAssets.icons.checkmark,        
        "CHECK SOLUTION",
        ()=>{            
            //game.map.setLevel(levelData[this.currentLevel].linesX, levelData[this.currentLevel].linesZ,levelData[this.currentLevel].mines)            
            game.checkSolution()
        })

        
        //LEVEL BUTTONS
        for(let i=0; i< 6; i++){
            let levelButton =  new ui.MenuButton({
                position: Vector3.create(-3.65,-0.3 - this.levelButtonSpacing*i, 0),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(levelButtonScale, levelButtonScale, levelButtonScale),
                parent: this.menuRoot
            },
            uiAssets.shapes.SQUARE_GREEN,
            uiAssets.numbers[i+1],
            ("LEVEL " + i+1),
            ()=>{          
                // const gameState = GameStateData.getMutable(gameStateEntity)
                // gameState.currentLevel = i 
                // game.startLevel(i)
                //this.map.setLevel(levelData[0].linesX, levelData[0].linesZ,levelData[0].mines)            
            })  
            if(i != 0){
                levelButton.disable()
            }      
            this.levelButtons.push(levelButton)

            
        }      

        // LEVEL LABEL
        this.levelLabel = new ui.MenuLabel({
            position: Vector3.create(-2.65 - buttonSpacing,0.2,-0.05),
            rotation: Quaternion.fromEulerDegrees(-90,0,0),
            scale: Vector3.create(5,5,5),
            parent: this.menuRoot
        }, 
        uiAssets.icons.levelText)

        
        //TIMER
        this.timer = new ui.Timer3D({
            parent:this.menuRoot,
            position: Vector3.create(0.0, 0.9,-0.05),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale:Vector3.create(0.5, 0.5, 0.5)
        },
         1,
         1.1,
         true,
         1,

                 
        )
        //COUNTDOWN
        this.countdown = new ui.Timer3D({
            parent:this.menuRoot,
            position: Vector3.create(0.0, -1.5,-0.4),
            rotation: Quaternion.fromEulerDegrees(0,180,0),
            scale:Vector3.create(1, 1, 1)
        },
         1,
         1.1,
         false,
         2        
        )

        //this.moveCountdownToCenter()
        

       
        this.initSubLevels(5)

    //    this.timer.setNumber(0)
    }

    updateTries(number:number){
        this.triesCounter.setNumber(number)
    }

    initSubLevels(count:number){
        for(let i=0; i< count; i++){
            let sublevelMarker = new ui.BoxIcon({
                parent: this.sublevelRoot,
                position: Vector3.create( i*0.4, 0, 0.1),
                rotation: Quaternion.fromEulerDegrees(-90,0,0),
                scale: Vector3.create(2,2,2)
                },
                uiAssets.shapes.SQUARE_BLACK,
                uiAssets.icons.close,            
            )

            this.subLevelMarkers.push(sublevelMarker)

            if(i >= 3){
                sublevelMarker.hide()
            }
        }
    }

    updateSublevels(level:number, count:number, ativatedCount:number){

        for(let i=0; i< this.subLevelMarkers.length; i++){

            Transform.getMutable(this.sublevelRoot).position = Vector3.create(-3.15,-0.3 - this.levelButtonSpacing*level, -0.05)

            if(i < count){
                if(i<ativatedCount){
                    this.subLevelMarkers[i].changeIcon(uiAssets.icons.checkmark)
                    this.subLevelMarkers[i].changeShape(uiAssets.shapes.SQUARE_GREEN)
                }
                else{
                    this.subLevelMarkers[i].changeIcon(uiAssets.icons.close)
                    this.subLevelMarkers[i].changeShape(uiAssets.shapes.SQUARE_BLACK)
                }
                this.subLevelMarkers[i].show()
            }   
            
            else{
                this.subLevelMarkers[i].hide()
            }
        }       
    }
}

