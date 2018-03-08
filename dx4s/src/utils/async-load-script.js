import $S from 'scriptjs';

export default function loadScript(src) {
  return new Promise(resolve => $S(src, resolve));
}

export function loadIfNotExits(src, namespace) {
  // if (window[namespace]) return Promise.resolve(window[namespace]);
  return loadScript(src)
    .then(() => window[namespace]);
}
