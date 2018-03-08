import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import api from 'utils/api';
import { Confirm } from '../../../../components/modal';
import { account as accountActions } from '../../actions';

class SettingList extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      isConfirmOpen: false,
    };
    this.closeConfirm = ::this.closeConfirm;
    this.onLogoutClick = ::this.onLogoutClick;
    this.logout = ::this.logout;
  }

  closeConfirm() {
    this.setState({ ...this.state, isConfirmOpen: false });
  }

  onLogoutClick() {
    this.setState({ ...this.state, isConfirmOpen: true });
  }

  logout() {
    const logout = api({ url: '/account/certification/center/logout' });
    logout.then(() => {
      this.props.initUser();
      window.location = './#/account';
    });
  }

  render() {
    const views1 = [
      {
        messages: messages.password,
        url: 'changePsw',
      }, {
        messages: messages.language,
        url: 'setting/language',
      },
    ];
    const views2 = [
      {
        messages: messages.help,
        url: 'help',
      }, {
        messages: messages.feedback,
        url: 'feedback',
      }, {
        messages: messages.about,
        url: 'about',
      },
    ];

    return (
      <div className="setting-list">
        {
          /* 钉钉没有修改密码 暂时没有多语言*/
          !__platform__.dingtalk && <ul className="views">
            {
              views1.map((view) => {
                if (__platform__.dingtalk && view.url === 'changePsw') {
                  return null;
                }

                return (<li key={view.url}>
                  <Link to={view.url}><FormattedMessage id={view.messages.id} /></Link>
                </li>);
              })
            }
          </ul>
        }

        <ul className="views">
          {
            views2.map((view) => {
              if (__platform__.dingtalk && view.url === 'feedback') {
                return null;
              }
              return (<li key={view.url}>
                <Link to={view.url}><FormattedMessage id={view.messages.id} /></Link>
              </li>);
            })
          }
        </ul>
        <ul className="logout-views">
          {
            (() => {
              if (__platform__.dingtalk) {
                return null;
              }

              return (<li onClick={this.onLogoutClick}>
                <FormattedMessage id="app.setting.logout" />
              </li>);
            })()
          }
        </ul>
        <Confirm
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isConfirmOpen}
          onRequestClose={this.closeConfirm}
          onConfirm={this.logout}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
          cancelButton={<span><FormattedMessage id="app.course.cancel" /></span>}
        >
          <span>
            <FormattedMessage  id="app.setting.logoutMsg" />
          </span>
        </Confirm>
      </div>
    );
  }
}

// const mapStateToProps = state => ({
// });

const mapDispatchToProps = dispatch => ({
  initUser: bindActionCreators(accountActions.initUser, dispatch),
});

export default connect(null, mapDispatchToProps)(SettingList);

// export default SettingList;
