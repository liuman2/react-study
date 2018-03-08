import React from 'react';
import { connect } from 'react-redux';
import LightBox from 'react-image-lightbox';
import { passTheNode } from 'dxActions/preview';
import PassTimeTip from './preview-tip';
import * as selectors from './selectors';

class ImagePreview extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isFetching: false, isOpen: false, showTip: true };
    this.onProgress = ::this.onProgress;
    this.closeTip = ::this.closeTip;
    this.startTime = null;
    this.interval = null;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onProgress() {
    if (!this.startTime) this.startTime = Date.now();
    this.interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.getCurrentTime(seconds);
    }, 1000);
  }

  async getCurrentTime(seconds) {
    if (this.props.isNodePassed) return;
    const { passTime } = this.props;
    if ((seconds === (passTime || this.props.pass) || (passTime === 0 && this.props.pass === 0)) && !this.state.isFetching) {
      await this.props.passTheNode();
      this.setState({ isFetching: true });
    }
  }

  closeTip() {
    this.setState({ showTip: false });
  }

  render() {
    const { nodeName, url, passTime } = this.props;
    return (
      <div className="preview-previewer-image">
        {(!this.props.isNodePassed && passTime && this.state.showTip) && <PassTimeTip time={passTime} closeTip={this.closeTip} />}
        <img
          src={url}
          alt={nodeName}
          onLoad={this.onProgress}
        />
        {
          this.state.isOpen &&
            <LightBox
              mainSrc={url}
              onCloseRequest={() => this.setState({ isOpen: false })}
            />
        }

        <div className="preview-footer">
          <span
            className="preview-footer-icon preview-footer-fullscreen"
            onClick={() => this.setState({ isOpen: true })}
          />
        </div>
      </div>
    );
  }
}

ImagePreview.propTypes = {
  passTheNode: React.PropTypes.func,
  url: React.PropTypes.string,
  pass: React.PropTypes.number,
  nodeName: React.PropTypes.string,
  isNodePassed: React.PropTypes.bool,
  passTime: React.PropTypes.number,
};

const mapStateToProps = state => ({
  nodeId: selectors.nodeIdSelector(state),
  url: state.course.nodes[state.preview.node_id].url,
  pass: state.course.nodes[state.preview.node_id].pass,
  isNodePassed: selectors.isNodePassed(state),
  nodeName: selectors.getNodeName(state),
  passTime: selectors.getPassTime(state),
});

const mapDispatchToProps = { passTheNode };

export default connect(mapStateToProps, mapDispatchToProps)(ImagePreview);
