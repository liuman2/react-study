import React, { Component, PropTypes } from 'react';
import Rate from 'components/rate';
import { FormattedMessage } from 'react-intl';
import { Confirm } from 'components/modal';
import messages from '../messages';
import Connect from '../../../connect';
import { Alert } from '../../../../../components/modal';

class Detail extends Component {
  static contextTypes = {
    router: PropTypes.object,
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      isFold: false,
      isConfirmOpen: false,
      isAlertOpen: false,
    };
    this.closeConfirm = ::this.closeConfirm;
    this.closeAlert = ::this.closeAlert;
    this.handleArrange = ::this.handleArrange;
    this.errorMsg = '';
  }

  componentDidUpdate() {
    const height = this.infoBox.clientHeight;
    const scrollHeight = this.infoBox.scrollHeight;
    if (height >= scrollHeight) {
      this.state.isShowFold = false;
      if (this.unfold) {
        this.unfold.className = 'hidden';
      }
    } else {
      if (this.unfold) {
        this.unfold.className = 'unfold';
      }
    }
  }

  handleArrange() {
    const info = this.props.detail.info;
    const data = {
      plan_id: this.props.params.plan_id,
      course_id: this.props.params.course_id,
      is_arranged: !info.is_arranged,
    };
    this.props.actions.arrangeCourse(data)
    .then(() => {
      if (!data.is_arranged) {
        const query = {
          plan_id: this.props.params.plan_id,
          solution_id: this.props.params.solution_id || 0,
          course_id: this.props.params.course_id,
        };
        this.props.actions.fetchAssement(query);
        this.props.actions.fetchChapter(query);
      }
    })
    .catch((err) => {
      const error = JSON.parse(err.message);
      this.errorMsg = error.message;
      this.setState({ ...this.state, isAlertOpen: true });
    });

    this.setState({ ...this.state, isConfirmOpen: false });
  }

  closeConfirm() {
    this.setState({ ...this.state, isConfirmOpen: false });
  }

  closeAlert() {
    this.setState({ ...this.state, isAlertOpen: false });
    if (window.history > 1) {
      window.history.back();
    } else {
      const router = this.context.router;
      router.replace('/home');
    }
  }

  renderValidStatus() {
    // const { assessment } = this.props;
    const assessment = this.props.course.assessment.info;
    if (!assessment.valid_status) {
      return null;
    }

    const validStatus = assessment.valid_status || '';
    if (validStatus === 'notStarted') {
      return (
        <span className="validstatus not-start"><FormattedMessage id="app.course.statusNotStart" /></span>
      );
    }

    if (validStatus === 'invalid' && !assessment.is_finished && !assessment.valid_click) {
      return (
        <span className="validstatus invalid"><FormattedMessage id="app.course.statusInvalid" /></span>
      );
    }

    if (validStatus === 'valid' && !assessment.is_finished && assessment.valid_time) {
      return (
        <span className="validstatus will-invalid">
          {assessment.valid_time}
        </span>
      );
    }

    return null;
  }

  renderValidTime() {
    const assessment = this.props.course.assessment.info;

    if (!assessment.valid_time_start && !assessment.valid_time_end) {
      return null;
    }

    if (assessment.valid_time_start && assessment.valid_time_end) {
      return (
        <div className="info-validtime">
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTime" />:</span>
          <span className="info-validtime-time">{assessment.valid_time_start}</span>
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeTo" /></span>
          <span className="info-validtime-time">{assessment.valid_time_end}</span>
        </div>
      );
    }

    if (assessment.valid_time_start) {
      return (
        <div className="info-validtime">
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTime" />:</span>
          <span className="info-validtime-time">{assessment.valid_time_start}</span>
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeAfter" /></span>
        </div>
      );
    }

    if (assessment.valid_time_end) {
      return (
        <div className="info-validtime">
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTime" />:</span>
          <span className="info-validtime-time">{assessment.valid_time_end}</span>
          <span className="info-validtime-title"><FormattedMessage id="app.course.studyTimeEnd" /></span>
        </div>
      );
    }

    return null;
  }

  render() {
    const info = this.props.detail.info;
    const assessment = this.props.course.assessment.info;
    const self = this;
    const foldClick = function foldClick() {
      if (self.state.isFold) {
        self.setState({ isFold: false });
        self.infoBox.className = 'summary unshowall';
      } else {
        self.setState({ isFold: true });
        self.infoBox.className = 'summary';
      }
    };

    const confirmMsgId = info.is_arranged ? 'msgWithdraw' : 'msgEnroll';

    const getFolder = function getFolderDiv() {
      let divEle = '';
      if (!self.state.isFold) {
        divEle = (
          <div className="unfold" ref={(ref) => { self.unfold = ref; }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); foldClick(); }} ><FormattedMessage id="app.course.more" /></div>
        );
      } else {
        divEle = (
          <div className="unfold" ref={(ref) => { self.fold = ref; }} onClick={(event) => { event.preventDefault(); event.stopPropagation(); foldClick(); }} ><FormattedMessage id="app.course.hide" /></div>
        );
      }
      return divEle;
    };

    const setRange = function() {
      if (!info.is_elective) {
        return null;
      }

      if (assessment.pass_state === 2) {
        return null;
      }

      if (info.is_arranged) {
        return <a className="opt opt-withdraw" onClick={()=>{ self.setState({ ...self.state, isConfirmOpen: true }); }} ><FormattedMessage id="app.course.withdraw" /></a>;
      }
      return <a className="opt opt-enroll" onClick={()=>{ self.setState({ ...self.state, isConfirmOpen: true }); }} ><FormattedMessage id="app.course.enroll" /></a>;
    };

    return (
      <div className="description">
        <Confirm
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isConfirmOpen}
          onRequestClose={this.closeConfirm}
          onConfirm={this.handleArrange}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
          cancelButton={<span><FormattedMessage id="app.course.cancel" /></span>}
        >
          <span>
            <FormattedMessage
              {...messages[confirmMsgId]}
            />
          </span>
        </Confirm>

        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isAlertOpen}
          onRequestClose={this.closeAlert}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <span>
            {this.errorMsg}
          </span>
        </Alert>

        <div className="title">
          <p className="title-info">{info.course_name}</p>
          {setRange()}
        </div>

        <div className="keyword">
          <span className="caption"><FormattedMessage id="app.course.keywords" />:</span>
          {
            info.labels.map((label, index) => {
              return (
                <span className="tag" key={index}>{label.name}</span>
              );
            })
          }
        </div>
        <div className="line">
          <span className="caption"><FormattedMessage id="app.course.lecture" />:</span>
          <span className="lecture">{info.lecturer_name}</span>
          { this.renderValidStatus() }
        </div>
        <div className="rate-line">
          <span className="caption"><FormattedMessage id="app.course.ratings" />:</span>
          <Rate score={info.star_level} />
        </div>
        { this.renderValidTime() }
        <div className="summary unshowall" ref={(ref) => { self.infoBox = ref; }} dangerouslySetInnerHTML={{ __html: info.course_info_html }} />
        { getFolder()}
        {
          (() => {
            // 选修课
            // if (info.is_elective) {
            //   if (assessment.read_state === undefined) {
            //     return null;
            //   }

            //   if (assessment.read_state < 7) {
            //     return null;
            //   }
            //   return (
            //     <div className={`signet ${assessment.read_state === 7 ? 'course-pass' : 'course-fail'}`}>
            //     </div>
            //   );
            // }

            // 必修课
            if (assessment.is_finished === undefined) {
              return null;
            }
            if (assessment.valid_status === 'notStarted') {
              return null;
            }

            // 有效期内未完成
            if (assessment.valid_status === 'valid' && !assessment.is_finished && !assessment.is_pass) {
              return null;
            }

            // 未学未通过
            if (!assessment.is_finished && !assessment.is_pass && (assessment.valid_time_end !== null || assessment.valid_time_start !== null)) {
              return <div className="signet fail" />;
            }
            // 已学已通过
            if (assessment.is_pass) {
              return <div className="signet pass" />;
            }
            // 已学未通过
            if (assessment.is_finished && !assessment.is_pass) {
              return <div className="signet not-pass" />;
            }

            return null;
          })()
        }
      </div>
    );
  }
}

// export default Detail;
export default Connect(Detail);
