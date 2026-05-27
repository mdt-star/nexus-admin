/**
 * 窗口拖拽组合式函数
 * 使用像素单位定位，避免百分比与像素混合导致的漂移问题
 */
import { reactive, onUnmounted } from 'vue'

/**
 * 窗口拖拽状态
 */
const dragState = reactive({
  isDragging: false,
  windowId: null,
  startX: 0,
  startY: 0,
  offsetLeft: 0,
  offsetTop: 0
})

/**
 * 窗口位置存储（windowId -> { left, top }，单位 px）
 * 初始值在 getWindowRect 中按 index 递增偏移
 */
const windowPositions = reactive({})

/**
 * 获取窗口默认矩形（像素）
 * 相对于视口居中，多个窗口依次偏移避免完全重叠
 */
function getDefaultRect(index, winWidth, winHeight) {
  const vw = window.innerWidth
  const vh = window.innerHeight

  // 窗口尺寸取传入的固定宽高比
  const w = Math.min(winWidth || Math.round(vw * 0.7), vw - 40)
  const h = Math.min(winHeight || Math.round(vh * 0.8), vh - 80)

  // 居中 + 按 index 偏移
  const left = Math.round((vw - w) / 2) + index * 30
  const top = Math.round((vh - h) / 2 * 0.3) + index * 30

  return { left, top, width: w, height: h }
}

/**
 * 使用窗口拖拽
 */
export function useWindowDrag() {
  /**
   * 获取窗口位置（像素）
   */
  function getWindowRect(windowId, index) {
    if (!windowPositions[windowId]) {
      windowPositions[windowId] = getDefaultRect(index)
    }
    return windowPositions[windowId]
  }

  /**
   * 开始拖拽
   */
  function startDrag(event, windowId) {
    event.preventDefault()

    const rect = windowPositions[windowId]
    if (!rect) return

    dragState.isDragging = true
    dragState.windowId = windowId
    dragState.startX = event.clientX
    dragState.startY = event.clientY
    dragState.offsetLeft = rect.left
    dragState.offsetTop = rect.top

    document.addEventListener('mousemove', onDrag)
    document.addEventListener('mouseup', endDrag)

    document.body.classList.add('nexus-dragging')
  }

  /**
   * 拖拽中
   */
  function onDrag(event) {
    if (!dragState.isDragging) return

    const dx = event.clientX - dragState.startX
    const dy = event.clientY - dragState.startY

    const rect = windowPositions[dragState.windowId]
    if (!rect) return

    rect.left = Math.max(0, dragState.offsetLeft + dx)
    rect.top = Math.max(0, dragState.offsetTop + dy)
  }

  /**
   * 结束拖拽
   */
  function endDrag() {
    dragState.isDragging = false
    dragState.windowId = null

    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', endDrag)
    document.body.classList.remove('nexus-dragging')
  }

  onUnmounted(() => {
    if (dragState.isDragging) {
      endDrag()
    }
  })

  return {
    dragState,
    getWindowRect,
    startDrag
  }
}