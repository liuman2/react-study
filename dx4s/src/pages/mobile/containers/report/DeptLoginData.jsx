import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Circle, Line } from 'rc-progress';
import messages from './messages';

import './DeptLoginData.styl';
import veinsLeft from './imgs/veins-left.png';
import veinsRight from './imgs/veins-right.png';
import arrowRight from './imgs/arrow-right.png';

function circleOptionsLastWeek() {
  return {
    trailWidth: 3,
    strokeWidth: 3,
    trailColor: '#c3e6ff',
    strokeColor: '#38acff',
  };
}

function circleOptionsLastMonth() {
  return {
    trailWidth: 3,
    strokeWidth: 3,
    trailColor: '#fcdac7',
    strokeColor: '#f48644',
  };
}

function circleOptionsThisMonth() {
  return {
    trailWidth: 3,
    strokeWidth: 3,
    trailColor: '#d9eeca',
    strokeColor: '#82c650',
  };
}

function lineOptionsRate() {
  return {
    trailWidth: 3,
    strokeWidth: 3,
    trailColor: 'transparent',
    strokeColor: '#ffc03c',
  };
}

function lineOptionsTime() {
  return {
    trailWidth: 3,
    strokeWidth: 3,
    trailColor: 'transparent',
    strokeColor: '#38acff',
  };
}

class DeptLoginData extends Component {
  constructor(...args) {
    super(...args);
  }

  onClickLink(type) {
    if (this.props.isCanOpen) this.context.router.push({ pathname: 'report/dept-rank', query: { type } });
  }

  getIntl = id => this.context.intl.messages[`app.report.DeptReportLearningData.${id}`];

