import { createSelector } from 'reselect';

export const userAccountSelector = state => state.account.user;

// 多学课堂
export const hasMallModuleSelector = createSelector(
  userAccountSelector,
  ({ modules }) => !(modules && modules.mall === false),
);

// 部门简报
export const hasDepartmentReportModuleSelector = createSelector(
  userAccountSelector,
  ({ modules }) => !(modules && modules['department-briefing-switch'] === false),
);

// 学习地图
export const hasStudyMapModuleSelector = createSelector(
  userAccountSelector,
  ({ modules }) => !(modules && modules['study-route-switch'] === false),
);

// 信息收集
export const hasInfoCollectionModuleSelector = createSelector(
  userAccountSelector,
  ({ modules }) => !(modules && modules['info-collection-switch'] === false),
);

// 直播
export const hasLivingSelector = createSelector(
  userAccountSelector,
  ({ modules }) => !(modules && modules.living === false),
);

// 管理中心
export const hasManagementCenterSelector = createSelector(
  userAccountSelector,
  ({ hasManagementCenter }) => (hasManagementCenter === true),
);

// 绑定手机号设定
export const bindMobilePhoneSwitchSelector = createSelector(
  userAccountSelector,
  ({ bindMobilePhoneSwitch }) => (bindMobilePhoneSwitch === true),
);

