import { DatabaseShapeUtil } from './DatabaseShapeUtil'
import { ServerShapeUtil } from './ServerShapeUtil'
import { LoadBalancerShapeUtil } from './LoadBalancerShapeUtil'
import { ClientShapeUtil } from './ClientShapeUtil'
import { CacheShapeUtil } from './CacheShapeUtil'

import { DatabaseShapeTool } from './DatabaseShapeTool'
import { ServerShapeTool } from './ServerShapeTool'
import { LoadBalancerShapeTool } from './LoadBalancerShapeTool'
import { ClientShapeTool } from './ClientShapeTool'
import { CacheShapeTool } from './CacheShapeTool'

export const customShapeUtils = [
  DatabaseShapeUtil,
  ServerShapeUtil,
  LoadBalancerShapeUtil,
  ClientShapeUtil,
  CacheShapeUtil,
]

export const customTools = [
  DatabaseShapeTool,
  ServerShapeTool,
  LoadBalancerShapeTool,
  ClientShapeTool,
  CacheShapeTool,
]
