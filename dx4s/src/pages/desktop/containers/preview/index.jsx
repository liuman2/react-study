import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import classnames from 'classnames';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import { checkIsEceibs, checkIfAuthed } from 'utils/3rd/eceibs';

import {
  turnToNode,
  initPreview,
  turnToNextNode,
  turnToPrevNode,
  fetchDoneStatus,
  enterFullScreenMode,
  exitFullScreenMode,
  fetchCourseOrderStatus,
  fetchHistory,
  continueToLearn,
  recordToHistory,
} from 'dxActions/preview';

import {
  fetchChapter,
} from 'dxActions/course';

import Sidebar from 'components/sidebar';

import * as selectors from './selectors';
import messages from './messages';

import Alert from '../../components/alert';
import ImagePreviewer from './preview-image';
import H5Previewer from './preview-h5';
import DocPreviewer from './preview-doc';
import MediaPreviewer from './preview-media';
import PracticePreviewer from './preview-practice';
import SurveyPreviewer from './preview-survey';

import './preview.styl';
import iconIndex from './img/icon-index.png';
import iconReturn from './img/icon-return.png';
import iconPrev from './img/icon-prev.png';
import iconNext from './img/icon-next.png';

import NodeList from './node-list';

class Preview extends React.Component {
  constructor() {
    super();
    this.alertMessage = '';
    this.state = {
      openSidebar: true,
      lecturer: '',
      courseName: '',
      coverSrc: '',
      showAlert: false,
      errorCode: 200,
      intervalTime: 0,
      passTime: 0,
    };
    this.toggleSidebar = ::this.toggleSidebar;
    this.getIntl = ::this.getIntl;
    this.generateOnLeaveHook = ::this.generateOnLeaveHook;
    this.getIntervalTime = ::this.getIntervalTime;
  }

  componentWillMount() {
    // eslint-disable-next-line react/prop-types
    this.props.fetchHistory(this.props.params.course_id);
  }

  async componentDidMount() {
    this.props.exitFullScreenMode();
    // eslint-disable-next-line react/prop-types
    const { plan_id, solution_id, course_id } = this.props.params;
    const query = { plan_id, solution_id, course_id };
    let course;
    let errCode;
    await Promise.all([
      this.props.fetchCourseOrderStatus(query),
      this.props.fetchChapter(query),
    ])
    .then((res) => {
      course = res[0];
    })
    .catch((err) => {
      const { response: { data: { message, errorCode } } } = err;
      errCode = errorCode;
      if (errorCode === 400) {
        this.alertMessage = message;
        this.setState({
          errorCode,
        });
      }
    });
    if (errCode === 400) {
      return;
    }
    // warn when leaving page
    this.props.router.setRouteLeaveHook(this.props.route, this.generateOnLeaveHook());
    if (!__PLATFORM__.DINGTALKPC) window.onbeforeunload = this.generateOnLeaveHook(true);
    const { lecturer_name: lecturer, thumbnail_url: coverSrc, course_name: courseName } = course;
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ lecturer, coverSrc, courseName });
    this.props.fetchDoneStatus();
    const params = this.props.location.query;
    const shouldContinue = Object.prototype.hasOwnProperty.call(params, 'continue');
    const latestNodeId = this.props.latestNodeId;
    if (shouldContinue && latestNodeId) {
      this.props.continueToLearn();
      this.props.turnToNode(plan_id, solution_id, course_id, latestNodeId);
    } else {
      this.props.turnToNode(plan_id, solution_id, course_id, params.node_id);
      this.props.recordToHistory();
    }
  }

  componentWillReceiveProps({ nodeId, resourceUrl, nodeType }) {
    if (this.props.nodeId !== nodeId) this.props.recordToHistory();
    if (nodeType === 'h5' && checkIsEceibs(resourceUrl) && !checkIfAuthed()) {
      window.onbeforeunload = null;
    }
  }

  componentWillUnmount() {
    this.props.initPreview();
    this.props.exitFullScreenMode();
    window.onbeforeunload = null;
  }

  getIntl(type) {
    return this.context.intl.messages[`app.preview.${type}`];
  }

  getIntervalTime(readTime, pt) {
    this.setState({ intervalTime: readTime, passTime: pt });
  }

  getPreviewer() {
    const type = this.props.nodeType;
    switch (type) {
      case 'video':
      case 'audio':
        return <MediaPreviewer />;
      case 'h5':
        return <H5Previewer getIntervalTime={this.getIntervalTime} />;
      case 'doc':
        return <DocPreviewer />;
      case 'img':
        return <ImagePreviewer />;
      case 'survey':
        return <SurveyPreviewer />;
      case 'practice':
        return <PracticePreviewer />;
      default:
        return null;
    }
  }

  generateOnLeaveHook(forceInMessage) {
    return () => {
      const { passedNodeCount, nodesLength, isPassed, nodeType, nodeId, params } = this.props;
      const { intervalTime, passTime } = this.state;
      try {
        if (!isPassed && nodeType === 'h5') {
          api({
            method: 'PUT',
            url: `/training/plan/${params.plan_id}/solution/${params.solution_id}/course/${params.course_id}/chapter-node/${nodeId}/time/${intervalTime > passTime ? passTime : intervalTime}`,
          });
        }
      } catch (err) {
      }

      if (passedNodeCount === nodesLength && !forceInMessage) return true;
      return this.getIntl('message.leave');
    };
  }

  canTurnNext() {
    const { isOrdered, isPassed, isLastNode } = this.props;
    const isUnorderedCourse = !isOrdered;
    return (isUnorderedCourse || isPassed) && !isLastNode;
  }

  toggleSidebar() {
    const { openSidebar } = this.state;
    setTimeout(() => {
      if (openSidebar) this.props.enterFullScreenMode();
      else this.props.exitFullScreenMode();
    }, 500);
    this.setState({ openSidebar: !openSidebar });
  }

  goBack = () => {
    const leave = this.generateOnLeaveHook()();
    const canLeave = leave === true;
    const message = typeof leave === 'string' ? leave : null;
    if (canLeave || !__PLATFORM__.DINGTALKPC) {
      this.props.router.goBack();
      return;
    }
    if (__PLATFORM__.DINGTALKPC) {
      window.DingTalkPC.device.notification.confirm({
        message,
        title: '',
        buttonLabels: [this.getIntl('confirm.true'), this.getIntl('confirm.false')],
        onSuccess: ({ buttonIndex }) => {
          if (buttonIndex === 0) this.props.router.goBack();
        },
      });
    }
  };

  render() {
    const previewer = this.getPreviewer();
    const canTurnNext = this.canTurnNext();

    const { isFirstNode } = this.props;
    const { openSidebar, courseName, coverSrc, lecturer } = this.state;
    const toggleSidebar = this.toggleSidebar;
    const wrapperClass = classnames(
      'previewer-wrapper',
      { 'previewer-wrapper-full-screen': !this.state.openSidebar }
    );
    return (
      <div>
        <Sidebar
          isOpen={openSidebar}
          pullRight
          operations={[
            { onClick: toggleSidebar, content: this.getIntl('sidebar.index'), icon: iconIndex },
            { onClick: this.props.turnToPrevNode, content: this.getIntl('sidebar.prev'), icon: iconPrev, disabled: isFirstNode },
            { onClick: this.props.turnToNextNode, content: this.getIntl('sidebar.next'), icon: iconNext, disabled: !canTurnNext },
            { onClick: this.goBack, content: this.getIntl('sidebar.return'), icon: iconReturn },
          ]}
        >
          <header className="preview-sidebar">
            <div className="sidebar-description">
              <div className="sidebar-title">{courseName}</div>
              <div className="sidebar-lecture">
                <FormattedMessage {...messages.lecturer} />{lecturer}
              </div>
            </div>
            <img src={coverSrc} alt={courseName} />
          </header>
          <NodeList onBlockedNodeClick={() => this.setState({ showAlert: true })} />
        </Sidebar>
        <div className={wrapperClass}>
          <div className="previewer-con" key={this.props.nodeId}>
            {previewer}
          </div>
        </div>
        <Alert
          imgType="prompt"
          onRequestClose={() => this.setState({ showAlert: false })}
          timeout={3000}
          isShow={this.state.showAlert}
        >
          <FormattedMessage {...messages.continueLearningMessage} />
        </Alert>
        <Alert
          isShow={this.state.errorCode === 400}
          timeout={3000}
          imgType="prompt"
        >
          <span>{this.alertMessage}</span>
        </Alert>
      </div>
    );
  }
}

