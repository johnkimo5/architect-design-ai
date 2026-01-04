import { BaseBoxShapeTool } from 'tldraw'

export class CacheShapeTool extends BaseBoxShapeTool {
  static override id = 'cache'
  static override initial = 'idle'
  override shapeType = 'cache'
}
