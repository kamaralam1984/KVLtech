"use client"

import React, { useState, useCallback } from 'react'
import { Plus, Trash2, Copy, ChevronUp, ChevronDown, Settings } from 'lucide-react'
import { renderElement } from './ElementRenderers'
import type { BuilderPage, Section, GlobalStyles, SelectionState, ElementType } from './builder-types'

interface BuilderCanvasProps {
  page: BuilderPage
  selection: SelectionState
  globalStyles: GlobalStyles
  previewMode: boolean
  deviceWidth: 'desktop' | 'tablet' | 'mobile'
  onSelect: (sel: SelectionState) => void
  onDrop: (sectionId: string, columnId: string, elementType: ElementType, index: number) => void
  onMoveSection: (fromIdx: number, toIdx: number) => void
  onDuplicateSection: (sectionId: string) => void
  onDeleteSection: (sectionId: string) => void
  onDeleteElement: (sectionId: string, columnId: string, elementId: string) => void
  onDuplicateElement: (sectionId: string, columnId: string, elementId: string) => void
}

export function BuilderCanvas({
  page,
  selection,
  globalStyles,
  previewMode,
  deviceWidth,
  onSelect,
  onDrop,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onDeleteElement,
  onDuplicateElement,
}: BuilderCanvasProps) {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null)
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)

  const handleRootClick = useCallback(() => {
    onSelect({ pageId: page.id, sectionId: null, columnId: null, elementId: null, level: null })
  }, [onSelect, page.id])

  if (page.sections.length === 0) {
    return (
      <div
        style={{ '--primary': globalStyles.primaryColor, '--secondary': globalStyles.secondaryColor } as React.CSSProperties}
        className="min-h-full bg-white"
        onClick={handleRootClick}
      >
        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-gray-200 rounded-xl m-8 text-center">
          <div className="text-5xl mb-4">🎨</div>
          <h3 className="text-xl font-bold text-gray-400 mb-2">Start building your website</h3>
          <p className="text-gray-400 text-sm">Drag elements from the left panel, or use AI to generate your website</p>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ '--primary': globalStyles.primaryColor, '--secondary': globalStyles.secondaryColor } as React.CSSProperties}
      className="min-h-full bg-white"
      onClick={handleRootClick}
    >
      {page.sections.map((sec: Section, idx: number) => {
        // Build background style
        const bgStyle: React.CSSProperties = {}
        if (sec.background.type === 'color') {
          bgStyle.backgroundColor = sec.background.value
        } else if (sec.background.type === 'gradient') {
          bgStyle.background = sec.background.value
        } else if (sec.background.type === 'image') {
          bgStyle.backgroundImage = `url(${sec.background.value})`
          bgStyle.backgroundSize = 'cover'
          bgStyle.backgroundPosition = 'center'
        }

        // Compute maxWidth value
        const maxWidthValue =
          sec.maxWidth === 'xl' ? 1280
            : sec.maxWidth === 'lg' ? 1024
            : sec.maxWidth === 'md' ? 768
            : '100%'

        return (
          <div
            key={sec.id}
            style={{
              paddingTop: sec.padding.top,
              paddingBottom: sec.padding.bottom,
              marginTop: sec.margin.top,
              marginBottom: sec.margin.bottom,
              position: 'relative',
              outline: selection.sectionId === sec.id && !previewMode ? '2px solid #C9A227' : 'none',
              ...bgStyle,
            }}
            onMouseEnter={() => !previewMode && setHoveredSectionId(sec.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOverSectionId(sec.id)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const fromIdx = e.dataTransfer.getData('sectionIndex')
              if (fromIdx !== '') {
                onMoveSection(Number(fromIdx), idx)
              }
              setDragOverSectionId(null)
            }}
            onClick={(e) => {
              e.stopPropagation()
              onSelect({ pageId: page.id, sectionId: sec.id, columnId: null, elementId: null, level: 'section' })
            }}
          >
            {/* Section toolbar */}
            {hoveredSectionId === sec.id && !previewMode && (
              <div style={{ position: 'absolute', top: 4, right: 8, zIndex: 50, display: 'flex', gap: 4, background: '#0B1437', borderRadius: 8, padding: '2px 6px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveSection(idx, idx - 1) }}
                  disabled={idx === 0}
                  style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', opacity: idx === 0 ? 0.3 : 1 }}
                  title="Move up"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onMoveSection(idx, idx + 1) }}
                  disabled={idx === page.sections.length - 1}
                  style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', opacity: idx === page.sections.length - 1 ? 0.3 : 1 }}
                  title="Move down"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicateSection(sec.id) }}
                  style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  title="Duplicate section"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect({ pageId: page.id, sectionId: sec.id, columnId: null, elementId: null, level: 'section' })
                  }}
                  style={{ color: '#C9A227', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  title="Section settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteSection(sec.id) }}
                  style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
                  title="Delete section"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}

            {/* Section name label (edit mode only) */}
            {hoveredSectionId === sec.id && !previewMode && (
              <div style={{ position: 'absolute', top: 4, left: 8, zIndex: 50, background: '#0B1437', borderRadius: 6, padding: '2px 8px', fontSize: '0.7rem', color: '#aaa', fontWeight: 500, pointerEvents: 'none' }}>
                {sec.name}
              </div>
            )}

            {/* Columns */}
            <div
              style={{
                display: 'flex',
                maxWidth: maxWidthValue,
                margin: '0 auto',
                gap: 0,
              }}
            >
              {sec.columns.map(col => (
                <div
                  key={col.id}
                  style={{
                    flex: col.width ? `0 0 ${col.width}%` : '1',
                    minHeight: 60,
                    outline: dragOverColumnId === col.id ? '2px dashed #3B82F6' : 'none',
                    padding: '4px',
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDragOverColumnId(col.id)
                  }}
                  onDragLeave={() => setDragOverColumnId(null)}
                  onDrop={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDragOverColumnId(null)

                    // Handle new element drop from palette
                    const elementType = e.dataTransfer.getData('elementType')
                    if (elementType) {
                      onDrop(sec.id, col.id, elementType as ElementType, col.elements.length)
                      return
                    }

                    // Handle element move within canvas
                    const moveData = e.dataTransfer.getData('moveElement')
                    if (moveData) {
                      try {
                        const { sectionId: fromSectionId, columnId: fromColumnId, elIdx } = JSON.parse(moveData) as {
                          sectionId: string; columnId: string; elIdx: number;
                        }
                        // Resolve the element type from source column
                        const fromSection = page.sections.find(s => s.id === fromSectionId)
                        const fromCol = fromSection?.columns.find(c => c.id === fromColumnId)
                        const movedEl = fromCol?.elements[elIdx]
                        if (movedEl) {
                          onDrop(sec.id, col.id, movedEl.type, col.elements.length)
                        }
                      } catch {
                        // ignore malformed drag data
                      }
                    }
                  }}
                >
                  {col.elements.length === 0 && !previewMode && (
                    <div style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #e5e7eb', borderRadius: 8, color: '#9ca3af', fontSize: '0.75rem' }}>
                      Drop elements here
                    </div>
                  )}

                  {col.elements.map((el, elIdx) => (
                    <div
                      key={el.id}
                      style={{
                        position: 'relative',
                        outline:
                          selection.elementId === el.id && !previewMode
                            ? '2px solid #C9A227'
                            : hoveredElementId === el.id && !previewMode
                            ? '1px dashed #C9A227'
                            : 'none',
                        outlineOffset: '2px',
                      }}
                      onMouseEnter={() => !previewMode && setHoveredElementId(el.id)}
                      onMouseLeave={() => setHoveredElementId(null)}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!previewMode) {
                          onSelect({ pageId: page.id, sectionId: sec.id, columnId: col.id, elementId: el.id, level: 'element' })
                        }
                      }}
                      draggable={!previewMode}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('moveElement', JSON.stringify({ sectionId: sec.id, columnId: col.id, elIdx }))
                      }}
                    >
                      {renderElement(el, globalStyles, previewMode)}

                      {/* Element toolbar */}
                      {hoveredElementId === el.id && !previewMode && (
                        <div style={{ position: 'absolute', top: 2, right: 2, zIndex: 50, display: 'flex', gap: 2, background: '#0B1437', borderRadius: 6, padding: '2px 4px' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDuplicateElement(sec.id, col.id, el.id) }}
                            style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}
                            title="Duplicate element"
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteElement(sec.id, col.id, el.id) }}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px' }}
                            title="Delete element"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add Section drop zone */}
      <div
        style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          // New element dropped outside any section — parent handles new section creation
          const elementType = e.dataTransfer.getData('elementType')
          if (elementType) {
            // Signal to parent by dropping with empty sectionId
            // Parent's onDrop implementation handles creating a new section when needed
          }
        }}
      >
        {!previewMode && (
          <button
            style={{
              border: '2px dashed #e5e7eb',
              borderRadius: 12,
              padding: '1rem 3rem',
              color: '#9ca3af',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.875rem',
            }}
            onClick={(e) => {
              e.stopPropagation()
              // Signal parent to add new section
              onSelect({ pageId: page.id, sectionId: '__new__', columnId: null, elementId: null, level: 'section' })
            }}
          >
            <Plus size={16} /> Add Section
          </button>
        )}
      </div>
    </div>
  )
}
