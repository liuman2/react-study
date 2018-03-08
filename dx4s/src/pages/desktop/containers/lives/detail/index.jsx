import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';

import Info from './info';
import Desc from './desc';
import Content from './content';
import DxHeader from '../../../components/header';
import DxFooter from '../../../components/footer';
import { live as liveActions } from '../../../actions';
import './styles.styl';
import messages from '../messages';

const propTypes = {
  actions: PropTypes.object.isRequired,
  fetchParams: PropTypes.object.isRequired,
};

class Detail extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      activeTab: 'desc',
    };

    this.onTab = ::this.onTab;
    this.renderDetail = ::this.renderDetail;
    this.onLiveNodeClick = ::this.onLiveNodeClick;
  }

  onTab(tab) {
    this.setState({ activeTab: tab });
  }

  onLiveNodeClick(liveNode) {
    const { fetchParams, actions } = this.props;
    switch (liveNode.status) {
      case 'over':
        if (!liveNode.hasRecord) {
          return;
        }
        actions.fetchRecordUrl(fetchParams.liveId, liveNode.id);
        break;
      case 'on_live':
        actions.fetchLiveUrl(fetchParams.liveId, liveNode.id);
        break;
      default:
        break;
    }
    // actions.fetchLiveUrl(fetchParams.liveId);
  }

  renderDetail() {
    if (this.state.activeTab === 'desc') {
      return <Desc {...this.props} />;
    }
    return <Content {...this.props} onLiveNodeClick={this.onLiveNodeClick} />;
  }

  render() {
    return (
      <div>
        <DxHeader />
        <div className="dx-container course">
          <Info {...this.props} />
          <ul className="tabs">
            <li className={`tab ${this.state.activeTab === 'desc' ? 'active' : ''}`} onClick={() => this.onTab('desc')}>
              <FormattedMessage {...messages.courseDesc} />
            </li>
            <li className={`tab ${this.state.activeTab === 'content' ? 'active' : ''}`} onClick={() => this.onTab('content')}>
              <FormattedMessage {...messages.liveCatalog} />
            </li>
          </ul>
          {this.renderDetail()}
        </div>
        <DxFooter />
      </div>
    );
  }

}

// const Detail = props => (
//   <div>
//     <DxHeader />
//     <div className="dx-container course">
//       <Info {...props} />
//       <ul className="tabs">
//         <li className="tab active">
//           <FormattedMessage {...messages.courseDesc} />
//         </li>
//         <li className="tab">
//           <FormattedMessage {...messages.liveCatalog} />
//         </li>
//       </ul>
//       <Desc {...props} />
//     </div>
//     <DxFooter />
//   </div>
// );

// export default Detail;

Detail.propTypes = propTypes;

const mapStateToProps = (state, ownProps) => ({
  fetchParams: {
    liveId: ownProps.params.live_id,
  },
  url: state.live.url,
  recordUrl: state.live.recordUrl,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(Object.assign({}, liveActions), dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Detail);
