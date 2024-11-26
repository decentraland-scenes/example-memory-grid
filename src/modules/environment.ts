import { ColliderLayer, Entity, GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";
import { SCENE_CENTER } from "./globals";

export function addEnvironment(parent:Entity){
    let environment = engine.addEntity()

    Transform.create(environment, {
        //position: Vector3.create(SCENE_CENTER.x, SCENE_CENTER.y, SCENE_CENTER.z),
        parent: parent
    })

    GltfContainer.create(environment, {src: "models/game_environment.glb" })

    let workstation = engine.addEntity()
    Transform.create(workstation, {
        position: Vector3.create(0, 0, 3.2),
        rotation: Quaternion.fromEulerDegrees(0, 0, 0),
        parent:parent
    })
    GltfContainer.create(workstation, {
        src:'models/workstation.glb' , 
        visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM1 | ColliderLayer.CL_PHYSICS 
    })

    let gameAreaCollider = engine.addEntity()
    Transform.create(gameAreaCollider, {
        parent: parent,
        scale:Vector3.create(16,6,11), 
        position: Vector3.create(0, 3,-2.5)  
    })
    //MeshRenderer.setBox(gameAreaCollider)
    MeshCollider.setBox(gameAreaCollider)
}