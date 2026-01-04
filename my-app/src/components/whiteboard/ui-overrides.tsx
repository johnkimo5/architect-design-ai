'use client'

import { TLComponents, TLUiOverrides, useTools, useEditor, TldrawUiMenuItem } from 'tldraw'

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools.database = {
      id: 'database',
      icon: 'geo-rectangle',
      label: 'Database',
      kbd: 'd',
      onSelect: () => editor.setCurrentTool('database'),
    }
    tools.server = {
      id: 'server',
      icon: 'geo-rectangle',
      label: 'Server',
      kbd: 'v',
      onSelect: () => editor.setCurrentTool('server'),
    }
    tools.loadBalancer = {
      id: 'loadBalancer',
      icon: 'geo-rectangle',
      label: 'Load Balancer',
      kbd: 'l',
      onSelect: () => editor.setCurrentTool('loadBalancer'),
    }
    tools.client = {
      id: 'client',
      icon: 'geo-rectangle',
      label: 'Client',
      kbd: 'i',
      onSelect: () => editor.setCurrentTool('client'),
    }
    tools.cache = {
      id: 'cache',
      icon: 'geo-rectangle',
      label: 'Cache',
      kbd: 'h',
      onSelect: () => editor.setCurrentTool('cache'),
    }
    return tools
  },
}

// Custom toolbar component with system design shapes
function CustomToolbar() {
  const tools = useTools()
  const editor = useEditor()
  const currentToolId = editor.getCurrentToolId()

  const systemDesignTools = [
    { id: 'database', label: '🐘 Database', kbd: 'D' },
    { id: 'server', label: '🖥️ Server', kbd: 'V' },
    { id: 'loadBalancer', label: '⚖️ Load Balancer', kbd: 'L' },
    { id: 'client', label: '🌐 Client', kbd: 'I' },
    { id: 'cache', label: '⚡ Cache', kbd: 'H' },
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: 60,
        left: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        background: 'white',
        padding: 8,
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 100,
      }}
    >
      <div style={{ fontSize: 10, color: '#666', marginBottom: 4, fontWeight: 600 }}>
        SYSTEM DESIGN
      </div>
      {systemDesignTools.map((tool) => {
        const isActive = currentToolId === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => {
              const t = tools[tool.id]
              if (t) t.onSelect('toolbar')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              border: isActive ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: 6,
              background: isActive ? '#eff6ff' : 'white',
              cursor: 'pointer',
              fontSize: 12,
              minWidth: 130,
              textAlign: 'left',
            }}
          >
            <span>{tool.label}</span>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 10 }}>
              {tool.kbd}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export const components: TLComponents = {
  InFrontOfTheCanvas: CustomToolbar,
}
