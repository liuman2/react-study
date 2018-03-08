import React, { Component, PropTypes } from 'react';

import videojs from 'video.js';
import 'videojs-contrib-hls';

import 'video.js/dist/video-js.css';
import './index.styl';

class Media extends Component {
  constructor() {
    super();
    this.player = null;
    this.myPlayer = null; // legacy
    this.videoNode = null;
  }

  componentDidMount() {
    this.videoNode.setAttribute('playsinline', true);
    this.videoNode.setAttribute('webkit-playsinline', true);
    this.videoNode.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
    const { src, poster, controls } = this.props;
    const type = src.indexOf('.m3u8') !== -1 ? 'application/x-mpegURL' : undefined;
    const props = {
      preload: 'auto',
      controls,
      poster,
    };
    this.player = videojs(this.videoNode, props);
    this.player.src({ src, type });
    this.player.ready(() => {
      this.player.volume(0.5);
      this.player.play();
    });
    this.myPlayer = this.player;
  }

  componentWillUnmount() {
    if (this.player) this.player.dispose();
  }

  enableProgressBar() {
    const player = this.player;
    player.controlBar.progressControl.seekBar.on('mousedown', player.controlBar.progressControl.seekBar.handleMouseDown);
    player.controlBar.progressControl.seekBar.on('touchstart', player.controlBar.progressControl.seekBar.handleMouseDown);
    player.controlBar.progressControl.seekBar.on('click', player.controlBar.progressControl.seekBar.handleClick);
  }

  disableProgressBar() {
    const player = this.player;
    player.controlBar.progressControl.seekBar.off('mousedown');
    player.controlBar.progressControl.seekBar.off('touchstart');
    player.controlBar.progressControl.seekBar.off('click');
  }

  render() {
    return (
      <div className="media video-js vjs-default-skin vjs-big-play-centered vjs-no-flex">
        <video
          ref={(node) => { this.videoNode = node; }}
          className="vjs-tech"
        />
      </div>
    );
  }
}

const { string, bool } = PropTypes;
Media.propTypes = {
  src: string.isRequired,
  poster: string,
  controls: bool,
};

Media.defaultProps = {
  poster: '',
  controls: false,
};

export default Media;
