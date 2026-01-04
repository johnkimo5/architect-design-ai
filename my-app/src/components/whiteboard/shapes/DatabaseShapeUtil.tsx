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

type DatabaseShape = TLBaseShape<
  'database',
  {
    w: number
    h: number
    dbType: 'postgres' | 'mysql' | 'mongodb' | 'redis'
    label: string
  }
>

const DB_STYLES: Record<string, { icon: string; color: string; border: string }> = {
  postgres: { icon: '🐘', color: '#e0f2fe', border: '#0284c7' },
  mysql: { icon: '🐬', color: '#fef3c7', border: '#f59e0b' },
  mongodb: { icon: '🍃', color: '#d1fae5', border: '#10b981' },
  redis: { icon: '🔴', color: '#fee2e2', border: '#ef4444' },
}

export class DatabaseShapeUtil extends ShapeUtil<DatabaseShape> {
  static override type = 'database' as const

  static override props: RecordProps<DatabaseShape> = {
    w: T.number,
    h: T.number,
    dbType: T.literalEnum('postgres', 'mysql', 'mongodb', 'redis'),
    label: T.string,
  }

  getDefaultProps(): DatabaseShape['props'] {
    return {
      w: 120,
      h: 100,
      dbType: 'postgres',
      label: 'Database',
    }
  }

  override canEdit() { return true }
  override canResize() { return true }
  override isAspectRatioLocked() { return false }

  getGeometry(shape: DatabaseShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: DatabaseShape, info: TLResizeInfo<DatabaseShape>) {
    return resizeBox(shape, info)
  }

  override onEditEnd = (shape: DatabaseShape) => {
    const trimmedLabel = shape.props.label.trim()
    if (trimmedLabel !== shape.props.label) {
      this.editor.updateShape({
        id: shape.id,
        type: 'database',
        props: { label: trimmedLabel || 'Database' },
      })
    }
  }

  component(shape: DatabaseShape) {
    const style = DB_STYLES[shape.props.dbType]
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
                type: 'database',
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
          {shape.props.dbType}
        </span>
      </HTMLContainer>
    )
  }

  indicator(shape: DatabaseShape) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />
  }
}
