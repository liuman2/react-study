import url from 'url';
import xBack from 'utils/xback';

export function checkIsEceibs(resource) {
  return typeof resource === 'string' && resource.includes('intest.eceibs.com');
}

export function checkIfAuthed() {
  const parsed = url.parse(location.hash.substr(1), true);
  return parsed.query.authed;
}

/**
 * 中欧课件转跳
 * @param resource 中欧课件地址
 */
export default function (resource, backUrl = location.href) {
  const isEceibsCourse = checkIsEceibs(resource); // 是否是中欧的课程
  if (isEceibsCourse) {
    const shouldCreateSession = !checkIfAuthed();
    if (shouldCreateSession) {
      location.href = `${resource}&go_back=${encodeURIComponent(backUrl + '&authed=1')}`;
    } else {
      xBack();
    }
  }
}
