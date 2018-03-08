/**
 * 新建课程引导页
 */
import React from 'react';
import { setTitle } from 'utils/dx/nav';
import imgGuid1 from './img/course_guid_1.png';
import imgGuid2 from './img/course_guid_2.png';
import imgGuid3 from './img/course_guid_3.png';

function ManagementCourseGuid() {
  setTitle({
    title: '新建课程',
  });
  return (
    <div className="management">
      <div className="guid-box pt-36 pb-36">
        目前，手机端暂不支持新建课程，可登录多学培训管理平台在多学培训管理平台进行课程制作，流程为：备课系统→课程制作→开始制作或直接导入scrom课程。具体步骤如下
      </div>
      <div className="guid-box">
        步骤一: 进入培训管理平台，点击备课系统
        <img className="mt-30" src={imgGuid1} alt="" />
      </div>
      <div className="guid-box">
        步骤二：进入备课系统，选择制作课程或直接导入scorm
        课程
        <img className="mt-30" src={imgGuid2} alt="" />
      </div>
      <div className="guid-box">
        步骤三：以制作课程为例
        <ul>
          <li>
            1.填写课程基础信息，如课程名称，课程封面等
          </li>
          <li>
            2.选择课程章节内容，支持课件、试卷、问卷三种内容
          </li>
          <li>
            3.根据需求选择配置训练挑战（即课后训练），如复习训练
             （21天记忆法）与习题训练（答题巩固）
          </li>
          <li>
            4.根据需求选择配置本门课程的考试测验，通过分数检验学
              员掌握情况
          </li>
          <li>
            注：3与4为可选项。
          </li>
        </ul>
        <img src={imgGuid3} alt="" />
      </div>
      <div className="guid-footer">
        <p className="guid-icon mb-16">更多使用教程可查看：</p>
        <p>https://guide.91yong.com/prepare/prepare-c4/#创建课程</p>
      </div>
    </div>
  );
}

export default ManagementCourseGuid;
