
import { Entity, GltfContainer, InputAction, PointerEventType, PointerEvents, PointerEventsResult, Schemas, Transform,TransformTypeWithOptionals,VisibilityComponent,engine, inputSystem } from '@dcl/sdk/ecs'

import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { loseSound, winSound } from './globals'
import * as utils from "@dcl-sdk/utils"
import { Cell, checkWin, createGridCell,  resetGridCell, markCell, setMarked, ClickAnimation, hideMarkedCells} from './cell'
import { SoundBox } from './soundbox'
import { syncEntity } from '@dcl/sdk/network'
import { AvatarAnimHandler } from './avatarAnimation'
import { triggerSceneEmote } from '~system/RestrictedActions'
import { Game } from '../game'
import { GameStateData, GRID_STATE } from './gameState'
import { LevelData } from './levelData'
import { gameStateEntity } from '../game'
import * as ui from "../ui"

export class GridMap {
    root:Entity
    //cellHover:Entity
    // center:Vector3
    gridLnX:number
    gridLnZ:number
    maxCellCount:number = 6
    markedCells:number = 5  
    sideLengthX:number
    sideLengthZ:number
    stepX:number 
    stepZ:number 
    areCellsSetUp:boolean = false    
    soundBox:SoundBox
    private levelWon:boolean = false
    clickCount:number = 0
    winAnimHandler: ui.WinAnimationHandler
    avatarAnimator:AvatarAnimHandler
    game:Game
    levelData:LevelData

