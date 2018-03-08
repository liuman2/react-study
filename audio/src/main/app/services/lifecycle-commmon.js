import axios from 'axios'
import url from 'utils/url'

export function getLcUploadUrl(resType, uid, disableLoading) {
  // &coverage=Org/nd
  return axios.get(url.lifecycle(`/v0.6/${resType}/none/uploadurl?uid=${uid}&renew=false`), {
    disableLoading: disableLoading
  }).then(({data}) => {
    data.access_url = url.adaptProtocol(data.access_url)
    return data
  })
}

export function getLcDownloadUrl(resType, uid, uuid, disableLoading) {
  return axios.get(url.lifecycle(`/v0.6/${resType}/${uuid}/downloadurl?uid=${uid}&id=${uid}`), {
    disableLoading: disableLoading
  }).then(({data}) => {
    data.access_url = url.adaptProtocol(data.access_url)
    return data
  })
}
