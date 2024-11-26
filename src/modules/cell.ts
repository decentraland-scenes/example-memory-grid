import { Animator, AudioSource, ColliderLayer, Entity, GltfContainer, InputAction, Material, MeshRenderer, PointerEventType, PointerEvents, Schemas, TextAlignMode, TextShape, Transform, TransformTypeWithOptionals, VisibilityComponent, engine } from "@dcl/sdk/ecs"
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math"
import * as utils from "@dcl-sdk/utils"



export const Cell = engine.defineComponent('cell', { 
    id:Schemas.Number,
    active:Schemas.Boolean,
    marked:Schemas.Boolean,    
    x: Schemas.Number,
    z: Schemas.Number,
    isPartOfSolution:Schemas.Boolean 
})

export enum CELL_FLASH {
    RED,
    GREEN,
    FRAMED_RED,
    DEFAULT
}

export const FlashCell = engine.defineComponent('flash-cell', { 
    active:Schemas.Boolean,
    state:Schemas.EnumNumber<CELL_FLASH>(CELL_FLASH, CELL_FLASH.RED)
})


export const ClickAnimation = engine.defineComponent('click-animation',{
    active:Schemas.Boolean,
    elapsedTime:Schemas.Number,
    animTime:Schemas.Number,
    startScale:Schemas.Vector3,
    endScale:Schemas.Vector3
})


export function spawnClickAnimation(cell:Entity, isBeingMarked:boolean, sound:boolean){

    let startScale = Vector3.create(0.1, 0.1, 0.1)
    let endScale = Vector3.create(1,0.1, 1)

    let cirlce = engine.addEntity()
    Transform.create(cirlce, {
        parent: cell,
        scale: Vector3.create(0.1,0.1,0.1)        
    })
    MeshRenderer.setCylinder(cirlce)
    ClickAnimation.create(cirlce,{
        active:true,
        elapsedTime:0,
        animTime: 0.5,
        startScale:isBeingMarked?startScale:endScale,
        endScale:isBeingMarked?endScale:startScale
    })

    if(isBeingMarked){
        Material.setPbrMaterial(cirlce,{
            albedoColor: Color4.Black()
        })
        if(sound){
            AudioSource.createOrReplace(cell,{
                audioClipUrl: "sounds/pop.mp3",
                loop: false,
                playing: true
            })
        }
       
    }
    else{
        Material.setPbrMaterial(cirlce,{
            albedoColor: Color4.White()
        })
        if(sound){
            AudioSource.createOrReplace(cell,{
                audioClipUrl: "sounds/pop_back.mp3",
                loop: false,
                playing: true
            })
        }
       
    }
    

    utils.tweens.startScaling(
        cirlce,
        startScale,
        endScale,
        0.08,
        utils.InterpolationType.EASEINQUAD,
        () => {  

            if(isBeingMarked){
                GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })  
            }
            else{
                GltfContainer.createOrReplace(cell, {src:'models/cell_default.glb'  })  
            }
            engine.removeEntity(cirlce)          
        }
    )    
}


export function checkWin():boolean{
    let cellGroup = engine.getEntitiesWith(Cell,Transform, GltfContainer)
    let gameWon = true

    for (const [entity, cellInfo] of cellGroup) {
        
        // //check only the cells currently in play
         if(cellInfo.active){
        
            //cell is a part of the solution but was not flagged by the user
            if (!cellInfo.marked && cellInfo.isPartOfSolution){                
                gameWon = false                
            }

            //cell is not a mine, but was not revealed yet
            if(!cellInfo.isPartOfSolution && cellInfo.marked){
                gameWon = false              
            }

            if(cellInfo.marked && cellInfo.isPartOfSolution){
                FlashCell.createOrReplace(entity, { state: CELL_FLASH.GREEN})
            }

            if(cellInfo.isPartOfSolution){
                    FlashCell.createOrReplace(entity, { state: CELL_FLASH.GREEN})    
            }
            if(cellInfo.marked && !cellInfo.isPartOfSolution){
                    FlashCell.createOrReplace(entity, { state: CELL_FLASH.DEFAULT})    
            }
         }          
    }

    if(!gameWon){
        return false
    }
    
    return true         
}

export function setMarked(cell:Entity):boolean{
    let cellInfo = Cell.getMutable(cell)

    if(!cellInfo.marked){
        cellInfo.marked = true         
        cellInfo.isPartOfSolution = true
        GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })  
        
        return true
    }else{
        return false
    }     
}

export function hideSolutionCells(){
    let cellGroup = engine.getEntitiesWith(Cell,Transform)

    for (const [entity, cellInfo] of cellGroup) {
        
        // //check only the cells currently in play
         if(cellInfo.active){

            const cellInfoMutable = Cell.getMutable(entity)
            cellInfoMutable.marked = false              
            GltfContainer.createOrReplace(entity, {src:'models/cell_default.glb'  })   
         }
    }
}

export function addDebugCoords(parentCell:Entity, x:string, z:string){    
    
    let debugMarker = engine.addEntity()
    Transform.create(debugMarker,{
        position: Vector3.create(0,0.1,-0.45),
        rotation:Quaternion.fromEulerDegrees(90,0,0),
        parent: parentCell
    })
    TextShape.createOrReplace(debugMarker, {
        text: ("i: " + x + ", j: " + z ),
        fontSize: 2,
        textAlign:TextAlignMode.TAM_BOTTOM_CENTER,       
        textColor:Color4.Black(),
        outlineColor: Color4.Black(),
        outlineWidth: 0.1
        
    })

}

