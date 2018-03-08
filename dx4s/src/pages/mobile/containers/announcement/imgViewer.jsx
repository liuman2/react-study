import React, { Component, PropTypes } from 'react';
import store from 'store2';
import { nav } from 'utils/dx';

const setNav = (title) => {
  nav.setTitle({
    title,
  });
};

export default class ImgViewer extends Component {
  static contextTypes = {
    intl: PropTypes.object,
  }

  constructor(props, context) {
    super(props, context);
    setNav(this.context.intl.messages['app.announcement.title.checkTheAttachment']);
  }

  render() {
    const resourceUrl = store('imgViewer');

    return (
      <div>
        {
          resourceUrl.map(url => (
            <img src={url} alt="" key={url} style={{ maxWidth: '100%', width: '100%' }} />
          ))
        }
      </div>
    );
  }
}
