
export function formatPT(msec) {
  let hour, min, sec
  sec = msec / 1000
  if (sec >= 60) {
    min = sec / 60
    sec = sec % 60
    if (min >= 60) {
      hour = min / 60
      min = min % 60
    }
  }

  if (hour > 0) {
    console.log('输入 %s秒, 输出 %s', Math.floor(msec / 1000), `PT${Math.floor(hour)}H${Math.floor(min)}M${Math.floor(sec)}S`)
    return `PT${Math.floor(hour)}H${Math.floor(min)}M${Math.floor(sec)}S`
  } else if (min > 0) {
    console.log('输入 %s秒, 输出 %s', Math.floor(msec / 1000), `PT${Math.floor(min)}M${Math.floor(sec)}S`)
    return `PT${Math.floor(min)}M${Math.floor(sec)}S`
  } else {
    console.log('输入 %s秒, 输出 %s', Math.floor(msec / 1000), `PT${Math.floor(sec)}S`)
    return `PT${Math.floor(sec)}S`
  }
}

export function formatHHMMSS(seconds) {
  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = pad(date.getUTCSeconds())
  if (hh) {
    return `${hh}:${pad(mm)}:${ss}`
  }
  return `${mm}:${ss}`
}

function pad(string) {
  return ('0' + string).slice(-2)
}

export function formatTime(time, fmt) {
  time = new Date(time.replace(/-/g, '/').replace('T', ' ').split('.')[0])
  var o = {
    'M+': time.getMonth() + 1, // 月份
    'd+': time.getDate(), // 日
    'H+': time.getHours(), // 小时
    'm+': time.getMinutes(), // 分
    's+': time.getSeconds(), // 秒
    'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
    'S': time.getMilliseconds() // 毫秒
  }
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (time.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}