export function displaySolution(){
    let cellGroup = engine.getEntitiesWith(Cell,Transform)

    for (const [entity, cellInfo] of cellGroup) {
        // //check only the cells currently in play
        if(cellInfo.active){
            
            if(cellInfo.isPartOfSolution){
                //cellInfo.marked = true         
                GltfContainer.createOrReplace(entity, {src:'models/cell_marked.glb'  })   
            }

            if(!cellInfo.isPartOfSolution){
                GltfContainer.createOrReplace(entity, {src:'models/cell_default.glb' })
            }
           
        }        
    }
}

export function toggleFlashCells(){

    let flashingCells = engine.getEntitiesWith(Cell,Transform,GltfContainer,FlashCell)   

    for (const [entity, cellInfo] of flashingCells) {
        
        const flashInfo = FlashCell.getMutable(entity)

        if(!flashInfo.active){
            flashInfo.active = true

            switch(flashInfo.state){
                case CELL_FLASH.RED :{
                    GltfContainer.createOrReplace(entity, {src: "models/cell_red.glb"})
                    break;
                }
                case CELL_FLASH.GREEN :{
                    GltfContainer.createOrReplace(entity, {src: "models/cell_green.glb"})
                    break;
                }
                case CELL_FLASH.FRAMED_RED :{
                    GltfContainer.createOrReplace(entity, {src: "models/cell_should_be_marked.glb"})
                    break;
                }
                case CELL_FLASH.DEFAULT :{
                    GltfContainer.createOrReplace(entity, {src: "models/cell_faded.glb"})
                    break;
                }
            }
            
        }
        else{
            flashInfo.active = false
            if(cellInfo.marked){
                GltfContainer.createOrReplace(entity, {src: "models/cell_marked.glb"})
            }
            else{
                GltfContainer.createOrReplace(entity, {src: "models/cell_default.glb"})
            }
            
        }
        
    }

}


// returns true if the cell was a mine and the game is over
export function markCell(cell:Entity, sound:boolean ){   

    let cellInfo = Cell.getMutable(cell)

    if(!cellInfo.marked){
        cellInfo.marked = true         
        //GltfContainer.createOrReplace(cell, {src:'models/cell_marked.glb'  })   
        spawnClickAnimation(cell, true, sound)
        
        
    }
    else{
        cellInfo.marked = false         
       // GltfContainer.createOrReplace(cell, {src:'models/cell_default.glb' })   
        spawnClickAnimation(cell, false, sound)
    }
}

export function hideMarkedCells(){


    let cellGroup = engine.getEntitiesWith(Cell,Transform,GltfContainer)   

    for (const [entity] of cellGroup) {
        
        const cellInfo = Cell.getMutable(entity)

        if(cellInfo.marked){
            GltfContainer.createOrReplace(entity, {src: "models/cell_default.glb"})
        }
    }
}
export function showMarkedCells(){


    let cellGroup = engine.getEntitiesWith(Cell,Transform,GltfContainer)   

    for (const [entity] of cellGroup) {
        
        const cellInfo = Cell.getMutable(entity)

        if(cellInfo.marked){
            GltfContainer.createOrReplace(entity, {src: "models/cell_marked.glb"})
        }
    }
}



export function createGridCell(_id:number, transform:TransformTypeWithOptionals, idX:number, idZ:number, _parent:Entity):Entity{
    let cell = engine.addEntity()
    Transform.create(cell, transform)
    GltfContainer.createOrReplace(cell,{src: 'models/cell_default.glb'})    

    PointerEvents.create(cell, { pointerEvents: [
        {
          eventType: PointerEventType.PET_DOWN,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: true,
            hoverText: "TOGGLE",
            maxDistance: 20,
          }
        },       
        {
          eventType: PointerEventType.PET_HOVER_ENTER,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: false,           
            maxDistance: 20
          }
        },
        {
          eventType: PointerEventType.PET_HOVER_LEAVE,
          eventInfo: {
            button: InputAction.IA_POINTER,
            showFeedback: false,           
            maxDistance: 20
          }
        },

      ]})    
    
    

    Cell.createOrReplace(cell,{      
        x: idX,
        z: idZ,
        marked:false,
        active:false,
        id:_id,      
        isPartOfSolution:false      

    })
    VisibilityComponent.createOrReplace(cell, {visible:false})

    
    Transform.getMutable(cell).parent = _parent
    
    
        
    return cell 
}

 export function resetGridCell(cell:Entity, idX:number, idZ:number):Entity{

     const cellInfo = Cell.getMutable(cell)

     cellInfo.marked = false
     cellInfo.isPartOfSolution = false
     cellInfo.x= idX
     cellInfo.z= idZ  
     
   
     if(FlashCell.has(cell)){
        FlashCell.deleteFrom(cell)
     }


     GltfContainer.createOrReplace(cell,{src: 'models/cell_default.glb', invisibleMeshesCollisionMask:ColliderLayer.CL_PHYSICS | ColliderLayer.CL_POINTER})  

     Transform.getMutable(cell).position.z = -10   

    

     return cell
 }

