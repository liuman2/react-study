import React from 'react';
import { connect } from 'react-redux';
import { setHasRead } from 'dxActions/preview';

import ImageViewer from '../../components/imageviewer';
import PassTimeTip from './preview-tip';
import { nodeIdSelector, isNodePassed, getPassTime } from './selectors';

class ImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      showTip: true,
    };
    this.closeTip = ::this.closeTip;
  }

  getCurrentTime(seconds) {
    if (this.props.isNodePassed) return;
    const { passTime } = this.props;
    if ((seconds === (passTime || this.props.pass) || (passTime === 0 && this.props.pass === 0)) && !this.state.isFetching) {
      this.props.setHasRead();
      this.setState({ isFetching: true });
    }
  }

  closeTip() {
    this.setState({ showTip: false });
  }

  render() {
    const { passTime } = this.props;
    return (
      <div>
        {(!this.props.isNodePassed && passTime && this.state.showTip) && <PassTimeTip time={passTime} closeTip={this.closeTip} />}
        <ImageViewer
          key={this.props.nodeId}
          imageUrl={this.props.url}
          onTimeCallback={seconds => this.getCurrentTime(seconds)}
        />
      </div>
    );
  }
}

ImagePreview.propTypes = {
  setHasRead: React.PropTypes.func,
  url: React.PropTypes.string,
  pass: React.PropTypes.number,
  nodeId: React.PropTypes.string,
  isNodePassed: React.PropTypes.bool,
  passTime: React.PropTypes.number,
};

/* ImagePreview.defaultProps = {
 query: {
 plan_id: 2661,
 solution_id: 0,
 course_id: 9559,
 node_id: 11609,
 },
 url: 'http://dev-file.xm.duoxue/dev/1/img/74641fa39c8b4b57929013cac5ea761f.jpg',
 pass: 3,
 }*/

const mapStateToProps = state => ({
  nodeId: nodeIdSelector(state),
  url: state.course.nodes[state.preview.node_id].url,
  pass: state.course.nodes[state.preview.node_id].pass,
  isNodePassed: isNodePassed(state),
  passTime: getPassTime(state),
});

const mapDispatchToProps = { setHasRead };

export default connect(mapStateToProps, mapDispatchToProps)(ImagePreview);
