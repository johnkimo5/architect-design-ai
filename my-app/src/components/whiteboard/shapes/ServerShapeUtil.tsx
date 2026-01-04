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

type ServerShape = TLBaseShape<
  'server',
  {
    w: number
    h: number
    label: string
  }
>

export class ServerShapeUtil extends ShapeUtil<ServerShape> {
  static override type = 'server' as const

  static override props: RecordProps<ServerShape> = {
    w: T.number,
    h: T.number,
    label: T.string,
  }

  getDefaultProps(): ServerShape['props'] {
    return {
      w: 120,
      h: 100,
      label: 'Server',
    }
  }

  override canEdit() { return true }
  override canResize() { return true }
  override isAspectRatioLocked() { return false }

  getGeometry(shape: ServerShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: ServerShape, info: TLResizeInfo<ServerShape>) {
    return resizeBox(shape, info)
  }

  override onEditEnd = (shape: ServerShape) => {
    const trimmedLabel = shape.props.label.trim()
    if (trimmedLabel !== shape.props.label) {
      this.editor.updateShape({
        id: shape.id,
        type: 'server',
        props: { label: trimmedLabel || 'Server' },
      })
    }
  }

  component(shape: ServerShape) {
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
          backgroundColor: '#f3e8ff',
          border: '2px solid #9333ea',
          borderRadius: '8px',
          padding: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
      >
        <span style={{ fontSize: '28px', marginBottom: '4px' }}>🖥️</span>
        {isEditing ? (
          <input
            type="text"
            defaultValue={shape.props.label}
            onChange={(e) => {
              this.editor.updateShape({
                id: shape.id,
                type: 'server',
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

  indicator(shape: ServerShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
