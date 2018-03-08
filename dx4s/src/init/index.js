import 'utils/dx/env';
import { loadIfNotExits } from 'utils/async-load-script';
import getClient from 'utils/3rd/dingtalk/client';

// 百度统计
export function loadBaiduAnalysis() {
  loadIfNotExits('https://hm.baidu.com/hm.js?c24c9f9502d0dfbdbea1dfcb0c45937b', '_hmt');
}

export function appendDingTalkIndex() {
  const makeGuideImg = img => `<img src="${img}">`;
  const makeGuideBtn = () => '<div id="dd-enter">立即进入</div>';
  const guideImg = require('./img/DDGuide.png'); // eslint-disable-line
  const guideDOM = document.querySelector('#dd-guide');

  guideDOM.innerHTML = [
    makeGuideImg(guideImg),
    makeGuideBtn(),
  ].join('');
  guideDOM.style.display = 'block';
  return new Promise((resolve) => {
    document.querySelector('#dd-enter').addEventListener('click', () => resolve('resolve'));
  });
}

export function appendWechatWorkIndex() {
  const makeGuideImg = img => `<img src="${img}">`;
  const makeGuideBtn = () => '<div id="dd-enter">立即进入</div>';
  const guideImg = require('./img/DDGuide.png'); // eslint-disable-line
  const guideDOM = document.querySelector('#dd-guide');

  guideDOM.innerHTML = [
    makeGuideImg(guideImg),
    makeGuideBtn(),
  ].join('');
  guideDOM.style.display = 'block';
  return new Promise((resolve) => {
    document.querySelector('#dd-enter').addEventListener('click', () => resolve('resolve'));
  });
}
// 初始化
// 钉钉下加载相应客户端，如果是移动版的钉钉，还会加载相应的钉钉移动版首页
// 非钉钉环境下加载百度统计
export default function init() {
  const toDetail = location.href.indexOf('#/') !== -1;
  let tasks = [];
  switch (true) {
    case __PLATFORM__.DINGTALKPC:
      tasks = [getClient()];
      break;
    case __PLATFORM__.DINGTALK:
      tasks = toDetail ? [getClient()] : [getClient(), appendDingTalkIndex()];
      break;
    default:
      tasks = [loadBaiduAnalysis()];
  }

  return Promise.all(tasks);
}
