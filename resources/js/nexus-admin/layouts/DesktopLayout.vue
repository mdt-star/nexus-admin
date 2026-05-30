<template><div class="nexus-desktop-layout">
<div class="nexus-desktop-bg" :style="bgStyle" />
<div class="nexus-desktop-body">
<main class="nexus-desktop" @dragover.prevent="onDragOver" @drop.prevent="onDrop">
<!-- 加载遮罩（进度条样式） -->
<div v-if="ds.loading" class="nexus-loading-overlay">
<div class="nexus-loading-bar"><div class="nexus-loading-bar-inner" /></div>
<div class="nexus-loading-text">加载桌面...</div>
</div>
<div class="nexus-desktop-icons" ref="iconsRef" @contextmenu.prevent="onDesktopContext">
<template v-for="item in ds.rootItems" :key="item.id"><div class="nexus-desktop-icon" :class="{'nexus-drop-folder': dragOverFolder===item.id}" :style="iconStyle(item)" :data-item-id="item.id" @mousedown="onIconMouseDown($event,item)" @dblclick="handleItemClick(item)" @contextmenu.prevent.stop="openContextMenu($event,item)">
<div class="nexus-desktop-icon-img"><el-icon :size="28"><component :is="item.type==='folder'?'FolderOpened':getIconComponent(item.icon)" /></el-icon></div><span class="nexus-desktop-icon-label">{{ item.title }}</span></div></template>
<div v-if="!ds.loading && !ds.rootItems.length" class="nexus-desktop-empty" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><el-empty :description="t('startMenu.dragHint')" :image-size="80" /></div></div>
<div class="nexus-desktop-windows"><DesktopWindow v-for="(win,idx) in ws.items" :key="win.id" :win="win" :is-active="win.id===ws.activeId" :rect="getWindowRect(win.id,idx)" :z-index="win.id===ws.activeId?100:10+idx" @activate="onActivateWindow" /></div>
<FolderView v-if="currentFolder" :folder="currentFolder" @open="(c)=>ws.open(c)" @close="currentFolder=null" @drag-start="onFolderDragStart" />



