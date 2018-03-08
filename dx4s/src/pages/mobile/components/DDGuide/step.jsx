import React from 'react';
import { nav } from 'utils/dx';

import './styles.styl';

const setNavBar = () => {
  nav.setTitle({
    title: '课程管理使用帮助',
  });
};
const articleImg1for1 = require('./img/1-1.png');
const articleImg1for2 = require('./img/1-2.png');
const articleImg1for3 = require('./img/1-3.png');
const articleImg2 = require('./img/2.png');
const articleImg3 = require('./img/3.png');
const articleImg4 = require('./img/4.png');

const Step = () => {
  setNavBar();
  return (
    <section className="DDGuide-step-section">
      <article>
        <h1>一、强大的备课系统</h1>
        <p>管理员在钉钉管理后台登录多学培训管理平台，进入备课系统制作课程或考试；</p>
        <article>
          <h2>1、在钉钉管理后台点击多学培训应用</h2>
          <p><img role="presentation" src={articleImg1for1} /></p>
        </article>
        <article>
          <h2>2、进入到多学培训管理平台，点击备课系统</h2>
          <p><img role="presentation" src={articleImg1for2} /></p>
        </article>
        <article>
          <h2>3、在备课系统中可以制作课程和考试</h2>
          <p><img role="presentation" src={articleImg1for3} /></p>
        </article>
      </article>
      <article>
        <h1>二、创建培训计划</h1>
        <p>管理员在多学培训管理平台创建培训计划向学习对象发放课程或考试；<br /><img role="presentation" src={articleImg2} /></p>
      </article>
      <article>
        <h1>三、员工学习</h1>
        <p>员工在钉钉的应用处进入多学培训，查看课程进行学习或考试；<img role="presentation" src={articleImg3} /></p>
      </article>
      <article>
        <h1>四、员工学习报表</h1>
        <p>管理员进入多学培训管理平台，查看员工学习报表；<br /><img role="presentation" src={articleImg4} /></p>
      </article>
    </section>
  );
};

export default Step;
