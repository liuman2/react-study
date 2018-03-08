import React, { Component } from 'react';
import { Link } from 'react-router';
import api from 'utils/api';
import DxHeader from '../../components/header';
import DxFooter from '../../components/footer';
import Card from '../../components/card';
import Loading from '../../components/loading';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import title from './img/plansTitle.png';
import empty from './img/empty.png';
import Confirm from '../../components/confirm';

class Favorites extends Component {
  static contextTypes = {
    intl: React.PropTypes.object,
    router: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.isBtn = false;
    this.isMore = true;
    this.pageSize = 20;
    this.fetchFavoriteList = this.fetchFavoriteList.bind(this);
    this.outPut = this.outPut.bind(this);
    this.clickDelete = this.clickDelete.bind(this);
    this.linkTo = this.linkTo.bind(this);
    this.onCardClick = ::this.onCardClick;
    this.onAlertConfirm = ::this.onAlertConfirm;
    this.state = {
      favorite: [],
      fetchIndex: 0,
      isFetching: false,
      isAlertOpen: false,
      clickedCard: null,
    };
  }
  componentDidMount() {
    this.fetchFavoriteList();
  }
  fetchFavoriteList(type) {
    const self = this;
    let fetchIndex;
    if (type === 'delete') {
      fetchIndex = 1;
    } else {
      fetchIndex = self.state.fetchIndex + 1;
    }
    // 请求
    function fetchList() {
      (async function fetchData() {
        const fetchFavorite = await api({
          url: '/training/my/favor/list',
          params: {
            index: self.state.fetchIndex,
            size: self.pageSize,
          },
        });
        let favorite;
        if (type === 'delete') {
          favorite = fetchFavorite.data;
        } else {
          favorite = self.state.favorite.concat(fetchFavorite.data);
        }
        self.isMore = fetchFavorite.data.length < self.pageSize ? false : true;
        self.setState({ favorite, isFetching: false });
      }());
    }
    self.setState({ fetchIndex, isFetching: true }, fetchList);
  }
  clickDelete(event, planId, courseId, solutionId) {
    const self = this;
    (async function fetchData() {
      await api({
        method: 'PUT',
        url: `/training/plan/${planId}/solution/${(solutionId || 0)}/course/${courseId}/favor`,
        data: {
          is_favor: false,
        },
      });

      self.fetchFavoriteList('delete');
    }());
    event.stopPropagation();
    event.preventDefault();
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

    if (!item.is_finished) {
      this.setState({ ...this.state, isAlertOpen: true, clickedCard: item });
      return;
    }

    router.push(router.createPath(to));
  }

  onAlertConfirm() {
    const clickedCard = this.state.clickedCard;
    const cardType = clickedCard.item_type;
    let confirmUrl = '';
    switch (cardType) {
      case 'course':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/course/${clickedCard.item_id}/invalid/confirm`;
        break;
      case 'solution':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/${clickedCard.item_id}/invalid/confirm`;
        break;
      case 'exam':
        confirmUrl = `/training/plan/${clickedCard.plan.id}/solution/0/quiz/${clickedCard.item_id}/invalid/confirm`;
        break;
      default:
        break;
    }

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
    const type = item.item_type || item.type;
    const id = item.task_id;
    const pid = temp.plan.id;
    const solutionId = item.solution_id || 0;
    switch (type) {
      case 'course':
        return `/plan/${pid}/series/${solutionId}/courses/${id}`;
      case 'solution':
        return `/plan/${pid}/series/${id}`;
      case 'exam':
        return `/plan/${pid}/series/${solutionId}/exams/${id}`;
      default:
        return null;
    }
  }
  outPut(data) {
    if (data.length !== 0) {
      this.isBtn = true;
      return (
        <div className="listBox">
          {
           data.map((p, i) => (
              <Card
                key={`${i}-${p.task_name}`}
                type={p.type}
                img={p.img}
                name={p.task_name}
                to={this.linkTo(p)}
                isDelete={true}
                clickDelete={(event) => this.clickDelete(event, p.plan.id, p.task_id, p.solution_id)}
                style={((i + 1) % 5) ? null : { marginRight: 0 }}
                cardClick={this.onCardClick}
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
        <a><FormattedMessage {...messages.NO} /></a>
      </div>
    );
  }
  render() {
    const { isFetching } = this.props;
    return (
      <div>
        <Loading
          isShow={isFetching}
        />
        <DxHeader />
        <div className="navList">
          <div className="nav">
            <div className="navTitle">
              <img src={title} alt="多学" />
              <p><FormattedMessage {...messages.myFavorites} /></p>
            </div>
          </div>
        </div>
        {this.outPut(this.state.favorite)}
        <div className="clickMore">
          {this.isBtn ? this.isMore ? <div className="clickMoreBtn" onClick={this.fetchFavoriteList}><FormattedMessage {...messages.more} /></div> : <div className="clickMoreBtn"><FormattedMessage {...messages.noMore} /></div> : ''}
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


export default Favorites;

