import { getCsFileList, toMakeCourseware, uploadAudio } from '../../courseware-audio-editer/actions/courseware-action-creator'
import { openImageReorder } from '../../courseware-audio-editer/actions/imagereorder-action-creator'
import { getAudioInfo } from '../../courseware-audio-editer/biz/AudioTool'
import { checkImageCount } from '../../courseware-audio-editer/biz/ResourceUtils'
import { TypeEnum, getTypeFromMimeType } from '../../courseware-audio-editer/components/resource-uploader/TypeUtils'
// import { getLcUploadUrl, getLcDownloadUrl } from 'app/services/lifecycle-commmon'
import { getLcDownloadUrl } from 'app/services/lifecycle-commmon'
import url from 'app/utils/url'
import map from 'lodash/map'
import find from 'lodash/find'
import get from 'lodash/get'

/**
 * @param {string} category  h5资源库中定义的类型
 * @param {array} items assetsInfo list
 * @param {uid} uid 用户id
 */
export function resourceImport(category, items, uid) {
  // return Promise.resolve().then(() => {
  if (!items || items.length === 0) {
    Promise.reject(new TypeError('未选中任何资源'))
  }
  let techInfo, action
  switch (category) {
    case 'DOCUMENT':
      const documentModel = items[0] // 只能选一个文档
      techInfo = documentModel.tech_info
      if (getTypeFromMimeType(techInfo.href.format) !== TypeEnum.document) {
        break
      }
      if (!techInfo.image) {
        return Promise.reject(new TypeError('该资源不存在相关素材!'))
      }

      return getLcDownloadUrl('assets', uid, documentModel.identifier).then((data) => {
        return getCsFileList(url.delRefPath(techInfo.image.location), data.session_id).payload
      }).then(items => {
        action = createDocumentAction(documentModel.title, items, 'path')
        return Promise.resolve(action)
      })
    case 'IMAGE':
      const unsupportImage = find(items, item => {
        techInfo = item.tech_info
        return getTypeFromMimeType(techInfo.href.format) !== TypeEnum.image
      })
      if (unsupportImage || !checkImageCount(items.length)) {
        break
      }
      action = createImagesAction(items, 'tech_info.href.location', 'ndr')
      return Promise.resolve(action)
    case 'AUDIO':
      const audioModel = items[0] // 只能选一个音频
      techInfo = audioModel.tech_info
      if (getTypeFromMimeType(techInfo.href.format) !== TypeEnum.audio) {
        break
      }
      action = createAudioAction(items[0])
      return Promise.resolve(action)
  }
  if (category === 'AUDIO') {
    return Promise.reject(new TypeError('不支持的资源类型，音频只支持mp3、wma、wav'))
  }
  if (category === 'DOCUMENT') {
    return Promise.reject(new TypeError('不正确的文档类型'))
  }
  return Promise.reject(new TypeError('不支持的资源类型，图片只支持png或jpg'))
  // })
}

function createDocumentAction(title, modelArray, getPath) {
  const coursewareImages = map(modelArray, resp => {
    const path = url.delRefPath(get(resp, getPath))
    return url.csStatic(path)
  })
  return toMakeCourseware(title, coursewareImages)
}

function createImagesAction(modelArray, getPath) {
  const values = map(modelArray, resp => {
    const path = url.delRefPath(get(resp, getPath))
    return {
      name: resp.name || resp.title, // 前者本地上传cs实体，后者资源库实体
      url: url.csStatic(path)
    }
  })
  return openImageReorder('ndr', values)
}

function createAudioAction(assetsInfo) {
  const audioInfo = getAudioInfo(assetsInfo, 'upload')
  return uploadAudio(audioInfo)
}
