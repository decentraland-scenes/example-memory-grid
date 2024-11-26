import { AudioSource, Entity, Transform, engine } from "@dcl/sdk/ecs"
import { Vector3 } from "@dcl/sdk/math"
import { SCENE_CENTER } from "./globals"

export class SoundBox {
    soundBox:Entity

    constructor(){
        this.soundBox = engine.addEntity()
        Transform.create(this.soundBox, {
            position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y + 2, SCENE_CENTER.z)
        })
       // MeshRenderer.setBox(this.soundBox)

    }

    playSound(soundUrl:string){
        AudioSource.createOrReplace(this.soundBox,{
            audioClipUrl: soundUrl,
            loop: false,
            playing: true
        })
    }
}