import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { signIn as singInAction } from '../../actions';

class SignInIcon extends React.Component {
  static contextTypes = {
    router: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.onSignClick = ::this.onSignClick;
  }

  componentDidMount() {
    this.props.fetchIsSigned();
  }

  onSignClick() {
    this.props.signInFromHome();
    this.context.router.push('sign-in-record');
  }

  render() {
    return (
      <div className="sign-in-wrap">
        {
          !this.props.is_Signed ? (<div className="sign-in">
              <a onClick={this.onSignClick}>
                <FormattedMessage id="app.home.signIn" />
              </a>
            </div>) : ''
        }
      </div>
    );
  }

}

SignInIcon.propTypes = {
  is_Signed: React.PropTypes.bool,
  fetchIsSigned: React.PropTypes.func,
  signInFromHome: React.PropTypes.func,
};
const mapStateToProps = state => ({
  is_Signed: state.signIn.is_signed,
});
const mapDispatchToProps = { fetchIsSigned: singInAction.fetchIsSigned, signInFromHome: singInAction.signInFromHome };

export default connect(mapStateToProps, mapDispatchToProps)(SignInIcon);
