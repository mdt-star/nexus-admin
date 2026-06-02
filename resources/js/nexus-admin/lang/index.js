/**
 * 语言包统一加载入口
 *
 * 集中加载所有内置语言包，导出为 { locale: messages } 格式。
 * 新增语言只需在 lang/ 下创建文件并在此导入。
 */
import zh from './zh'
import en from './en'

export const baseMessages = {
  'zh-CN': zh,
  'en': en
}