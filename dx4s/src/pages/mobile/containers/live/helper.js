import React from 'react';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// eslint-disable-next-line import/prefer-default-export
export function transformToBasicLive(liveFromServer) {
  // eslint-disable-next-line no-param-reassign
  liveFromServer.price = liveFromServer.price || {};
  const {
    name,
    cover_url: cover,
    infoHtml: description,
    begin_time: beginTime,
    price: {
      is_free: free,
      unit_price: price,
    },
    live_status: status,
    on_live_num: onLiveNum,
    tags,
    lecturer_name: lecturer,
    header_url: header,
    signature,
    sales: remain,
    period_intro: periodIntro,
    industries,
    lives,
  } = liveFromServer;
  return {
    cover,
    name,
    description,
    beginTime,
    free,
    price,
    tags,
    status,
    lecturer,
    header,
    remain,
    onLiveNum,
    periodIntro,
    industries,
    signature,
    lives,
  };
}

export function capitalize(str) {
  const [capital, ...tail] = str;
  return capital.toUpperCase() + tail.join('').toLowerCase();
}

export function getLiveStatusI18nEl(status, num) {
  if (status === 'on_live_n') {
    return <FormattedMessage {...messages.liveTh} values={{ n: num }} />;
  }
  // eslint-disable-next-line react/jsx-filename-extension
  return <FormattedMessage id={`app.live.basic.status.${status}`} />;
}
