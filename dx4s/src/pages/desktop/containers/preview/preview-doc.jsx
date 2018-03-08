import React from 'react';
import { connect } from 'react-redux';
import { setHasRead, recordToHistory } from 'dxActions/preview';
import {
  nodeIdSelector,
  isNodePassed,
  getShouldGoAhead,
  getElapse,
  getPassTime,
} from './selectors';
import PassTimeTip from './preview-tip';
import DocViewer from '../../components/doc-viewer';

class DocPreviewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetched: !this.props.pass,
      showTip: true,
    };
    this.passDoc  = ::this.passDoc;
    this.closeTip = ::this.closeTip;
    if (!this.props.pass && !this.props.passTime) {
      this.props.setHasRead();
    }
  }

  componentDidMount() {
    const { shouldGoAhead, elapse, passTime } = this.props;
    if (shouldGoAhead) {
      this.viewer.scrollTo(elapse || 1);
    }

    // 文档在多页的情况下  按下一页才能设置已读
    // 该段代码处理文档只有一页时不需要按下一页
    if (this.props.isNodePassed) return;
    if (this.props.urls.length === 1 && this.props.pass === 1) {
      setTimeout(() => {
        this.onPageTurn(1);
      }, 3000);
    }

    if (passTime) {
      this.passDoc();
    }
  }

  componentWillUnmount() {
    this.startTime = null;
    clearInterval(this.viewTimer);
  }

  async onPageTurn(page) {
    this.props.recordToHistory(page); // 如果page没指定默认为第一页
    if (this.props.isNodePassed) return;

    const { passTime } = this.props;
    if (passTime) {
      return;
    }

    if (page >= this.props.pass && !this.state.isFetched) {
      await this.props.setHasRead();
      this.setState({ isFetched: true });
    }
  }

  passDoc() {
    const { passTime } = this.props;
    if (!this.startTime) this.startTime = Date.now();
    this.viewTimer = setInterval(() => {
      const dtEndTime = new Date();
      const seconds = Math.round(Math.abs(dtEndTime - this.startTime) / 1000);
      console.log(seconds)
      if (seconds === passTime || passTime === 0) {
        this.props.setHasRead();
        this.setState({ isFetched: true });
      }
    }, 1000);
  }

  closeTip() {
    this.setState({ showTip: false });
  }

  render() {
    const { passTime } = this.props;
    return (
      <div>
        {(!this.props.isNodePassed && passTime && this.state.showTip) && <PassTimeTip time={passTime} closeTip={this.closeTip} />}
        <DocViewer
          fullScreenMode={this.props.fullScreenMode}
          ref={(ref) => { this.viewer = ref; }}
          key={this.props.nodeId}
          imageUrls={this.props.urls}
          onPageTurn={page => this.onPageTurn(page)}
        />
      </div>
    );
  }
}

DocPreviewer.propTypes = {
  nodeId: React.PropTypes.string,
  setHasRead: React.PropTypes.func,
  recordToHistory: React.PropTypes.func,
  elapse: React.PropTypes.number,
  urls: React.PropTypes.arrayOf(React.PropTypes.string),
  pass: React.PropTypes.number,
  isNodePassed: React.PropTypes.bool,
  shouldGoAhead: React.PropTypes.bool,
  fullScreenMode: React.PropTypes.bool,
  passTime: React.PropTypes.number,
};

const mapStateToProps = state => ({
  urls: state.course.nodes[state.preview.node_id].url,
  pass: state.course.nodes[state.preview.node_id].pass,
  nodeId: nodeIdSelector(state),
  isNodePassed: isNodePassed(state),
  elapse: getElapse(state),
  shouldGoAhead: getShouldGoAhead(state),
  fullScreenMode: state.preview.fullScreenMode,
  passTime: getPassTime(state),
});

const mapDispatchToProps = { setHasRead, recordToHistory };

export default connect(mapStateToProps, mapDispatchToProps)(DocPreviewer);
