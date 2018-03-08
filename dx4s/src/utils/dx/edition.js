import Cookie from 'tiny-cookie';

export function getEdition() {
  return Cookie.get('edition');
}

export function isUltimate() {
  return getEdition() === 'ultimate';
}

export function isStandard() {
  return getEdition() === 'standard';
}

export function setEdition(edition) {
  Cookie.set('edition', edition);
}
