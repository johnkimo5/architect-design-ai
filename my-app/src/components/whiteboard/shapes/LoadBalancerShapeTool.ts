import { BaseBoxShapeTool } from 'tldraw'

export class LoadBalancerShapeTool extends BaseBoxShapeTool {
  static override id = 'loadBalancer'
  static override initial = 'idle'
  override shapeType = 'loadBalancer'
}