    constructor(transform:TransformTypeWithOptionals, _sideLengthX:number, _sideLengthZ:number, levelData:LevelData, _rotation:Quaternion, game:Game){         

        this.game = game
        
        this.root = engine.addEntity()
        Transform.create(this.root,transform)         

       
       this.levelData = levelData        
     
        this.sideLengthX = _sideLengthX *0.95
        this.sideLengthZ = _sideLengthZ *0.95
        this.gridLnX = this.levelData.linesX
        this.gridLnZ = this.levelData.linesZ
        this.stepX = this.sideLengthX/this.gridLnX
        this.stepZ = this.sideLengthZ/this.gridLnZ
        
        this.winAnimHandler = new ui.WinAnimationHandler(Vector3.create(8,3.8,-7))

        let dummyAnimText = engine.addEntity()
        Transform.create(dummyAnimText, {
            position: Vector3.create( 8,-5,8)
        })
        GltfContainer.create(dummyAnimText, {
            src: "mini-game-assets/models/winAnimText.glb"
        })
        this.avatarAnimator = new AvatarAnimHandler()            

        this.soundBox = new SoundBox()

        // INPUTS SYSTEM
        engine.addSystem(() => {
            
            const clickedCells = engine.getEntitiesWith(PointerEvents, Cell)           


            for (const [entity] of clickedCells) {               

                // MARK
                if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN, entity)) {                       
                   
                    const gameStateData = GameStateData.getMutable(gameStateEntity)

                    if(gameStateData.state == GRID_STATE.INTERACTIVE){                                         
                        markCell(entity, gameStateData.sfxOn) 
                    }                                       
                }

                // HOVER
                if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_HOVER_ENTER, entity)) {        
                   
                 
                }
                

            }            
        })

        // this.cellHover = engine.addEntity()
        // Transform.createOrReplace(this.cellHover,{
        //     rotation:Quaternion.fromEulerDegrees(0,0,0)
        // })
        // GltfContainer.create(this.cellHover, { src: "models/cell_hover.glb"})
        // VisibilityComponent.create(this.cellHover)
        this.initEntityPool()        

    }

    // moveHoverTo(cell:Entity){
    //     Transform.getMutable(this.cellHover).parent = cell
    // }
    // showHover(){        
    //    // VisibilityComponent.getMutable(this.cellHover).visible = true
    // }

    // hideHover(){
    //     Transform.getMutable(this.cellHover).parent = engine.RootEntity
    //     VisibilityComponent.getMutable(this.cellHover).visible = false
    // }    
    
    getCell(x:number, z:number):Entity{
       return  GameStateData.get(gameStateEntity).cells[x][z]
    }   

    placeMarkedCells(_count:number){
        let markedCellCounter = 0

        while(markedCellCounter < _count){
            let randX = Math.floor(Math.random()* this.gridLnX)
            let randZ = Math.floor(Math.random()* this.gridLnZ)           
               if(setMarked(this.getCell(randX, randZ))){
                markedCellCounter++
               }             
             
        }
    }
    
    initEntityPool(){
        
        const lowerCornerX = -this.sideLengthX/2
        const lowerCornerZ = -this.sideLengthZ/2

        let scaleX = this.sideLengthX/this.gridLnX *0.98
        let scaleZ = this.sideLengthZ/this.gridLnZ *0.98

        for(let i=0; i< this.maxCellCount; i++){
            let newLine:Entity[] = []
            for(let j=0; j< this.maxCellCount; j++){

                let cell = createGridCell(
                    i*this.maxCellCount +j,
                    {
                        position: Vector3.create( lowerCornerX + this.stepX/2 + i*this.stepX, -10, lowerCornerZ + this.stepZ/2 + j*this.stepZ -20),
                        scale: Vector3.create(scaleX, scaleZ, scaleX ),     
                        rotation:Quaternion.fromEulerDegrees(0,0,0)           
                    },                
                    i,
                    j,
                    this.root,                

            ) 
            newLine.push(cell)    
            }
            const gameStateData = GameStateData.getMutable(gameStateEntity)
            gameStateData.cells.push(newLine)           
            
        }
    }
    
    initGrid(){
        const lowerCornerX = -this.sideLengthX/2
        let lowerCornerZ = -this.sideLengthZ/2

        

        let scaleX = this.sideLengthX/this.gridLnX *0.98
        let scaleZ = this.sideLengthZ/this.gridLnZ *0.98

        this.stepX = this.sideLengthX/this.gridLnX
        this.stepZ = this.sideLengthX/this.gridLnX

        //rectangle level moves up a bit
        if(this.gridLnX != this.gridLnZ){
            lowerCornerZ +=  this.stepZ/2
        }

        const gameStateData = GameStateData.getMutable(gameStateEntity)
        //gameStateData.cells

        for(let i=0; i< this.gridLnX; i++){
            for(let j=0; j< this.gridLnZ; j++){
              
                let cell = gameStateData.cells[i][j]
                const cellTransform = Transform.getMutable(cell)
              
                let cellData = Cell.getMutable(cell)
                VisibilityComponent.getMutable(cell).visible = true
                cellData.active = true
             
                cellTransform.position =  Vector3.create( lowerCornerX + this.stepX/2 + i*this.stepX, 0.1, lowerCornerZ + this.stepZ/2 + j*this.stepZ)
                cellTransform.scale =  Vector3.create(scaleX, scaleZ, scaleX)  

            }            
        }

        this.placeMarkedCells(this.markedCells)     
        hideMarkedCells()    

    } 
    isLevelComplete():boolean{
        return this.levelWon
    }

    winGame(soundOn:boolean){
        console.log("GAME WON")
        
        if(soundOn){
            this.soundBox.playSound(winSound)  
        }
        this.winAnimHandler.playWinAnimation()
        triggerSceneEmote({ src: 'assets/scene/Pose_Win.glb', loop: false })
        this.levelWon = true 

        utils.timers.setTimeout(()=>{           
            this.winAnimHandler.hide()             
        }, 3000)
    }

    loseGame(soundOn:boolean){
        console.log("GAME LOST") 
        if(soundOn){
            this.soundBox.playSound(loseSound)  
        }
             
    }

    resetGrid(){
        //RESTART CURRENT LEVEL       
        this.setLevel(this.levelData)     
    }


    deactivateAllCells(){
        const gameStateData = GameStateData.getMutable(gameStateEntity)

        for(let i=0; i < gameStateData.cells.length; i++){
            for(let j=0; j < gameStateData.cells[i].length; j++){

               Cell.getMutable(gameStateData.cells[i][j]).active = false
               VisibilityComponent.getMutable(gameStateData.cells[i][j]).visible = false
               resetGridCell(gameStateData.cells[i][j], i, j)
            }
        }
    }


    setLevel(_levelData:LevelData){

        const gameStateData = GameStateData.getMutable(gameStateEntity)

        this.levelWon = false
        this.areCellsSetUp = false       
            
        this.gridLnX =  _levelData.linesX
        this.gridLnZ = _levelData.linesZ
        this.stepX = this.sideLengthX/this.gridLnX
        this.stepZ = this.sideLengthZ/this.gridLnZ
        this.markedCells = _levelData.markedCells
       
        this.deactivateAllCells()
        this.initGrid()

        gameStateData.state = GRID_STATE.SHOW_CHALLENGE
        gameStateData.roundTime = _levelData.roundTime
        gameStateData.showChallengeTime = _levelData.showChallengeTime
        gameStateData.displaySolutionTime = _levelData.displaySolutionTime
        gameStateData.elapsedTime = 0
    }   
}