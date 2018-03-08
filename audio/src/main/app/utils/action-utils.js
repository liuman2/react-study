import mapValues from 'lodash/mapValues'
import toUpper from 'lodash/toUpper'

export function wrapModuleName(moduleName = '', actionTypes = {}) {
  return mapValues(actionTypes, function (actionName) {
    return toUpper(`${moduleName}_${actionName}`)
  })
}
