import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import redirectIfIsEceibs from 'utils/3rd/eceibs';
import api from 'utils/api';
import { setTitle } from 'utils/dx/nav';
import { isiOS } from 'utils/dx/env';
import { passTheNode } from 'dxActions/preview';
import PassTimeTip from './preview-tip';
import {
  nodeIdSelector,
  isNodePassed,
  makeCurrentNodePropSelector,
  makePreviewPropSelector,
  getNodeName,
  getPassTime,
  getReadTime,
} from './selectors';

class H5Previewer extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.iframeLoaded = ::this.iframeLoaded;
    this.closeTip = ::this.closeTip;
    this.state = {
      showTip: true,
      readTime: 0,
      isAlreadyReadTime: 0,
    };
  }
 
  async componentDidMount() {
    if (!this.props.isPassed) {
      const { passTime, alreadyReadTime, getIntervalTime } = this.props;
      this.setState({ isAlreadyReadTime: alreadyReadTime });  
      if (passTime) {
        if (!this.startTime) this.startTime = Date.now();
        this.viewTimer = setInterval(() => {
          const dtEndTime = new Date();
          const seconds = Math.round(Math.abs(dtEndTime - this.startTime) / 1000);

          this.setState({ readTime: seconds });
          getIntervalTime(seconds + alreadyReadTime, passTime);
          if (seconds + alreadyReadTime >= passTime) {
            this.props.passTheNode(this.props.currentNodeId);
            clearInterval(this.viewTimer);
          }
        }, 1000);
        return;
      }

      await this.props.passTheNode(this.props.currentNodeId);
    }
  }

  componentWillUnmount() {
    const { readTime, isAlreadyReadTime } = this.state;
    const { isPassed, passTime, courseId, planId, solutionId, currentNodeId } = this.props;
    const readTimeTotal = readTime + isAlreadyReadTime;
    if (!isPassed) {
      api({
        method: 'PUT',
        url: `/training/plan/${planId}/solution/${solutionId}/course/${courseId}/chapter-node/${currentNodeId}/time/${readTimeTotal > passTime ? passTime : readTimeTotal}`,
      });
    }

    this.startTime = null;    
    clearInterval(this.viewTimer);
  }

  iframeLoaded() {
    const { nodeName: title } = this.props;
    setTitle(title);
  }

  closeTip() {
    this.setState({ showTip: false });
  }

  render() {
    const { resourceUrl, nodeName: title, passTime, alreadyReadTime, isPassed } = this.props;
    const restTime = passTime - alreadyReadTime;
    redirectIfIsEceibs(resourceUrl);
    return (
      <div className="h5-wrapper">
        {(!isPassed && passTime && this.state.showTip) && <PassTimeTip time={ restTime>0 ? restTime : 0 } closeTip={this.closeTip} />}
        <iframe
          title={title}
          className="h5"
          scrolling={isiOS() ? 'no' : 'auto'}
          sandbox="allow-same-origin allow-top-navigation allow-scripts allow-forms"
          src={resourceUrl}
          onLoad={this.iframeLoaded}
          ref={(ref) => { this.iframe = ref; }}
        >
          <div style={{ overflow: 'auto', height: 'auto' }} />
        </iframe>
      </div>
    );
  }
}

H5Previewer.propTypes = {
  // actions
  passTheNode: React.PropTypes.func,
  getIntervalTime: React.PropTypes.func,
  // state
  currentNodeId: React.PropTypes.string,
  isPassed: React.PropTypes.bool,
  resourceUrl: React.PropTypes.string,
  nodeName: React.PropTypes.string,
  passTime: React.PropTypes.number,
  alreadyReadTime: React.PropTypes.number,
  planId: React.PropTypes.string,
  courseId: React.PropTypes.string,
  solutionId: React.PropTypes.string,
};

const getNodeUrl = makeCurrentNodePropSelector('url');
const mapStateToProps = state => ({
  currentNodeId: nodeIdSelector(state),
  isPassed: isNodePassed(state),
  resourceUrl: getNodeUrl(state),
  nodeName: getNodeName(state),
  passTime: getPassTime(state),
  alreadyReadTime: getReadTime(state),
  planId: makePreviewPropSelector('plan_id')(state),
  courseId: makePreviewPropSelector('course_id')(state),
  solutionId: makePreviewPropSelector('solution_id')(state),
});
const mapDispatchToProps = {
  passTheNode,
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(H5Previewer));
