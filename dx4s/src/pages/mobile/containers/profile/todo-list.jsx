import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { hasDepartmentReportModuleSelector, hasStudyMapModuleSelector, hasInfoCollectionModuleSelector, hasLivingSelector } from 'dxSelectors/account-user';
import withAuth from 'hocs/withAuth';
import { connect } from 'react-redux';
import messages from './messages';


function getNewMsg(newMessage, url) {
  return {
    'red-dot': newMessage.announcement_msg && url === 'announcement',
  };
}

class TodoList extends React.Component {
  views = [
    {
      messages: messages.learn,
      url: 'plans',
    },
    {
      messages: messages.live,
      url: 'lives',
    },
    {
      messages: messages.test,
      url: 'exams',
    },
    {
      messages: messages.reportMy,
      url: 'report/my',
    },
    {
      messages: messages.favorite,
      url: 'favorites',
    },
  ];

  cviews = [
    {
      messages: messages.announcement,
      url: 'announcement',
    }, {
      messages: messages.studyRoute,
      url: 'learningMap',
    }, {
      messages: messages.reportDepartment,
      url: 'report/dept?type=login',
    }, {
      messages: messages.attendance,
      url: 'sign-in-record',
    }, {
      messages: messages.infoCollection,
      url: 'info-collection',
    }, {
      messages: messages.tel,
      url: 'tel',
    }, {
      messages: messages.join,
      url: 'join',
    }, {
      messages: messages.setting,
      url: 'setting',
    },
  ];

  render() {
    const { newMessage, hasDepartmentReportModule, hasStudyMapModule, hasInfoCollectionModule, hasLiving } = this.props;
    return (
      <div className="todo-list">
        <ul className="views">
          {
            this.views.map((view, index) => {
              if (view.url === 'lives' && !hasLiving) {
                return null;
              }
              return (<li key={index}>
                <Link to={view.url}><FormattedMessage id={view.messages.id} /></Link>
              </li>);
            })
          }
        </ul>
        <ul className="views">
          {
            this.cviews.map((view, index) => {
              if (__platform__.dingtalk && view.url === 'announcement') {
                return null;
              }
              if (view.url === 'report/dept?type=login' && !hasDepartmentReportModule) {
                return null;
              }
              if (view.url === 'learningMap' && !hasStudyMapModule) {
                return null;
              }
              if (view.url === 'info-collection' && !hasInfoCollectionModule) {
                return null;
              }
              const className = classNames(getNewMsg(newMessage, view.url));

              if (view.url === 'tel') {
                return (
                  <li key={index}>
                    <a href="tel:0592-5027052" className={`${className} concat-us`}>
                      <FormattedMessage id={view.messages.id} />
                      <span className="tel">0592-5027052</span>
                    </a>
                  </li>
                );
              }

              if (view.url === 'join') {
                if (!__platform__.dingtalk) return null;
                return (
                  <li key={index}>
                    <a href="https://t.dingtalk.com/invite/index?code=23e4f3e0c1" className={className}>
                      <FormattedMessage id={view.messages.id} />
                    </a>
                  </li>
                );
              }

              return (<li key={index}>
                <Link to={view.url} className={className}>
                  <FormattedMessage id={view.messages.id} />
                </Link>
              </li>);
            })
          }
        </ul>
      </div>
    );
  }
}

TodoList.propTypes = {
  newMessage: PropTypes.object.isRequired,
  hasDepartmentReportModule: PropTypes.bool.isRequired,
  hasStudyMapModule: PropTypes.bool.isRequired,
  hasInfoCollectionModule: PropTypes.bool.isRequired,
  hasLiving: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  newMessage: state.newMessage.newMessage || {},
  hasDepartmentReportModule: hasDepartmentReportModuleSelector(state),
  hasStudyMapModule: hasStudyMapModuleSelector(state),
  hasInfoCollectionModule: hasInfoCollectionModuleSelector(state),
  hasLiving: hasLivingSelector(state),
});


export default connect(mapStateToProps)(withAuth(TodoList));
