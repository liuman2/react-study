import React, { PropTypes } from 'react';

function PassTimeTip(props) {
  const {
    time,
    closeTip = () => { },
  } = props;

  const formatTime = function getFormatTime() {
    let passTime = time;
    if (typeof time !== 'number') {
      passTime = Number(time);
    }
    let second = passTime % 60;
    passTime = Math.floor(passTime / 60);
    let minute = passTime % 60;
    let hour = Math.floor(passTime / 60);
    if (second < 10) second = `0${second}`;
    if (minute < 10) minute = `0${minute}`;
    if (hour < 10) hour = `0${hour}`;
    return `${hour}:${minute}:${second}`;
  };

  return (
    <div className="pass-time-tip">
      {`完成当前课件学习还需要 ${formatTime(time)}，加油哦！`}
      <a className="close" onClick={() => closeTip()} />
    </div>
  );
}

const { number } = React.PropTypes;

PassTimeTip.propTypes = {
  time: number.isRequired,
  closeTip: PropTypes.func.isRequired,
};
export default PassTimeTip;