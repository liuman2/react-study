import indexOf from 'lodash/indexOf'
import map from 'lodash/map'
import uniq from 'lodash/uniq'

const TypeEnum = {
  document: 'document',
  image: 'image',
  audio: 'audio'
}
const SUPPORT_MIMETYPE = {
  document: {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/msword': 'doc',
    'application/pdf': 'pdf',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx'
  },
  image: {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/bmp': 'bmp'
  },
  audio: {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/x-wav': 'wav',
    'audio/wav': 'wav',
    'audio/x-ms-wma': 'wma',
    'audio/wma': 'wma'
  }
}

const documentTypes = uniq(map(SUPPORT_MIMETYPE.document))
const imageTypes = uniq(map(SUPPORT_MIMETYPE.image))
const audioTypes = uniq(map(SUPPORT_MIMETYPE.audio))
export {
  TypeEnum,
  documentTypes,
  imageTypes,
  audioTypes
}

/**
 * 根据扩展名获取类型
 * @param {string} extension 文件扩展名 eg: png
 */
export function getTypeFromExtension(extension) {
  if (indexOf(imageTypes, extension.toLocaleLowerCase()) !== -1) {
    return TypeEnum.image
  } else if (indexOf(documentTypes, extension.toLocaleLowerCase()) !== -1) {
    return TypeEnum.document
  } else if (indexOf(audioTypes, extension.toLocaleLowerCase()) !== -1) {
    return TypeEnum.audio
  }
}

/**
 * 根据mimetype获取类型
 * @param {string} mimeType eg: image/jpg
 */
export function getTypeFromMimeType(mimeType) {
  console.log('mimeType %s', mimeType)
  const { document, image, audio } = SUPPORT_MIMETYPE
  if (document[mimeType] !== undefined) {
    return TypeEnum.document
  } else if (image[mimeType] !== undefined) {
    return TypeEnum.image
  } else if (audio[mimeType] !== undefined) {
    return TypeEnum.audio
  }
}
// export function isMimeTypeSupport(mimeType) {
//   const { document, image, audio } = SUPPORT_MIMETYPE
//   if (document[mimeType] !== undefined || image[mimeType] !== undefined ||
//     audio[mimeType] !== undefined) {
//     return true
//   }
//   return false
// }
