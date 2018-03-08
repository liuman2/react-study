import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Info from './info';
import { nav } from 'utils/dx';
import TodoList from './todo-list';
import Footer from '../../components/footer';
// import RefreshLoad from '../../components/refreshload';
import { newMessage as newMessageActions } from '../../actions';

const propTypes = {
  actions: PropTypes.object.isRequired,
  newMessage: PropTypes.object.isRequired,
};

class Profile extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
    intl: PropTypes.object,
  }

  constructor() {
    super();
    // this.pullDownCallBack = ::this.pullDownCallBack;
    // this.setNavBar = ::this.setNavBar;
    // this.state = {
    //   key: 0,
    // };
  }

  componentDidMount() {
    nav.setTitle({
      title: this.context.intl.messages['app.profile.title'],
    });
    if (!__platform__.dingtalk) {
      this.props.actions.fetchNewMessage();
    }
    // this.refreshDOM.refresh();
  }

  // pullDownCallBack(cb) {
  //   if (__platform__.dingtalk) {
  //     cb();
  //     return;
  //   }
  //   const self = this;
  //   self.props.actions.fetchNewMessage().then(() => {
  //     cb();
  //   });
  // }

  render() {
    // this.setNavBar();
    return (
      <div>
        <div className="profile">
          <Info />
          <TodoList newMessage={this.props.newMessage} />
        </div>
        <Footer />
      </div>
    );
  }
}

Profile.propTypes = propTypes;
const mapStateToProps = (state) => {
  return {
    newMessage: state.newMessage.newMessage || {},
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    actions: bindActionCreators(newMessageActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
