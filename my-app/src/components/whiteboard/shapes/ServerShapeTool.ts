import { BaseBoxShapeTool } from 'tldraw'

export class ServerShapeTool extends BaseBoxShapeTool {
  static override id = 'server'
  static override initial = 'idle'
  override shapeType = 'server'
}
