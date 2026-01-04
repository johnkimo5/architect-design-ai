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

type CacheShape = TLBaseShape<
  'cache',
  {
    w: number
    h: number
    label: string
  }
>

export class CacheShapeUtil extends ShapeUtil<CacheShape> {
  static override type = 'cache' as const

  static override props: RecordProps<CacheShape> = {
    w: T.number,
    h: T.number,
    label: T.string,
  }

  getDefaultProps(): CacheShape['props'] {
    return {
      w: 120,
      h: 100,
      label: 'Cache',
    }
  }

  override canEdit() { return true }
  override canResize() { return true }
  override isAspectRatioLocked() { return false }

  getGeometry(shape: CacheShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: CacheShape, info: TLResizeInfo<CacheShape>) {
    return resizeBox(shape, info)
  }

  override onEditEnd = (shape: CacheShape) => {
    const trimmedLabel = shape.props.label.trim()
    if (trimmedLabel !== shape.props.label) {
      this.editor.updateShape({
        id: shape.id,
        type: 'cache',
        props: { label: trimmedLabel || 'Cache' },
      })
    }
  }

  component(shape: CacheShape) {
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
          backgroundColor: '#fce7f3',
          border: '2px solid #ec4899',
          borderRadius: '8px',
          padding: '8px',
          boxSizing: 'border-box',
          pointerEvents: 'all',
        }}
      >
        <span style={{ fontSize: '28px', marginBottom: '4px' }}>⚡</span>
        {isEditing ? (
          <input
            type="text"
            defaultValue={shape.props.label}
            onChange={(e) => {
              this.editor.updateShape({
                id: shape.id,
                type: 'cache',
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

  indicator(shape: CacheShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
