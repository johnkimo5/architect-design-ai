import { BaseBoxShapeTool } from 'tldraw'

export class DatabaseShapeTool extends BaseBoxShapeTool {
  static override id = 'database'
  static override initial = 'idle'
  override shapeType = 'database'
}
