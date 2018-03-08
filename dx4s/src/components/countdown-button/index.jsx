import React, { Component } from 'react';

class CountdownButton extends Component {
  constructor() {
    super();
    this.state = {
      second: 0, // 倒计时（秒）
      disabled: false, // 是否禁用按钮
    };
    this.interval = null;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onClick = () => {
    const onClickProp = this.props.onClick;
    if (!this.state.disabled && onClickProp) onClickProp();
  };

  // 禁用按钮
  disable = () => this.setState({ disabled: true });
  // 弃用按钮
  enable = () => {
    clearInterval(this.interval);
    this.setState({ disabled: false });
  };
  // 进入倒计时并禁用按钮
  startCountdown = (second = 60) => {
    clearInterval(this.interval);
    this.setState({ disabled: true, second });
    this.interval = setInterval(() => {
      const currentSecond = this.state.second;
      if (currentSecond <= 0) return this.enable();
      return this.setState({ second: currentSecond - 1 });
    }, 1000);
  };

  render() {
    const { disabled, second } = this.state;
    const { ...rest } = this.props;
    const countdownSecondsEl = disabled && second
      ? `(${second})`
      : null;

    return (
      <a disabled={disabled} {...rest} onClick={this.onClick}>
        {this.props.children}{countdownSecondsEl}
      </a>
    );
  }
}

const { string, element, oneOfType, func } = React.PropTypes;
CountdownButton.propTypes = {
  children: oneOfType([string, element]),
  onClick: func,
};

export default CountdownButton;
