
/**
 * 'abc.pdf' => 'abc'
 * @param {string} name
 */
export function removeSuffix(name) {
  const lastIndex = name.lastIndexOf('.')
  if (lastIndex === -1) {
    return name
  }
  return name.substring(0, lastIndex)
}