  render() {
    const {
      departmentId, isCanOpen, thisMonthIsNoData,
      lastWeekPercent, lastWeekLoginNum, lastWeekLoginNumStatus, lastWeekNotLoginNum,
      lastWeekOnlineRate, lastWeekOnlineTime,
      lastMonthPercent, lastMonthLoginNum, lastMonthLoginNumStatus, lastMonthNotLoginNum,
      lastMonthOnlineRate, lastMonthOnlineTime,
      thisMonthPercent, thisMonthLoginNum, thisMonthNotLoginNum,
      thisMonthOnlineRate, thisMonthOnlineTime,
    } = this.props;
    const lastWeekClassName = classNames('num',
    { increase: lastWeekLoginNumStatus === 'rising' },
    { decrease: lastWeekLoginNumStatus === 'falling' });
    const lastMonthClassName = classNames('num',
    { increase: lastMonthLoginNumStatus === 'rising' },
    { decrease: lastMonthLoginNumStatus === 'falling' });
    // const thisMonthClassName
    let max = Math.max(lastWeekOnlineTime, lastMonthOnlineTime, thisMonthOnlineTime);
    if (max === 0) max = 1;
    const lastWeekLinePercent = (lastWeekOnlineTime / max) * 100;
    const lastMonthLinePercent = (lastMonthOnlineTime / max) * 100;
    const thisMonthLinePercent = (thisMonthOnlineTime / max) * 100;
    return (
      <div className="login-data">
        <div className="title">
          <img src={veinsLeft} role="presentation" />
          <span><FormattedMessage {...messages.loginNumber} /></span>
          <img src={veinsRight} role="presentation" />
        </div>
        <div className="circles">
          <Link to={`report/dept-not-logged/${departmentId}?type=lw`} className="circle">
            <div className="graph">
              <Circle percent={lastWeekPercent} {...circleOptionsLastWeek()} style={{ height: '100%' }} />
              <div className={lastWeekClassName}>{lastWeekLoginNum}</div>
            </div>
            <div className="info">
              <div className="desc"><FormattedMessage {...messages.lastWeekLogin} /></div>
              <div className="data"><FormattedMessage {...messages.notLogged} />: {lastWeekNotLoginNum} &gt;</div>
            </div>
          </Link>
          <Link to={`report/dept-not-logged/${departmentId}?type=lm`} className="circle">
            <div className="graph">
              <Circle percent={lastMonthPercent} {...circleOptionsLastMonth()} style={{ height: '100%' }} />
              <div className={lastMonthClassName}>{lastMonthLoginNum}</div>
            </div>
            <div className="info">
              <div className="desc"><FormattedMessage {...messages.lastMonthLogin} /></div>
              <div className="data"><FormattedMessage {...messages.notLogged} />: {lastMonthNotLoginNum} &gt;</div>
            </div>
          </Link>
          <Link to={`report/dept-not-logged/${departmentId}?type=tm`} className="circle">
            <div className="graph">
              <Circle percent={thisMonthPercent} {...circleOptionsThisMonth()} style={{ height: '100%' }} />
              <div className="num">{thisMonthLoginNum}</div>
            </div>
            <div className="info">
              <div className="desc"><FormattedMessage {...messages.thisMonthLogin} /></div>
              <div className="data">
                {
                  thisMonthIsNoData ?
                    <FormattedMessage {...messages.noData} />
                    :
                    <span><FormattedMessage {...messages.notLogged} />: {thisMonthNotLoginNum} &gt;</span>
                }
              </div>
            </div>
          </Link>
        </div>
        <div className="lines">
          <div className="explain">
            <FormattedMessage {...messages.activityRate} />
            { __platform__.dingtalk ? '' : <FormattedMessage {...messages.dailyOnlineTime} /> }
          </div>
          <div className="tips">
            &lceil;<FormattedMessage {...messages.tips} />&rfloor;
          </div>
          <div className="line" onClick={() => this.onClickLink('lw')}>
            <div className="first"><FormattedMessage {...messages.lastWeek} /></div>
            <div className="second">
              <div className="online">
                <Line percent={lastWeekOnlineRate * 0.5} {...lineOptionsRate()} />
                <div className="percent" style={{ left: `${(lastWeekOnlineRate * 0.5) + 5}%` }} >
                  {lastWeekOnlineRate}%
                </div>
              </div>
              { __platform__.dingtalk ? '' : <div className="online">
                <Line percent={lastWeekLinePercent * 0.5} {...lineOptionsTime()} />
                <div className="percent" style={{ left: `${(lastWeekLinePercent * 0.5) + 5}%` }} >
                  {lastWeekOnlineTime}<FormattedMessage {...messages.minute} />
                </div>
              </div> }
            </div>
            {isCanOpen ? <div className="third"><img src={arrowRight} alt="" /></div> : null}
          </div>
          <div className="line" onClick={() => this.onClickLink('lm')}>
            <div className="first"><FormattedMessage {...messages.lastMonth} /></div>
            <div className="second">
              <div className="online">
                <Line percent={lastMonthOnlineRate * 0.5} {...lineOptionsRate()} />
                <div className="percent" style={{ left: `${(lastMonthOnlineRate * 0.5) + 5}%` }} >
                  {lastMonthOnlineRate}%
                </div>
              </div>
              { __platform__.dingtalk ? '' : <div className="online">
                <Line percent={lastMonthLinePercent * 0.5} {...lineOptionsTime()} />
                <div className="percent" style={{ left: `${(lastMonthLinePercent * 0.5) + 5}%` }} >
                  {lastMonthOnlineTime}<FormattedMessage {...messages.minute} />
                </div>
              </div> }
            </div>
            {isCanOpen ? <div className="third"><img src={arrowRight} alt="" /></div> : null}
          </div>
          {
            thisMonthIsNoData ?
              <div className="line">
                <div className="first"><FormattedMessage {...messages.thisMonth} /></div>
                <div className="second"><FormattedMessage {...messages.noData} /></div>
              </div>
              :
              <div className="line" onClick={() => this.onClickLink('tm')}>
                <div className="first"><FormattedMessage {...messages.thisMonth} /></div>
                <div className="second">
                  <div className="online">
                    <Line percent={thisMonthOnlineRate * 0.5} {...lineOptionsRate()} />
                    <div className="percent" style={{ left: `${(thisMonthOnlineRate * 0.5) + 5}%` }} >
                      {thisMonthOnlineRate}%
                    </div>
                  </div>
                  { __platform__.dingtalk ? '' : <div className="online">
                    <Line percent={thisMonthLinePercent * 0.5} {...lineOptionsTime()} />
                    <div className="percent" style={{ left: `${(thisMonthLinePercent * 0.5) + 5}%` }} >
                      {thisMonthOnlineTime}<FormattedMessage {...messages.minute} />
                    </div>
                  </div> }
                </div>
                {isCanOpen ? <div className="third"><img src={arrowRight} alt="" /></div> : null}
              </div>
            }
        </div>
      </div>
    );
  }
}

DeptLoginData.contextTypes = {
  router: React.PropTypes.object,
  intl: React.PropTypes.object,
};

DeptLoginData.propTypes = {
  departmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isCanOpen: PropTypes.bool,
  thisMonthIsNoData: PropTypes.bool,

  lastWeekPercent: PropTypes.number,
  lastWeekLoginNum: PropTypes.number,
  lastWeekLoginNumStatus: PropTypes.string,
  lastWeekNotLoginNum: PropTypes.number,
  lastWeekOnlineRate: PropTypes.number,
  lastWeekOnlineTime: PropTypes.number,

  lastMonthPercent: PropTypes.number,
  lastMonthLoginNum: PropTypes.number,
  lastMonthLoginNumStatus: PropTypes.string,
  lastMonthNotLoginNum: PropTypes.number,
  lastMonthOnlineRate: PropTypes.number,
  lastMonthOnlineTime: PropTypes.number,

  thisMonthPercent: PropTypes.number,
  thisMonthLoginNum: PropTypes.number,
  // thisMonthLoginNumStatus: PropTypes.string,
  thisMonthNotLoginNum: PropTypes.number,
  thisMonthOnlineRate: PropTypes.number,
  thisMonthOnlineTime: PropTypes.number,
};

export default DeptLoginData;
