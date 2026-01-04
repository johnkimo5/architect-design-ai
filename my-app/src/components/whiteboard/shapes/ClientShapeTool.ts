import { BaseBoxShapeTool } from 'tldraw'

export class ClientShapeTool extends BaseBoxShapeTool {
  static override id = 'client'
  static override initial = 'idle'
  override shapeType = 'client'
}