Preview.contextTypes = {
  router: React.PropTypes.object.isRequired,
  intl: React.PropTypes.object.isRequired,
};

const { bool, number, string } = React.PropTypes;

Preview.propTypes = {
  // router
  location: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
  router: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
  route: React.PropTypes.object, // eslint-disable-line react/forbid-prop-types
  // actions
  fetchCourseOrderStatus: React.PropTypes.func,
  initPreview: React.PropTypes.func,
  fetchChapter: React.PropTypes.func,
  turnToNode: React.PropTypes.func,
  turnToNextNode: React.PropTypes.func,
  turnToPrevNode: React.PropTypes.func,
  fetchDoneStatus: React.PropTypes.func,
  enterFullScreenMode: React.PropTypes.func,
  exitFullScreenMode: React.PropTypes.func,
  fetchHistory: React.PropTypes.func,
  continueToLearn: React.PropTypes.func,
  recordToHistory: React.PropTypes.func,
  // states
  isPassed: React.PropTypes.bool,
  isOrdered: React.PropTypes.bool,
  nodeId: React.PropTypes.string,
  nodeType: React.PropTypes.string,
  latestNodeId: React.PropTypes.string,
  isFirstNode: bool,
  isLastNode: bool,
  nodesLength: number,
  passedNodeCount: number,
  resourceUrl: string,
};

const mapStateToProps = state => ({
  isOrdered: selectors.makePreviewPropSelector('is_order')(state),
  nodeName: selectors.getNodeName(state),
  nodesLength: selectors.getNodesLength(state),
  passedNodeCount: selectors.passedNodeCount(state),
  isPassed: selectors.isNodePassed(state),
  nodeType: selectors.getNodeType(state),
  nodeId: selectors.nodeIdSelector(state),
  latestNodeId: selectors.getLatestNodeId(state),
  isFirstNode: selectors.isFirstNodeSelector(state),
  isLastNode: selectors.isLastNodeSelector(state),
  resourceUrl: selectors.nodeUrlSelector(state),
});
const mapDispatchToProps = {
  fetchCourseOrderStatus,
  fetchChapter,
  turnToNode,
  turnToNextNode,
  turnToPrevNode,
  fetchDoneStatus,
  enterFullScreenMode,
  exitFullScreenMode,
  initPreview,
  fetchHistory,
  continueToLearn,
  recordToHistory,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Preview));
