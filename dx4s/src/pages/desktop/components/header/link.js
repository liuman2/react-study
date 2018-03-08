import dxConfig from 'dxConfig';

export function getELink() {
  const eLink = window.location.protocol + dxConfig.SAAS.origin;
  return eLink;
}

export function getMallLink() {
  const mallLink = window.location.protocol + dxConfig.MALL.origin;
  return mallLink;
}