<!-- 首页侧滑面板（从右划出） -->
<Teleport to="body"><div v-if="homeVisible" class="nexus-home-overlay" @click.self="homeVisible=false">
<div class="nexus-home-panel" :class="{ 'nexus-home-panel-in': homeVisible }" @click.stop>
<div class="nexus-home-panel-header"><span>欢迎页</span><el-button :icon="Close" circle size="small" text @click="homeVisible=false" /></div>
<div class="nexus-home-panel-body"><component :is="homePage" /></div>
</div></div></Teleport>
</main>
<TaskBar @open-page="onMenuOpen" @open-search="searchVisible=true" @open-preferences="onOpenPreferences" @open-home="homeVisible=true" />
</div>
<PreferencesPanel ref="preferencesRef" />
<div style="display:none"><GlobalSearch :visible="searchVisible" @update:visible="searchVisible=$event" /></div>
<ItemEditor :visible="editorVisible" :item="editingItem" :is-new="isNewItem" :position="editorPos" @close="editorVisible=false" @save="onEditorSave" />
<Teleport to="body"><div v-if="ctxVisible" class="nexus-ctx" :style="ctxStyle" @click="ctxVisible=false">
<div v-if="ctxItem" class="nexus-ctx-item" @click.stop="editItem(ctxItem)"><el-icon><Edit /></el-icon>编辑</div>
<div v-if="ctxItem" class="nexus-ctx-item" @click.stop="deleteItem(ctxItem)"><el-icon><Delete /></el-icon>删除</div>
<div v-if="ctxItem" class="nexus-ctx-divider" />
<div class="nexus-ctx-item" @click.stop="addFolder"><el-icon><FolderAdd /></el-icon>新建文件夹</div>
<div class="nexus-ctx-divider" />
<div class="nexus-ctx-item" @click.stop="arrangeIcons"><el-icon><Grid /></el-icon>排列图标</div>
<div class="nexus-ctx-item" @click.stop="toggleSnap"><el-icon><Select /></el-icon>{{ snapToGrid?'取消紧贴网格':'紧贴网格' }}</div>
</div></Teleport></div></template>
<script setup>
import { computed, ref, onMounted } from 'vue'
import { useDisktopStore } from '../stores/disktop'
import { useWindowStore } from '../stores/windows'
import { useI18nStore } from '../stores/i18n'
import { useConfigStore } from '../stores/config'
import * as I from '@element-plus/icons-vue'
import {Edit,Delete,FolderAdd,Close,Loading,Top,Bottom,Grid,Select} from '@element-plus/icons-vue'
import DesktopWindow from '../components/desktop/DesktopWindow.vue'
import TaskBar from '../components/desktop/TaskBar.vue'
import FolderView from '../components/desktop/FolderView.vue'
import ItemEditor from '../components/desktop/ItemEditor.vue'
import PreferencesPanel from '../components/PreferencesPanel.vue'
import GlobalSearch from '../components/common/GlobalSearch.vue'
const ds=useDisktopStore(),ws=useWindowStore(),i18n=useI18nStore(),cfg=useConfigStore(),{t}=i18n
const activeWindow=computed(()=>ws.items.find(w=>w.id===ws.activeId)||null)
const bgStyle=computed(()=>{const m=cfg.get('backgroundMode','color');if(m==='image'){const img=cfg.get('backgroundImage',null),f=cfg.get('backgroundFit','fill'),fm={fill:'fill',contain:'contain',cover:'cover',center:'center'};if(img)return{backgroundImage:`url(${img})`,backgroundSize:fm[f]||'fill',backgroundRepeat:'no-repeat',backgroundPosition:'center'}}return{background:'linear-gradient(135deg, var(--nexus-primary-color), var(--nexus-primary-color-dark))'}})
const currentFolder=ref(null),preferencesRef=ref(null),searchVisible=ref(false),editorVisible=ref(false),editingItem=ref(null),isNewItem=ref(false),editorPos=ref({x:200,y:100}),ctxVisible=ref(false),ctxItem=ref(null),ctxStyle=ref({}),homeVisible=ref(false),dragOverId=ref(null)
const wp={};function getWindowRect(id,idx){if(!wp[id]){const vw=window.innerWidth,vh=window.innerHeight,w=Math.min(Math.round(vw*.7),vw-40),h=Math.min(Math.round(vh*.8),vh-80);wp[id]={left:Math.round((vw-w)/2)+idx*30,top:Math.round((vh-h)/2*.3)+idx*30,width:w,height:h}}return wp[id]}
onMounted(async()=>{if(!ds.loaded)await ds.loadDisktops();if(ds.activeDisktopId)await ds.loadItems();document.addEventListener('click',()=>ctxVisible.value=false);document.addEventListener('contextmenu',(e)=>{if(!e.target.closest('.nexus-ctx,.nexus-desktop,.nexus-desktop-icon,.nexus-desktop-window'))ctxVisible.value=false})})
function getIconComponent(n){return n?I[n]||null:null}
function handleItemClick(item){if(item.type==='folder')currentFolder.value={...item,children:ds.getChildren(item.id)};else if(item.component)ws.open(item)}
function onMenuOpen(item){ws.open(item)}
function onOpenPreferences(){preferencesRef.value?.open()}
function onActivateWindow(id){ws.activate(id)}
function onDragOver(e){e.dataTransfer.dropEffect='copy'}
async function onDrop(e){const d=e.dataTransfer.getData('application/json');if(!d)return;try{const item=JSON.parse(d),el=document.elementFromPoint(e.clientX,e.clientY),folder=el?.closest('[data-folder-id]');await ds.addItem({title:item.title,icon:item.icon,component:item.component,path:item.path,type:'menu',parent_id:folder?Number(folder.dataset.folderId)||null:null,_copySuffix:` ${t('startMenu.copy')}`})}catch(ex){console.warn('drop fail',ex)}}
function onDesktopContext(e){
  // 桌面右键 → 显示新建文件夹菜单
  ctxItem.value=null
  ctxStyle.value={left:e.clientX+'px',top:e.clientY+'px'}
  ctxVisible.value=true
}
function openContextMenu(e,item){
  // 图标右键（排除弹窗和窗口内部）
  if(e.target.closest('.el-dialog,.el-dialog__wrapper,.el-drawer,.el-overlay,.el-drawer__wrapper,.nexus-desktop-window'))return
  ctxVisible.value=true;ctxItem.value=item;ctxStyle.value={left:e.clientX+'px',top:e.clientY+'px'}
}
function editItem(item){ctxVisible.value=false;editingItem.value=item;isNewItem.value=false;editorPos.value={x:200,y:100};editorVisible.value=true}
function deleteItem(item){ctxVisible.value=false;ds.removeItem(item.id)}
async function addFolder(){ctxVisible.value=false;const item=await ds.addItem({title:t('startMenu.newProject'),icon:'FolderOpened',type:'folder'});editingItem.value=item;isNewItem.value=false;editorPos.value={x:200,y:100};editorVisible.value=true}

