import React, { Component } from 'react';
import { Link } from 'react-router';
import api from 'utils/api';
import DxHeader from '../../components/header';
import DxFooter from '../../components/footer';
import Card from '../../components/card';
import Loading from '../../components/loading';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import Confirm from '../../components/confirm';
import './examsList.styl';
import title from './img/examsTitle.png';
import empty from './img/empty.png';


class examsList extends Component {
  static contextTypes = {
    intl: React.PropTypes.object,
    router: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.isBtn = false;
    this.isMore = true;
    this.pageSize = 20;
    this.fetchExamsList = this.fetchExamsList.bind(this);
    this.outPut = this.outPut.bind(this);
    this.linkTo = this.linkTo.bind(this);
    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      exams: [],
      fetchIndex: 0,
      isFetching: false,
      isAlertOpen: false,
      clickedCard: null,
    };
  }
  componentDidMount() {
    this.fetchExamsList();
  }
  fetchExamsList() {
    const self = this;
    const fetchIndex = self.state.fetchIndex + 1;
    // 请求
    function fetchList() {
      (async function fetchData() {
        const fetchExams = await api({
          url: '/training/quizs/my',
          params: {
            index: self.state.fetchIndex,
            size: self.pageSize,
          },
        });
        const exams = self.state.exams.concat(fetchExams.data);
        self.isMore = fetchExams.data.length < self.pageSize ? false : true;
        self.setState({ exams, isFetching: false });
      }());
    }
    self.setState({ fetchIndex, isFetching: true }, fetchList);
  }

  onCardClick(item) {
    const router = this.context.router;
    const to = this.linkTo(item);

    if (item.item_type === 'live') {
      router.push(router.createPath(to));
      return;
    }
    if (item.valid_status === undefined) {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_status !== 'invalid') {
      router.push(router.createPath(to));
      return;
    }

    if (item.valid_click === true) {
      router.push(router.createPath(to));
      return;
    }

    if (!item.is_finished && item.exam_unchecked !== true) {
      this.setState({ ...this.state, isAlertOpen: true, clickedCard: item });
      return;
    }

    router.push(router.createPath(to));
  }

  onAlertConfirm() {
    const clickedCard = this.state.clickedCard;
    const confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/quiz/${clickedCard.quiz_id}/invalid/confirm`;

    api({ method: 'PUT', url: confirmUrl }).then(() => {
      const to = this.linkTo(this.state.clickedCard);
      this.setState({ ...this.state, isAlertOpen: false, clickedCard: null });
      const router = this.context.router;
      router.push(router.createPath(to));
    });
  }

  linkTo(item) {
    const temp = item;
    if (!item.plan) {
      temp.plan = { id: 0 };
    }
    const id = item.quiz_id;
    const pid = temp.plan.id;
    return `/plan/${pid}/series/0/exams/${id}`;
  }
  outPut(data) {
    if (data.length !== 0) {
      this.isBtn = true;
      return (
        <div className="listBox">
          {
           data.map((p, i) => (
              <Card
                key={`${i}-${p.quiz_id}`}
                img={p.img}
                name={p.name}
                type={'course'}
                to={this.linkTo(p)}
                cardClick={this.onCardClick}
                done={p.finish_status && p.pass_status ? true : false}
                isFaid={p.finish_status && !p.pass_status ? true : false}
                style={((i + 1) % 5) ? null : { marginRight: 0 }}
                courseInfo={p}
                showValidStatus={!false}
              />
            ))
          }
        </div>
      );
    }
    return (
      <div className="empty">
        <img src={empty} />
        <a><FormattedMessage {...messages.noExams} /></a>
      </div>
    );
  }
  render() {
    return (
      <div>
        <Loading
          isShow={this.state.isFetching}
        />
        <DxHeader />
        <div className="navList">
          <div className="nav">
            <div className="navTitle">
              <img src={title} alt="多学" />
              <p><FormattedMessage {...messages.myexams} /></p>
            </div>
          </div>
        </div>
        {this.outPut(this.state.exams)}
        <div className="clickMore">
          {this.isBtn ? this.isMore ? <div className="clickMoreBtn" onClick={this.fetchExamsList}><FormattedMessage {...messages.clickMore} /></div> : <div className="clickMoreBtn"><FormattedMessage {...messages.myExamsNoMore} /></div> : ''}
        </div>
        <DxFooter />
        <Confirm
          isOpen={this.state.isAlertOpen}
          confirm={this.onAlertConfirm}
          confirmButton={this.context.intl.messages['app.course.ok']}
          buttonNum={1}
        >
          <FormattedMessage {...messages.invalidMsg} />
        </Confirm>
      </div>
    );
  }
}


export default examsList;

