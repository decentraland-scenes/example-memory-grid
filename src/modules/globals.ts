import { engine, Transform } from "@dcl/sdk/ecs";
import { Color3, Color4, Quaternion, Vector3 } from "@dcl/sdk/math";

export const SCENE_CENTER = Vector3.create(8,0,8) 
export const SCENE_ROTATION_Y = 180

export let sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, { 
    position:Vector3.create(8,0,8),
    rotation: Quaternion.fromEulerDegrees(0, SCENE_ROTATION_Y,0)

})

//SFX ATTACH TO OBJECT
export let winSound = 'sounds/win.mp3'
export let loseSound = 'sounds/lose.mp3'





// default
export let material ={
    albedoColor: Color4.Yellow(),
    emissiveColor: Color3.Yellow(),
    emissiveIntensity: 2,
    transparencyMode: 2,
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}



//Black - non infected level 0
export let matBlack ={
    albedoColor: Color4.Black(),           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}      

//Green - barely infected level 1
export let matGreen ={
    albedoColor: Color4.Green(),   
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//yellow - level 2 infection
export let matYellow ={
    albedoColor: Color4.fromHexString("#FF9900FF"),
    emissiveColor:  Color3.fromHexString("#FF9900"),
    emissiveIntensity: 1,           
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}        

//Red - level 3 infection
export let matRed ={
    albedoColor: Color4.Red(),
    emissiveColor: Color3.Red(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}


//White - BLOCKED
export let matWhite ={
    albedoColor: Color4.Gray(),
    emissiveColor: Color3.Gray(),
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}       



export let mapMat = {
    albedoColor: Color4.Black(),            
    emissiveIntensity: 1,            
    roughness: 1,
    metallic: 0,
    specularIntensity: 0,
}    