async function onEditorSave(data){if(isNewItem.value)await ds.addItem({...data,_skipDedup:true});else if(editingItem.value)await ds.updateItem(editingItem.value.id,data)}
// 桌面图标自由拖拽
const iconsRef=ref(null)
const snapToGrid=ref(false) // 默认关闭紧贴网格，拖拽后保持自由位置
const lastDragItem=ref(null) // 正在拖拽或最近拖拽的图标，保持较高层级
const dragOverFolder=ref(null) // 悬停1秒后允许放入的文件夹 id
let folderHoverTimer=null // 文件夹悬停计时器
let folderHoverId=null    // 正在计时的文件夹 id
const iconPos={}
let iconVer=ref(0) // 版本号，更新时 +1 触发重绘
const ICON_W=80,ICON_H=90,GRID_GAP=16,GRID_PAD=20,COLS=10
let syncTimer=null // 防抖同步定时器
let syncQueue={}   // 待同步队列 { [id]: data }，相同 id 只保留最后一条

function getItemBasePos(item){
  const c=item.custom||{}
  if(c.x!=null&&c.y!=null&&!snapToGrid.value)return{x:c.x,y:c.y}
  const idx=ds.rootItems.findIndex(i=>i.id===item.id)
  const col=idx%COLS,row=Math.floor(idx/COLS)
  return{x:GRID_PAD+col*(ICON_W+GRID_GAP),y:GRID_PAD+row*(ICON_H+GRID_GAP)}
}

function iconStyle(item){
  const p=getItemBasePos(item)
  return{position:'absolute',left:p.x+'px',top:p.y+'px',zIndex:lastDragItem.value===item.id?2:1}
}

// 从文件夹拖出图标
function onFolderDragStart({item,offsetX,offsetY,clientX,clientY}){
  lastDragItem.value=item.id
  const p=getItemBasePos(item)
  // 在桌面创建一个临时拖拽元素（用 iconPos 保持位置）
  iconPos[item.id]={x:clientX-offsetX,y:clientY-offsetY}
  // 生成一个临时 DOM 元素用于拖拽
  const div=document.createElement('div')
  div.className='nexus-desktop-icon'
  div.style.position='fixed';div.style.left=(clientX-offsetX)+'px';div.style.top=(clientY-offsetY)+'px'
  div.style.zIndex='999';div.style.pointerEvents='none'
  div.dataset.itemId=String(item.id)
  div._dragOffset={ox:offsetX,oy:offsetY,startX:clientX,startY:clientY,baseX:clientX-offsetX,baseY:clientY-offsetY}
  document.body.appendChild(div)
  // 使用 document 级事件
  document.addEventListener('mousemove',onIconDragMove)
  document.addEventListener('mouseup',onIconDragUp)
}

function onIconMouseDown(e,item){
  lastDragItem.value=item.id
  if(e.button!==0)return
  const p=getItemBasePos(item)
  const rect=e.currentTarget.getBoundingClientRect()
  iconPos[item.id]={x:p.x,y:p.y}
  e.currentTarget._dragOffset={ox:e.clientX-rect.left,oy:e.clientY-rect.top,startX:e.clientX,startY:e.clientY,baseX:p.x,baseY:p.y}
  document.addEventListener('mousemove',onIconDragMove)
  document.addEventListener('mouseup',onIconDragUp)
}

