/**
 * 新建课程引导页
 */
import React from 'react';
import { setTitle } from 'utils/dx/nav';
import img from './img/icon-empty.png';

function ManagementReportGuid() {
  setTitle({
    title: '部门简报',
  });
  return (
    <div className="management">
      <img className="guid-report" src={img} alt="" />
      <div className="guid-text">
        <p className="mb-42">您未设置部门简报推送</p>
        <p className="mb-4">可登录多学培训管理平台</p>
        <p>【报表中心】-【部门简报推送】，进行配置</p>
      </div>
    </div>
  );
}

export default ManagementReportGuid;
