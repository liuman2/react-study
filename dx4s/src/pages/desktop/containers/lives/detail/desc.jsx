/**
 * 课程详情-简介
*/
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';

const propTypes = {
  trainingLive: PropTypes.object.isRequired,
};

function getDefaultHead(headerUrl) {
  if (headerUrl === undefined) {
    return {
      'default-head': false,
    };
  }
  const header = headerUrl || '';
  return {
    'default-head': !header.length,
  };
}

const Desc = ({ trainingLive: { description, header_url, lecturer, industries, attribute, target, signature, type, description_html } }) => (
  <div className="description">
    {
      (() => {
        if (type === 'meeting') {
          return null;
        }
        return (
          <div>
            <div className="row">
              <div className="title">
                直播对象：
              </div>
              <div className="content">
                {
                  (() => {
                    if (!attribute) {
                      return null;
                    }
                    return (
                      <div>
                        <span>{attribute.industry_name}&nbsp;</span>
                        <span>{attribute.post_name || ''}&nbsp;</span>
                        <span>{attribute.experience_name || ''}&nbsp;</span>
                      </div>
                    );
                  })()
                }
              </div>
            </div>
            <div className="row">
              <div className="title">
                直播目标：
              </div>
              <div className="content">
                {
                  (() => {
                    if (!target) {
                      return null;
                    }
                    const targetHtml = target.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
                    return (
                      <div dangerouslySetInnerHTML={{ __html: targetHtml }} />
                    );
                  })()
                }
              </div>
            </div>
            <div className="row lecture-info">
              <div className="title">
                讲师介绍：
              </div>
              <div className="content">
                <div className="avatar">
                  <img className={classNames(getDefaultHead(header_url))} src={header_url} alt="" />
                </div>
                <div className="lecture-detail">
                  {lecturer}
                  {
                    (() => {
                      if (!industries) {
                        return null;
                      }
                      return (
                        <div className="tags">
                          {industries.map(industry => <span key={industry.id || industry.name} className="tag">{industry.name}</span>)}
                        </div>
                      );
                    })()
                  }
                  {
                    (() => {
                      if (!signature) {
                        return null;
                      }
                      const signatureHtml = signature.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>').replace(/\s/g, '&nbsp;');
                      return (
                        <div dangerouslySetInnerHTML={{ __html: signatureHtml }} />
                      );
                    })()
                  }
                </div>
              </div>
            </div>
          </div>
        );
      })()
    }
    <div className="row">
      <div className="title">
        直播简介：
      </div>
      <div className="content">
        <div dangerouslySetInnerHTML={{ __html: (description_html || description) }} />
      </div>
    </div>
  </div>
);

Desc.propTypes = propTypes;

const mapStateToProps = state => ({
  trainingLive: state.trainingLive,
});

export default connect(mapStateToProps)(Desc);
