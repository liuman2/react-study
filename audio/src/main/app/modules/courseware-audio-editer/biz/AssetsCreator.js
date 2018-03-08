import { createAssets as create, getAssetsInfo, getCsFileInfo } from '../actions/courseware-action-creator'
import url from 'app/utils/url'

const GET_TRANSCODE_RESULT_INTERVAL = 2000 // 轮询请求转码结果间隔时间
const GET_MD5_INTERVAL = 500 // 轮询请求md5间隔时间，（分块上传完不会立即返回md5）
const SUCCESS = 'success'
const FAILED = 'failed'
export { SUCCESS, FAILED }

export function createAssets(uid, assetsId, csModel, sessionId, onResult) {
  function success(data) {
    if (onResult) {
      onResult(SUCCESS, data)
    }
  }
  function fail(err) {
    if (onResult) {
      onResult(FAILED, err)
    }
  }
  function getTranscodeResult(assetsId) {
    setTimeout(function () {
      getAssetsInfo(assetsId, 'TI,LC', true).payload.then(function (response) {
        console.log('资源状态:' + response.data.life_cycle.status)
        switch (response.data.life_cycle.status) {
          case 'TRANSCODE_ERROR': // 资源转码错误
            console.log('资源转码错误')
            fail({code: response.data.life_cycle.status})
            break
          case 'TRANSCODED': // 资源转码结束
            // 转码后输出response
            success(response.data)
            break
          default:
            getTranscodeResult(assetsId)
            break
        }
      }).catch(function (err) {
        console.log('getTranscodeResult err' + err)
        fail(err)
      })
    }, GET_TRANSCODE_RESULT_INTERVAL)
  }

  // 大文件(以是否分块上传定义)上传完成response中不包含md5值,需要单独从cs服务器取
  function createAssetsContainVerifyMd5(model) {
    if (model.inode.md5) {
      create({
        identifier: assetsId,
        title: model.name,
        creator: uid,
        size: model.inode.size,
        location: url.csRef(model.path),
        md5: model.inode.md5
      }, true).payload.then(function (response) {
        getTranscodeResult(response.data.identifier)
      }).catch(function (err) {
        console.log('err=' + err)
        fail(err)
      })
      return
    }
    setTimeout(function () {
      getCsFileInfo(model.path, sessionId, true).payload.then(function (response) {
        createAssetsContainVerifyMd5(response.data)
      }).catch(function (err) {
        console.log('getCsFileInfo err' + err)
        fail(err)
      })
    }, GET_MD5_INTERVAL)
  }

  createAssetsContainVerifyMd5(csModel)
}
