/**
 * 新建试卷引导页
 */
import React from 'react';
import { setTitle } from 'utils/dx/nav';
import imgGuid1 from './img/exam_guid_1.png';
import imgGuid2 from './img/exam_guid_2.png';
import imgGuid3 from './img/exam_guid_3.png';
import imgGuid4 from './img/exam_guid_4.png';
import imgGuid5 from './img/exam_guid_5.png';

function ManagementExamGuid() {
  setTitle({
    title: '新建试卷',
  });
  return (
    <div className="management">
      <div className="guid-box pt-36 pb-36">
        目前，手机端暂不支持创建试卷，可登录多学培训管理平台在多学培训管理平台进行试卷制作，流程为：教材准备→试卷→开始准备→试卷编辑。具体步骤如下
      </div>
      <div className="guid-box">
        步骤一：进入备课系统，选择新建试卷
        <img className="mt-30 mb-30" src={imgGuid1} alt="" />
        <img src={imgGuid2} alt="" />
      </div>
      <div className="guid-box">
        步骤二：选择出卷方式
        <ul>
          <li>
            1.固定出卷：每个学员接收到相同试卷时，试卷的题目一致。
          </li>
          <li>
            2.随机出卷：每个学员接收到相同试卷时，每人每次都可能接
            收到不同题目，类似驾校科一考试。
          </li>
        </ul>
        <img src={imgGuid3} alt="" />
        <p className="mt-30">
          方式一：固定出卷
        </p>
        <ul>
          <li>
            1.支持手动添加题目，也可从前期建好的题目中选择题目。
          </li>
          <li>
            2.分数设置：支持按题型设置分数，即相同题型的每道题分值
            一致；也可手动设置题目分数，即逐题设置不同分数。
          </li>
          <li>
            3.答案及题目顺序设置：设置每个学员接收到该试卷时，题目
            及答案顺序是否相同
          </li>
        </ul>
        <img src={imgGuid4} alt="" />
        <p className="mt-30">
          方式二：随机出卷
        </p>
        <p style={{ color: '#666666' }}>从先前已建好的题库中选择题目</p>
        <img className="mt-30" src={imgGuid5} alt="" />
      </div>
      <div className="guid-footer">
        <p className="guid-icon mb-16">更多使用教程可查看：</p>
        <p>https://guide.91yong.com/prepare/prepare-c2/#创建试卷</p>
      </div>
    </div>
  );
}

export default ManagementExamGuid;
