import { engine, Entity, Material, MeshRenderer, TextureFilterMode, Transform, TransformTypeWithOptionals } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

import { MenuButton } from './button'


export class InstructionsBoard {
  textures: string[]
  boardRoot: Entity
  board: Entity
  buttonLeft?: MenuButton
  buttonRight?: MenuButton
  height: number = 3.65
  width: number = 6.3

  constructor(transform: TransformTypeWithOptionals, width: number, height: number, texturePath: string) {
   
    this.width = width
    this.height = height
    this.boardRoot = engine.addEntity()
    Transform.create(this.boardRoot, transform)

    this.textures = []
    // TODO: this instructions should be passed as an argument.
    // or keep this name and each scene MUST create that file with the following name.
    this.textures.push(texturePath)

    this.board = engine.addEntity()
    Transform.create(this.board, {
      position: Vector3.create(this.width / 2, -this.height / 2, 0),
      scale: Vector3.create(this.width, this.height, 1),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      parent: this.boardRoot
    })

    const uvClipHeight = 0.1
    MeshRenderer.setPlane(this.board, [
      0,
      uvClipHeight,
      0,
      1,
      1,
      1,
      1,
      uvClipHeight,

      0,
      uvClipHeight,
      0,
      1,
      1,
      1,
      1,
      uvClipHeight
    ])
    Material.setPbrMaterial(this.board, {
      texture: Material.Texture.Common({ src: this.textures[0], filterMode: TextureFilterMode.TFM_BILINEAR }),
      metallic: 0,
      specularIntensity: 0,
      roughness: 1
    })
  }
}
