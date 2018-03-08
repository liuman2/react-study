import map from 'lodash/map'
import { formatPT } from 'app/utils/format-time'

export function toSubmitData({ uid, title, description, pages, timepoints, editMode }) {
  let audioItems
  if (editMode.isSingle) { // 单页编辑
    audioItems = map(pages, (page, i) => {
      const { identifier, location, duration } = page.audio
      return {
        audio_identifier: identifier,
        location: location,
        dead_time: formatPT(2000), // api是必传
        items: [{
          img_url: page.imageUrl,
          start_time: formatPT(0),
          end_time: formatPT(duration),
          dead_time: formatPT(page.deadTime ? page.deadTime * 1000 : 0)
        }]
      }
    })
  } else { // 全局编辑
    const pageItems = map(pages, (page, i) => {
      const timepoint = timepoints[i]
      const { duration } = editMode.globalAudio
      return {
        img_url: page.imageUrl,
        start_time: formatPT(i === 0 ? 0 : timepoint.startTime),
        // bugID=181753 全局编辑只有一个音频，最后一个图片的结束时间即音频总时长
        end_time: i === timepoints.length - 1 ? formatPT(duration) : formatPT(timepoint.endTime),
        dead_time: formatPT(page.deadTime ? page.deadTime * 1000 : 0)
      }
    })
    // 全局编辑只有一个音频
    const { identifier, location } = editMode.globalAudio
    audioItems = [{
      audio_identifier: identifier,
      location: location,
      dead_time: formatPT(2000), // api是必传
      items: pageItems
    }]
  }

  return {
    title,
    description,
    creator: uid,
    items: audioItems
  }
}
