import { engine, Entity, InputAction, MeshCollider, MeshRenderer, pointerEventsSystem, Transform } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo, triggerEmote, triggerSceneEmote } from '~system/RestrictedActions'



export class AvatarAnimHandler {

    //emoter:Entity

    constructor(){
    // this.emoter = engine.addEntity()
    //     Transform.create(this.emoter, { position: Vector3.create(8, 0, 8) })
    //     MeshRenderer.setBox(this.emoter)
    //     MeshCollider.setBox(this.emoter)
    //     pointerEventsSystem.onPointerDown(
    //     {
    //         entity: this.emoter,
    //         opts: { button: InputAction.IA_POINTER, hoverText: 'Dance' },
    //     },
    //     () => {
                    
    //     }
    //     )
     }

    placeFlag(){
        triggerSceneEmote({ src: 'models/Avatar_PlaceFlag.glb', loop: false })
        // movePlayerTo({
        //     newRelativePosition: playerPos,
        //     cameraTarget: cellPos,
        //   })    
    }
    removeFlag(){
        triggerSceneEmote({ src: 'models/Avatar_RemoveFlag.glb', loop: false })
        // movePlayerTo({
        //     newRelativePosition: playerPos,
        //     cameraTarget: cellPos,
        //   })    
    }
    celebrateWin(){
        triggerSceneEmote({ src: 'models/Pose_Win.glb', loop: false })
        // movePlayerTo({
        //     newRelativePosition: playerPos,
        //     cameraTarget: cellPos,
        //   })    
    }

}