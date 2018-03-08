/**
 *转换byte到KB
 *
 * @memberof ResourceFileList
 * @param {number} size 原先的单位是byte
 */
export function convertSizeToKB(size) {
  if (!size) {
    return 0
  } else if (size > 1024 * 1024) {
    return (size / (1024 * 1024)).toFixed(2) + 'MB'
  } else if (size > 1024) {
    return (size / 1024).toFixed(0) + 'KB'
  } else {
    return size + 'B'
  }
}
