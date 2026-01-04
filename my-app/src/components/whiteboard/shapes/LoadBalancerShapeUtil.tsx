import {
  ShapeUtil,
  Rectangle2d,
  HTMLContainer,
  resizeBox,
  TLResizeInfo,
  RecordProps,
  T,
  TLBaseShape,
} from 'tldraw'

type LoadBalancerShape = TLBaseShape<
  'loadBalancer',
  {
    w: number
    h: number
    label: string
  }
>

export class LoadBalancerShapeUtil extends ShapeUtil<LoadBalancerShape> {
  static override type = 'loadBalancer' as const

  static override props: RecordProps<LoadBalancerShape> = {
    w: T.number,
    h: T.number,
    label: T.string,
  }

  getDefaultProps(): LoadBalancerShape['props'] {
    return {
      w: 120,
      h: 100,
      label: 'Load Balancer',
    }
  }

  override canEdit() { return true }
  override canResize() { return true }
  override isAspectRatioLocked() { return false }

  getGeometry(shape: LoadBalancerShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: LoadBalancerShape, info: TLResizeInfo<LoadBalancerShape>) {
    return resizeBox(shape, info)
  }

  override onEditEnd = (shape: LoadBalancerShape) => {
    const trimmedLabel = shape.props.label.trim()
    if (trimmedLabel !== shape.props.label) {
      this.editor.updateShape({
        id: shape.id,
        type: 'loadBalancer',
        props: { label: trimmedLabel || 'Load Balancer' },
      })
    }
  }

  component(shape: LoadBalancerShape) {
    const isEditing = this.editor.getEditingShapeId() === shape.id

    return (
      <HTMLContainer
        style={{
          width: shape.props.w,
          height: shape.props.h,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fef9c3',
          border: '2px solid #ca8a04',
          borderRadius: '8px',
          padding: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
      >
        <span style={{ fontSize: '28px', marginBottom: '4px' }}>⚖️</span>
        {isEditing ? (
          <input
            type="text"
            defaultValue={shape.props.label}
            onChange={(e) => {
              this.editor.updateShape({
                id: shape.id,
                type: 'loadBalancer',
                props: { label: e.target.value },
              })
            }}
            style={{
              width: '90%',
              textAlign: 'center',
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: 500,
              outline: 'none',
            }}
            autoFocus
          />
        ) : (
          <span style={{ fontSize: '12px', fontWeight: 500, textAlign: 'center' }}>
            {shape.props.label}
          </span>
        )}
      </HTMLContainer>
    )
  }

  indicator(shape: LoadBalancerShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
