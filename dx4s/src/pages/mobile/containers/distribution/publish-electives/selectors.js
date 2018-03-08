import { createSelector } from 'reselect';
import { pluck, last, pipe, prop, defaultTo } from 'utils/fn';

export const electiveSelector = state => state.publishElectives;
const createElectiveSelectorCreator = key => createSelector(
  electiveSelector,
  publishElectives => publishElectives[key]
);

export const coursesSelector = createSelector(
  electiveSelector,
  ({ electives }) => electives
);
export const selectedCoursesSelector = createSelector(
  electiveSelector,
  ({ selectedItems }) => selectedItems
);

export const selectedCoursesLengthSelector = createSelector(
  selectedCoursesSelector,
  ({ length }) => length
);

export const departmentsSelector = createElectiveSelectorCreator('departments');
export const selectedDepartmentsSelector = createElectiveSelectorCreator('selectedDepartments');
export const departmentsNameSelector = createSelector(
  departmentsSelector,
  pluck(['name'])
);
export const selectedDepartmentIdSelector = createSelector(
  departmentsSelector,
  pipe([last, defaultTo({}), prop('id')])
);

export const childDepartmentsSelector = createElectiveSelectorCreator('childDepartments');

export const usersSelector = createElectiveSelectorCreator('users');
export const selectedUsersSelector = createElectiveSelectorCreator('selectedUsers');
export const totalUsersSelector = createElectiveSelectorCreator('totalUsers');
export const selectedUsersCountSelector = createSelector(
  selectedUsersSelector,
  ({ length }) => length
);
export const maxAvailableUserCountSelector = createSelector(
  selectedCoursesSelector,
  electives => electives.reduce((count, { available_num: available }) =>
    (available && available < count ? available : count), Infinity)
);
