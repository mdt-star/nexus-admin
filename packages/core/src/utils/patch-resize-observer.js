/**
 * ResizeObserver 自修复补丁
 *
 * 解决浏览器 "ResizeObserver loop completed with undelivered notifications" 错误。
 *
 * 原理：将所有 ResizeObserver 回调暂存到下一帧批量执行，
 *       避免在当前帧内形成递归观察循环。
 *
 * 在应用入口最顶部导入即可生效：
 *   import '@nexus-admin/core/src/utils/patch-resize-observer'
 */
(function patchResizeObserver() {
  if (typeof window === 'undefined' || window.__nexus_ROPatched) return
  window.__nexus_ROPatched = true
  const OrigRO = window.ResizeObserver
  if (!OrigRO) return

  let rafId = null

  function flushAll() {
    rafId = null
    const entries = []

    if (typeof window.__nexus_ROPendingList !== 'undefined') {
      const list = window.__nexus_ROPendingList
      window.__nexus_ROPendingList = []
      entries.push(...list)
    }
    for (const { ro, target } of entries) {
      try {
        ro.callback([{ target, contentRect: target.getBoundingClientRect() }], ro.observer)
      } catch (e) {
        // 静默吞异常
      }
    }
  }

  function scheduleFlush() {
    if (!rafId) {
      rafId = requestAnimationFrame(flushAll)
    }
  }

  function PatchedResizeObserver(callback) {
    const ro = new OrigRO((entries, observer) => {
      if (!window.__nexus_ROPendingList) {
        window.__nexus_ROPendingList = []
      }
      for (const entry of entries) {
        window.__nexus_ROPendingList.push({ ro: { callback, observer }, target: entry.target })
      }
      scheduleFlush()
    })
    return ro
  }
  PatchedResizeObserver.prototype = OrigRO.prototype
  window.ResizeObserver = PatchedResizeObserver
})()