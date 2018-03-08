export function encodeToWav(audioData, options = { sampleBits: 8 }) {
  const { sampleRate, sampleBits } = options
  console.log('sampleRate=' + sampleRate)
  let dataLength = audioData.length
  let buffer = new ArrayBuffer(44 + dataLength * 2)
  let data = new DataView(buffer)

  let channelCount = 1
  let offset = 0

  var writeString = function (str) {
    for (var i = 0; i < str.length; i++) {
      data.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  // 资源交换文件标识符
  writeString('RIFF')
  offset += 4
  // 下个地址开始到文件尾总字节数,即文件大小-8
  data.setUint32(offset, 36 + dataLength * 2, true); offset += 4
  // WAV文件标志
  writeString('WAVE'); offset += 4
  // 波形格式标志
  writeString('fmt '); offset += 4
  // 过滤字节,一般为 0x10 = 16
  data.setUint32(offset, 16, true); offset += 4
  // 格式类别 (PCM形式采样数据)
  data.setUint16(offset, 1, true); offset += 2
  // 通道数
  data.setUint16(offset, channelCount, true); offset += 2
  // 采样率,每秒样本数,表示每个通道的播放速度
  data.setUint32(offset, sampleRate, true); offset += 4
  // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8
  data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4
  // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8
  data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2
  // 每样本数据位数
  data.setUint16(offset, sampleBits, true); offset += 2
  // 数据标识符
  writeString('data'); offset += 4
  // 采样数据总数,即数据总大小-44
  data.setUint32(offset, dataLength * 2, true); offset += 4
  // 写入采样数据
  for (var i = 0; i < audioData.length; i++, offset += 2) {
    var s = Math.max(-1, Math.min(1, audioData[i]))
    var val = s < 0 ? s * 0x8000 : s * 0x7FFF
    // val = parseInt(255 / (65535 / (val + 32768)))
    data.setInt16(offset, val, true)
  }

  return new Blob([data], { type: 'audio/wav' })
}
