import { TLBaseShape } from 'tldraw'

// Database shape with type variants
export type DatabaseShape = TLBaseShape<
  'database',
  {
    w: number
    h: number
    dbType: 'postgres' | 'mysql' | 'mongodb' | 'redis'
    label: string
  }
>

// Server shape
export type ServerShape = TLBaseShape<
  'server',
  {
    w: number
    h: number
    label: string
  }
>

// Load Balancer shape
export type LoadBalancerShape = TLBaseShape<
  'loadBalancer',
  {
    w: number
    h: number
    label: string
  }
>

// Client shape with type variants
export type ClientShape = TLBaseShape<
  'client',
  {
    w: number
    h: number
    clientType: 'mobile' | 'web'
    label: string
  }
>

// Cache shape
export type CacheShape = TLBaseShape<
  'cache',
  {
    w: number
    h: number
    label: string
  }
>
