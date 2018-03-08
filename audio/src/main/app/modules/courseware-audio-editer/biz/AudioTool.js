import find from 'lodash/find'
import url from 'app/utils/url'

/**
 * 从素材数据中获取音频信息
 */
export function getAudioInfo({ identifier, title, tech_info: { href, source } }, from) {
  // href.requirements有时是空数组，不知道href和source有什么区别，先这样吧
  href.requirements = href.requirements || []
  const res = href.requirements.length ? href.requirements : source.requirements
  const audioRequirement = find(res, requirement => requirement.name === 'Audio')
  let duration = 0
  if (audioRequirement) {
    let audioValues
    if (typeof (audioRequirement.value) === 'string') {
      audioValues = JSON.parse(audioRequirement.value)
    } else {
      audioValues = audioRequirement.value
    }

    for (let i = 0; i < audioValues.length; i++) {
      const { Duration } = audioValues[i]
      if (Duration) {
        duration = Duration
        break
      }
    }
  }
  const audioUrl = url.csStatic(url.delRefPath(href.location))
  return {
    identifier,
    name: title || audioUrl.split('/').pop(),
    url: audioUrl,
    location: href.location,
    duration,
    from: from
  }
}