function onIconDragMove(e){
  if(!lastDragItem.value)return
  const el=document.querySelector(`[data-item-id="${lastDragItem.value}"]`)
  if(!el)return
  const off=el._dragOffset
  if(!off)return
  const dx=e.clientX-off.startX
  const dy=e.clientY-off.startY
  // 用 transform 偏移，不和 Vue 的 :style 冲突
  el.style.transform=`translate(${dx}px,${dy}px)`
  // 如果拖拽来自文件夹且鼠标移出文件夹遮罩，关闭文件夹视图
  if(currentFolder.value && !e.target.closest('.nexus-folder-overlay')){
    currentFolder.value=null
  }
  // 检测拖拽图标下方是否有文件夹
  const oldPointer=el.style.pointerEvents
  el.style.pointerEvents='none'
  const under=document.elementFromPoint(e.clientX,e.clientY)
  el.style.pointerEvents=oldPointer
  const target=under?.closest('[data-item-id]')
  const tid=target?Number(target.dataset.itemId):null
  const t=tid?ds.items.find(i=>i.id===tid):null
  const isFolder=t&&t.type==='folder'&&tid!==lastDragItem.value
  // 悬停1秒后才允许放入文件夹
  if(isFolder){
    if(folderHoverId!==tid){
      folderHoverId=tid
      clearTimeout(folderHoverTimer)
      folderHoverTimer=setTimeout(()=>{dragOverFolder.value=tid},1000)
    }
  }else{
    clearTimeout(folderHoverTimer)
    folderHoverId=null
    dragOverFolder.value=null
  }
}

async function onIconDragUp(e){
  const id=lastDragItem.value
  if(!id)return
  const dropFolderId=dragOverFolder.value
  clearTimeout(folderHoverTimer);folderHoverId=null;dragOverFolder.value=null
  document.removeEventListener('mousemove',onIconDragMove)
  document.removeEventListener('mouseup',onIconDragUp)
  const el=document.querySelector(`[data-item-id="${id}"]`)
  if(!el)return
  const off=el._dragOffset;el._dragOffset=null
  if(!off)return
  // 鼠标必须移动超过 3px 才算拖拽，否则视为点击跳过
  const dx=e.clientX-off.startX,dy=e.clientY-off.startY
  if(Math.abs(dx)<=3&&Math.abs(dy)<=3){
    if(!document.querySelector('.nexus-desktop-icons')?.contains(el))el.remove()
    return
  }
  el.style.transform=''
  const x=Math.max(0,off.baseX+dx),y=Math.max(0,off.baseY+dy)
  const item=ds.items.find(i=>i.id===id)
  if(!item)return
  // 检测是否拖到已激活的文件夹上
  if(dropFolderId){
    item.parent_id=dropFolderId
    scheduleSync(id,{parent_id:dropFolderId})
    return
  }
  // 如果是从文件夹拖出来的，设置 parent_id=null 移出文件夹
  if(item.parent_id){
    item.parent_id=null
    ds.updateItem(id,{parent_id:null,custom:{x,y,...(item.custom||{})}})
  }else{
    const newCustom={...(item.custom||{}),x,y}
    item.custom=newCustom
    snapToGrid.value=false
    lastDragItem.value=id
    ds.updateItem(id,{custom:newCustom})
  }
  // 清理临时拖拽元素（从文件夹拖出时创建的）
  if(!document.querySelector('.nexus-desktop-icons')?.contains(el))el.remove()
}

// 防抖同步到后端：2秒内无新操作才发请求，相同 id 只保留最后一次
function scheduleSync(id,data){
  syncQueue[id]=data
  if(syncTimer)clearTimeout(syncTimer)
  syncTimer=setTimeout(()=>{
    const batch=syncQueue
    syncQueue={};syncTimer=null
    Promise.all(Object.entries(batch).map(([i,d])=>ds.updateItem(i,d).catch(()=>{})))
  },2000)
}

// 排列图标：清除自定义坐标，恢复网格排列
async function arrangeIcons(){ctxVisible.value=false
  const items=ds.rootItems
  for(const item of items){
    const c=item.custom||{}
    // 清除 x,y 但保留其他 custom 属性
    const {x:_,y:__,...rest}=c
    item.custom=Object.keys(rest).length?rest:{}
    await ds.updateItem(item.id,{custom:item.custom})
  }
  snapToGrid.value=true
}

