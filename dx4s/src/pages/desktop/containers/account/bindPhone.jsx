import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import api from 'utils/api';
import { withRouter } from 'react-router';
import urlParam from 'utils/urlParam';
import { FormattedMessage } from 'react-intl';
import './account.styl';
import { account as accountActions } from '../../actions';
import logo from './img/logo.png';
import Errors from './errors.jsx';
import DxFooter from '../../components/footer';
import messages from './messages';
import banner from './img/banner.png';
import icon_1 from './img/icon_1.png';
import icon_2 from './img/icon_2.png';
import icon_3 from './img/icon_3.png';
import icon_4 from './img/icon_4.png';

// const contextTypes = {
//     intl: React.PropTypes.object.isRequired,
// };

// const propTypes = {
//   router: React.PropTypes.object.isRequired,
// };
const tenantCode = urlParam('t');

class bindPhone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tel: '',
      code: '',
      getCodes: false,
      time: 60,
      telReg: false,
      isErrorShow: false,
      errorContent: '',
      isConfirmOpen: false,
    };
    this.phoneTime = 0;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.getCode = this.getCode.bind(this);
    this.jump = this.jump.bind(this);
  }

  componentWillUnmount() {
    this.phoneTime = 0;
    clearInterval(this.phoneTime);
  }
  getCode() {
    const self = this;
    if (this.state.getCodes === false) {
      api({
        method: 'GET',
        url: '/account/account/sendValidateCode?mobile_phone=' + this.tel.value,
      })
      .then((res) => {
        this.setState(Object.assign({}, this.state, {
          getCodes: true,
        }));
        self.phoneTime = setInterval(function () {
          if (self.state.time !== 0) {
            self.setState(Object.assign({}, self.state, {
              time: self.state.time - 1,
            }));
          } else {
            self.setState(Object.assign({}, self.state, {
              getCodes: false,
              time: 60,
            }));
            clearInterval(self.phoneTime);
          }
        }, 1000);
      })
      .catch((err) => {
        self.setState(Object.assign({}, self.state, {
          errorContent: err.response.data.message,
          isErrorShow: true,
        }));
      });
    }
  }
  handleChange() {
    this.setState({
      tel: this.tel.value,
      code: this.code.value,
    });
    if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.tel.value))) {
      this.setState(Object.assign({}, this.state, {
        telReg: false,
        isErrorShow: false,
      }));
    } else {
      this.setState(Object.assign({}, this.state, {
        telReg: true,
        isErrorShow: false,
      }));
    }
  }
  handleSubmit() {
    const self = this;
    const { router, actions } = this.props;
    if (!this.tel.value || !this.code.value)
    {
      this.setState(Object.assign({}, this.state, {
        isErrorShow: true,
        errorContent: <FormattedMessage {...messages.messageAll} />,
      }));
      // setTimeout(() => self.setState({ isToastShow: false }), 3000);
      return false;
    }
    api({
      method: 'GET',
      url: '/account/account/bindMobilePhone?mobile_phone=' + this.tel.value + '&validate_code=' + this.code.value,
    })
    .then((res) => {
      actions.setUserPhone(this.tel.value);
      router.replace('/');
    })
    .catch((err) => {
      self.setState(Object.assign({}, self.state, {
        errorContent: err.response.data.message,
        isErrorShow: true,
      }));
    });
  }

  jump() {
    const { router } = this.props;
    router.replace('/');
  }

  render() {
    const logoUlr = (tenantCode && !__PLATFORM__.DINGTALKPC )? `https://e.91yong.com/${tenantCode}/img/logo.png` : logo;
    return (
      <div id="account">
        <div id="accountNav">
          <div className="top" onClick={this.test}><img src={logoUlr} /></div>
        </div>
        <div id="accountContent" style={{ background: '#f2f4f8' }}>
          <div className="content">
            <div className="form2 form1">
              <div className="formBox" style={{ padding: '20px' }}>
                <div className="formInput">
                  <Errors
                    isOpen={this.state.isErrorShow}
                    timeout={3000}
                  >{this.state.errorContent}</Errors>
                  <img src={icon_1} alt="icon" />
                  <input
                    type="text" name="tel" placeholder={this.context.intl.messages['app.account.inputTel']}
                    ref={(ref) => { this.tel = ref; }}
                    onChange={this.handleChange}
                  />
                </div>
                <div className="formInput">
                  <img src={icon_4} alt="icon" />
                  <input
                    type="text" name="code" placeholder={this.context.intl.messages['app.account.inputCode']} className="code"
                    ref={(ref) => { this.code = ref; }}
                    onChange={this.handleChange}
                  />
                  <div className="line"></div>
                  { this.state.telReg ? this.state.getCodes ? <div className="codeImg">{this.state.time + 's'}</div> : <div className="codeImg" onClick={this.getCode}><FormattedMessage {...messages.getCode} /></div> : <div className="codeImg" style={{ color: '#ccc' }}><FormattedMessage {...messages.getCode} /></div> }
                </div>
                <div className="formBtn" style={{ margin: '20px auto' }}>
                  <button onClick={this.handleSubmit}><FormattedMessage {...messages.submit} /></button>
                  <a onClick={this.jump}><button style={{ background: '#585a5c', margin: '20px auto' }}><FormattedMessage {...messages.jump} /></button></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DxFooter
          theme={'white'}
        ></DxFooter>
      </div>
    );
  }
}

bindPhone.contextTypes = {
  intl: React.PropTypes.object.isRequired,
  router: React.PropTypes.object,
};

const mapStateToProps = state => ({
  userInfo: state.account.user,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(accountActions, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(bindPhone));


// bindPhone.propTypes = propTypes;
// bindPhone.contextTypes = contextTypes;
// export default withRouter(bindPhone);
