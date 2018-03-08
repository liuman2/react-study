/**
* 课程中心-课程详情
*/
import React, { Component, PropTypes } from 'react';
import RelativeLink from 'components/links';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import api from 'utils/api';
import { nav } from 'utils/dx';
import { Link } from 'react-router';
import './course.styl';
import { Alert } from '../../../../components/modal';
import messages from './messages';

class Course extends Component {
  static contextTypes = {
    router: PropTypes.object,
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      // isConfirmOpen: false,
      isAlertOpen: false,
      isShareAlertOpen: false,
    };
    this.closeShareAlert = ::this.closeShareAlert;
    this.setNavBar = ::this.setNavBar;
    this.handleFavor = ::this.handleFavor;
    this.go2Task = ::this.go2Task;
    this.errorMsg = '';
    this.closeAlert = ::this.closeAlert;
    this.onStudy = ::this.onStudy;
  }

  componentDidMount() {
    const query = {
      plan_id: this.props.params.plan_id,
      solution_id: this.props.params.solution_id || 0,
      course_id: this.props.params.course_id,
    };
    this.props.actions.fetchCourse(query)
    .then(() => {
      this.props.actions.fetchAssement(query).then(() => {
        const detail = this.props.course.detail;
        const info = detail.info;
        if (info.need_update_complete_status && info.pass_state !== 2) {
          this.setState({ ...this.state, isShareAlertOpen: true });
        }
      });
    })
    .catch((err) => {
      const error = JSON.parse(err.message);
      this.errorMsg = error.message;
      this.setState({ ...this.state, isAlertOpen: true });
    });
  }

  componentWillUnmount() {
    this.props.actions.initCourse();
  }

  async onStudy(node, params) {
    if (node.make_method === 'ddi') {
      const { data } = await api({
        method: 'GET',
        url: `/training/plan/${params.plan_id}/solution/${params.solution_id}/course/${params.course_id}/node/${node.id}`,
      });

      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (__platform__.wechat && iOS) {
        await this.props.actions.setNodeRead({
          plan_id: params.plan_id,
          solution_id: params.solution_id,
          course_id: params.course_id,
          node_id: node.id,
        });
      } else {
        await api({
          method: 'PUT',
          url: `/training/plan/${params.plan_id}/solution/${params.solution_id}/course/${params.course_id}/chapter-node/${node.id}`,
        });
      }
      window.location.href = data.node_url;
      return;
    }

    if (node.make_method === 'zhongou') {
      const path = `/preview/plan/${params.plan_id}/series/${params.solution_id || 0}/courses/${params.course_id}`;
      const goBackUrl = `${window.location.origin}${window.location.pathname}#${path}?node_id=${node.id}`;
      window.location.href = `${node.url}&go_back=${encodeURIComponent(goBackUrl)}`;
    }
  }

  setNavBar() {
    nav.setTitle({
      title: this.context.intl.messages['app.course.title'],
    });
  }

  handleFavor(isFavor) {
    const data = {
      plan_id: this.props.params.plan_id,
      solution_id: (this.props.params.solution_id) || 0,
      course_id: this.props.params.course_id,
      is_favor: isFavor,
    };
    this.props.actions.favorCourse(data);
  }

  go2Task(planId) {
    const router = this.context.router;
    router.push(router.createPath(`/plan/detail/${planId}`));
  }

  closeAlert() {
    this.setState({ ...this.state, isAlertOpen: false });
    history.back();
  }

  closeShareAlert() {
    const query = {
      plan_id: this.props.params.plan_id,
      course_id: this.props.params.course_id,
      solution_id: this.props.params.solution_id || 0,
    };
    const detail = this.props.course.detail;
    const info = detail.info;
    const data = {
      completed_in_plan: info.completed_in_plan,
    };

    const shareCourse = api({ method: 'PUT', data: data, url: `/training/plan/${query.plan_id}/solution/${query.solution_id}/course/${query.course_id}/complete` });
    shareCourse.then(() => {
      this.props.actions.fetchCourse(query);
      this.props.actions.fetchAssement(query);
      this.props.actions.fetchChapter(query);
      this.setState({ ...this.state, isShareAlertOpen: false });
    });
  }

  render() {
    const detail = this.props.course.detail;
    const info = detail.info;
    const assessment = this.props.course.assessment.info;
    const nodes = this.props.course.nodes;
    const chapters = this.props.course.chapter.items;

    const params = this.props.params;
    const klass = classNames({
      isFetching: detail.isFetching,
      isFetched: !detail.isFetching,
      course: true,
    });

    const toDetail = `./detail${this.props.location.search}`;
    const toComments = `comments${this.props.location.search}`;

    this.setNavBar();

    return (
      <div id="course" className="course">
        <Alert
          shouldCloseOnOverlayClick={false}
          isOpen={this.state.isShareAlertOpen}
          onRequestClose={this.closeShareAlert}
          confirmButton={<span><FormattedMessage id="app.course.ok" /></span>}
        >
          <span>
            <FormattedMessage id="app.course.share" />
          </span>
        </Alert>
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

        <div className="banner">
          {<img src={info.thumbnail_url} />}
        </div>
        <ul className="tab">
          <li>
            <RelativeLink activeClassName="active" to={toDetail}><FormattedMessage id="app.course.descripton" /></RelativeLink>
          </li>
          <li>
            <RelativeLink activeClassName="active" to={toComments}><FormattedMessage id="app.course.reviews" /></RelativeLink>
          </li>
        </ul>
          {this.props.children}
        <div className="course-footer">
          {
            (() => {
              if (info.is_elective || params.plan_id == -1 || info.is_study_route) {
                return null;
              }

              return (
                <a className="task w-150" onClick={() => { this.go2Task(params.plan_id); }}>
                  <p>
                    <FormattedMessage
                      {...messages.lbTask}
                    />
                  </p>
                </a>
              );
            })()
          }
          {(() => {
            const favor = !info.is_favor;
            const favoriteId = info.is_favor ? 'lbFavorited' : 'lbFavorite';
            const cls = info.is_favor ? 'favorite active' : 'favorite';
            const clsWidth1 = (info.is_elective || params.plan_id == -1 || info.is_study_route) ? 'w-196' : 'w-150';
            return (
              <a className={`${cls} ${clsWidth1}`} onClick={() => { this.handleFavor(favor); }}>
                <p>
                  <FormattedMessage
                    {...messages[favoriteId]}
                  />
                </p>
              </a>);
          })()}

          {(() => {
            const clsWidth2 = (info.is_elective || params.plan_id == -1 || info.is_study_route) ? 'w-554' : 'w-450';

            if (assessment.valid_status === undefined || assessment.valid_status === 'notStarted') {
              return <a className={`gray ${clsWidth2}`}>{this.context.intl.messages['app.course.statusNotStart']}</a>;
            }

            // pass_state: 课程通过状态，0：未开始，1：进行中，2：已完成 ,
            // read_state: 课程阅读状态，0：未开始，1：在读，2：未开始挑战 ...

            let notReadNote = null;
            let query = null;
            let i = 0;
            let firstNode = null;
            // for (const o in nodes) {
            //   if (i === 0) {
            //     firstNode = nodes[o];
            //   }
            //   i++;
            //   if (assessment.pass_state === 2) {
            //     notReadNote = nodes[o];
            //     break;
            //   }

            //   if (nodes[o].done === 0) {
            //     notReadNote = nodes[o];
            //     break;
            //   }
            // }

            for (let i = 0, max = chapters.length; i < max; i++) {
              const chapterNodes = chapters[i].nodes;
              for (let j = 0; j < chapterNodes.length; j++) {
                const nodeKey = chapterNodes[j];
        
                if (i === 0 && j === 0) {
                  firstNode = nodes[nodeKey];
                }
        
                if (nodes[nodeKey].done === 0) {
                  notReadNote = nodes[nodeKey];
                  break;
                }
              }
              if (notReadNote !== null) {
                break;
              }
            }


            if (notReadNote === null) {
              notReadNote = firstNode;
            }
            const nodeLink = `/preview/plan/${params.plan_id}/series/${params.solution_id || 0}/courses/${params.course_id}`; //getNodeLink(params, notReadNote);
            let btnId = 'btnStart'; // assessment.pass_state === 0 ? 'btnStart' : 'btnContinue';
            if (assessment.pass_state === 1) {
              btnId = 'btnContinue';
            }
            if (assessment.pass_state === 2) {
              btnId = 'btnStduyAgain';
            }
            if (notReadNote) {
              query = {
                node_id: notReadNote.id,
              };
            }
            query = { ...query, continue: true };


            if (notReadNote && (notReadNote.make_method === 'zhongou')) {
              return <a className={`start ${clsWidth2}`} onClick={() => { this.onStudy(notReadNote, params); }}><FormattedMessage {...messages[btnId]} /></a>;
            }
            return <Link className={`start ${clsWidth2}`} to={{ pathname: nodeLink, query }}><FormattedMessage {...messages[btnId]} /></Link>;
          })()}
        </div>
      </div>
    );
  }
}

export default Course;
