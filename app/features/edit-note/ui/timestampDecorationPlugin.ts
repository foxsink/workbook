import { $prose } from '@milkdown/kit/utils'
import { Plugin, PluginKey } from '@milkdown/kit/prose/state'
import { Decoration, DecorationSet } from '@milkdown/kit/prose/view'
import type { Node as ProseMirrorNode } from '@milkdown/kit/prose/model'

/**
 * Regex matching @[MM:SS] or @[HH:MM:SS] timestamp markers in markdown text.
 * These are rendered as styled clickable chips via ProseMirror decorations.
 */
const TIMESTAMP_REGEX = /@\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g

const timestampPluginKey = new PluginKey('timestamp-decoration')

function parseTimeToSeconds(timeStr: string): number | null {
  const parts = timeStr.split(':').map(Number)
  if (parts.some(isNaN)) return null

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return null
}

function buildDecorations(doc: ProseMirrorNode): DecorationSet {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return

    TIMESTAMP_REGEX.lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = TIMESTAMP_REGEX.exec(node.text)) !== null) {
      const start = pos + match.index
      const end = start + match[0].length
      const timeStr = match[1]
      const seconds = parseTimeToSeconds(timeStr)

      if (seconds !== null) {
        decorations.push(
          Decoration.inline(start, end, {
            class: 'timestamp-chip',
            'data-timestamp': String(seconds),
            nodeName: 'span',
          }),
        )
      }
    }
  })

  return DecorationSet.create(doc, decorations)
}

/**
 * Milkdown plugin that decorates @[MM:SS] patterns as clickable timestamp chips.
 * Uses ProseMirror decorations (no custom nodes) for simplicity.
 */
export const timestampDecorationPlugin = $prose(() => {
  return new Plugin({
    key: timestampPluginKey,
    state: {
      init(_, state) {
        return buildDecorations(state.doc)
      },
      apply(tr, old) {
        if (tr.docChanged) {
          return buildDecorations(tr.doc)
        }
        return old
      },
    },
    props: {
      decorations(state) {
        return timestampPluginKey.getState(state)
      },
    },
  })
})