function toggleSnap(){ctxVisible.value=false;snapToGrid.value=!snapToGrid.value;if(snapToGrid.value)arrangeIcons()}
const homePage=computed(()=>(window.__NEXUS_ADMIN_PAGES__||{})['nexus-home']||null)
</script>

<style scoped>
.nexus-desktop-layout{display:flex;flex-direction:column;height:100vh;position:relative;overflow:hidden;background:var(--nexus-bg-color)}
.nexus-desktop-body{display:flex;flex-direction:column;flex:1;min-height:0;position:relative;z-index:1}
.nexus-desktop-bg{position:absolute;inset:0;z-index:0;transition:background 0.5s ease}
.nexus-desktop{flex:1;position:relative;z-index:1;overflow:hidden;user-select:none}
.nexus-desktop-icons{position:relative;width:100%;height:100%;overflow:hidden}
.nexus-desktop-icon{position:absolute;display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 6px;cursor:default;border-radius:10px;width:80px;min-height:90px;-webkit-user-select:none;user-select:none}
.nexus-desktop-icon *{-webkit-user-select:none;user-select:none}
.nexus-desktop-icon:hover{background:rgba(255,255,255,0.12);backdrop-filter:blur(8px)}
/* 拖到文件夹上：虚线框表示放入 */
.nexus-drop-folder{background:rgba(255,255,255,0.2)!important;backdrop-filter:blur(8px);outline:2px dashed var(--nexus-primary-color);outline-offset:-2px;animation:nexus-folder-pulse .8s ease-in-out infinite}
@keyframes nexus-folder-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}

.nexus-desktop-icon-img{width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.15);border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.08);backdrop-filter:blur(4px)}
.nexus-desktop-icon-label{font-size:var(--nexus-font-size-sm);text-align:center;word-break:break-all;color:rgba(255,255,255,0.9);text-shadow:0 1px 3px rgba(0,0,0,0.3)}
/* 加载遮罩 */
.nexus-loading-overlay{position:absolute;inset:0;z-index:999;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px}
.nexus-loading-bar{width:240px;height:4px;background:rgba(255,255,255,0.15);border-radius:2px;overflow:hidden}
.nexus-loading-bar-inner{width:30%;height:100%;background:var(--nexus-primary-color);border-radius:2px;animation:nexus-loading-progress 1.4s ease-in-out infinite}
@keyframes nexus-loading-progress{0%{transform:translateX(-100%)}50%{transform:translateX(200%)}100%{transform:translateX(400%)}}
.nexus-loading-text{font-size:14px;color:rgba(255,255,255,0.8);letter-spacing:1px}
.nexus-desktop-empty{grid-column:1/-1;display:flex;justify-content:center;padding:60px 0}
.nexus-desktop-windows{position:absolute;inset:0;pointer-events:none}
.nexus-desktop-windows>*{pointer-events:auto}
.nexus-ctx{position:fixed;z-index:5000;background:var(--nexus-bg-color-light);border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.18);border:1px solid var(--nexus-border-color);padding:4px;min-width:140px}
.nexus-ctx-item{display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;border-radius:6px;font-size:13px;color:var(--nexus-text-color)}
.nexus-ctx-item:hover{background:var(--nexus-bg-color-dark)}
.nexus-ctx-divider{height:1px;background:var(--nexus-border-color);margin:4px 8px}
html.dark .nexus-desktop-icon-img{background:rgba(0,0,0,0.25)}
html.dark .nexus-desktop-icon-label{color:rgba(255,255,255,0.85)}
/* 首页侧滑面板 */
.nexus-home-overlay{position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,0.3);display:flex;justify-content:flex-end}
.nexus-home-panel{width:520px;max-width:90vw;height:100vh;background:var(--nexus-bg-color-light);box-shadow:-4px 0 24px rgba(0,0,0,0.15);display:flex;flex-direction:column;animation:nexus-slide-in 0.25s ease-out}
@keyframes nexus-slide-in{from{transform:translateX(100%)}to{transform:translateX(0)}}
.nexus-home-panel-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--nexus-border-color);font-size:16px;font-weight:600}
.nexus-home-panel-body{flex:1;overflow:auto;padding:16px}
</style>