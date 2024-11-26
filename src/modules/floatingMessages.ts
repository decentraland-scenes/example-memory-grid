import { engine, Entity, Material, MaterialTransparencyMode, Schemas, TextShape, Transform } from "@dcl/sdk/ecs";
import { Color4, Quaternion, Vector3 } from "@dcl/sdk/math";


export const FloatingUp = engine.defineComponent('floating-up', { 
    
    active:Schemas.Boolean,    
    transparency:Schemas.Number,
    color:Schemas.Color4,
    elapsedTime:Schemas.Number,
    duration:Schemas.Number
    
})
export function spawnFloatingMessage(msg:string, pos:Vector3, size:number, parent:Entity, color?:Color4){

    let message = engine.addEntity()
    Transform.create(message, {
        position: pos,
        scale: Vector3.create(size, size, size),
        rotation:Quaternion.fromEulerDegrees(0,0,0),
        parent: parent
    })
    TextShape.create(message, {
        text: msg,
        textColor: color?color:Color4.White(),
        outlineColor: color?color:Color4.White(),
        outlineWidth: 0.3,        
    })
    FloatingUp.create(message,{
        active: true,
        duration: 2,
        color: color?color:Color4.White(),
        elapsedTime: 0,
        transparency:0
    })

}

export function floatingMessageSystem(dt:number){

    //SPLAT DECALS ON WALL
    const floatGroup = engine.getEntitiesWith(FloatingUp, Transform) 

    for (const [floatMessage] of floatGroup){

        const floatInfo = FloatingUp.getMutable(floatMessage)

        if(floatInfo.active){
            const transform = Transform.getMutable(floatMessage)        

            floatInfo.elapsedTime +=dt           
            
            //transform.position.y += 0.2*dt
           // transform.scale.x += 0.05*dt
            //transform.scale.y += 0.05*dt            
            floatInfo.transparency += 0.5*dt

            let textShape = TextShape.getMutable(floatMessage)

            textShape.textColor = Color4.create( floatInfo.color.r, floatInfo.color.g, floatInfo.color.b, 1-floatInfo.transparency )
            
            if(floatInfo.elapsedTime > floatInfo.duration){
                engine.removeEntity(floatMessage)
            }
        }
            

            
    }
}