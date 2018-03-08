import Toast from 'components/toast'
import { H5_IMAGE_CHOOSE_LIMIT } from '../constants/common-constant'

/**
 * 检查单次选择图片数量
 * @param {number} count 数量
 */
export function checkImageCount(count) {
  // 移动端图片资源选择数量限制（场景包括本地和资源库）
  if (window.UAInfo.client.Mobile && count > H5_IMAGE_CHOOSE_LIMIT) {
    Toast(`一次性最多选择${H5_IMAGE_CHOOSE_LIMIT}张图片`)
    return false
  }
  return true
}
