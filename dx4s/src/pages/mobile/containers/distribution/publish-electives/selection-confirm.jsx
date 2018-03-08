import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import { pluck } from 'utils/fn';
import { setTitle } from 'utils/dx/nav';
import * as actions from 'dxActions/publish-electives';
import PublishSuccessPopup from '../publish-success';
import * as selectors from './selectors';
import messages from '../messages';
import './selection-confirm.styl';

class ConfirmSelection extends Component {
  constructor() {
    super();
    this.state = {
      showPicker: false,
      isPublishing: false,
      name: '',
      start: '',
      success: false,
    };
    this.goBack = ::this.goBack;
    this.publish = ::this.publish;
    this.getIntl = ::this.getIntl;
  }

  componentDidMount() {
    setTitle({ title: this.getIntl('elevtiveTitle') });
  }

  getIntl(id) {
    return this.context.intl.messages[`app.distribution.confirm.${id}`];
  }

  goBack() {
    this.context.router.goBack();
  }

  async publish() {
    if (this.state.isPublishing) return;
    this.setState({ isPublishing: true });
    const { selectedUsers, selectedCourses } = this.props;
    const users = pluck('id', selectedUsers);

    const data = { users, ids: selectedCourses.join(',') };
    try {
      await this.props.actions.publishElectives(data);
      this.setState({
        name,
        success: true,
      });
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.alert(e.response.data.message);
    } finally {
      this.props.actions.initElectiveDistribution();
      this.setState({ isPublishing: false });
    }
  }

  render() {
    const { selectedUserCount, selectedCourseCount } = this.props;
    const { success } = this.state;
    if (success) {
      return (
        <PublishSuccessPopup
          name=""
          toDistribution={() => this.context.router.push('/distribution/publish-electives')}
        />
      );
    }
    return (
      <div className="selection-confirm">
        <ul className="dx-list dx-list-form">
          <li className="list-indie">
            <FormattedMessage {...messages.selectedCourseCount} />
            <FormattedMessage {...messages.courses} values={{ num: selectedCourseCount }} />
          </li>
          <li className="list-indie">
            <FormattedMessage {...messages.selectedUserCount} />
            {selectedUserCount > 0 ? <FormattedMessage {...messages.users} values={{ num: selectedUserCount }} /> : <FormattedMessage {...messages.forAllUsers} />}
          </li>
        </ul>

        <div className="dx-footer">
          <div className="step-confirm" onClick={this.publish}>
            <FormattedMessage {...messages.confirm} />
          </div>
        </div>
      </div>
    );
  }
}

const { number, object, arrayOf, shape } = React.PropTypes;
ConfirmSelection.propTypes = {
  selectedUserCount: number,
  selectedCourseCount: number,
  selectedUsers: arrayOf(object),
  selectedCourses: arrayOf(object),
  actions: shape({}),
};

ConfirmSelection.contextTypes = {
  router: object,
  intl: object,
};

const mapStateToProps = state => ({
  selectedUserCount: selectors.selectedUsersCountSelector(state),
  selectedCourseCount: state.publishElectives.count,
  selectedUsers: selectors.selectedUsersSelector(state),
  selectedCourses: state.publishElectives.selectedIds,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmSelection);
