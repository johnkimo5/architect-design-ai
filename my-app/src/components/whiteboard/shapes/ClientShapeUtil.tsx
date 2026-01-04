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

type ClientShape = TLBaseShape<
  'client',
  {
    w: number
    h: number
    clientType: 'mobile' | 'web'
    label: string
  }
>

const CLIENT_STYLES: Record<string, { icon: string; color: string; border: string }> = {
  mobile: { icon: '📱', color: '#e0e7ff', border: '#6366f1' },
  web: { icon: '🌐', color: '#dbeafe', border: '#3b82f6' },
}

export class ClientShapeUtil extends ShapeUtil<ClientShape> {
  static override type = 'client' as const

  static override props: RecordProps<ClientShape> = {
    w: T.number,
    h: T.number,
    clientType: T.literalEnum('mobile', 'web'),
    label: T.string,
  }

  getDefaultProps(): ClientShape['props'] {
    return {
      w: 100,
      h: 100,
      clientType: 'web',
      label: 'Client',
    }
  }

  override canEdit() { return true }
  override canResize() { return true }
  override isAspectRatioLocked() { return false }

  getGeometry(shape: ClientShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: ClientShape, info: TLResizeInfo<ClientShape>) {
    return resizeBox(shape, info)
  }

  override onEditEnd = (shape: ClientShape) => {
    const trimmedLabel = shape.props.label.trim()
    if (trimmedLabel !== shape.props.label) {
      this.editor.updateShape({
        id: shape.id,
        type: 'client',
        props: { label: trimmedLabel || 'Client' },
      })
    }
  }

  component(shape: ClientShape) {
    const style = CLIENT_STYLES[shape.props.clientType]
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
          backgroundColor: style.color,
          border: `2px solid ${style.border}`,
          borderRadius: '8px',
          padding: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
      >
        <span style={{ fontSize: '28px', marginBottom: '4px' }}>{style.icon}</span>
        {isEditing ? (
          <input
            type="text"
            defaultValue={shape.props.label}
            onChange={(e) => {
              this.editor.updateShape({
                id: shape.id,
                type: 'client',
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
        <span style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
          {shape.props.clientType}
        </span>
      </HTMLContainer>
    )
  }

  indicator(shape: ClientShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
