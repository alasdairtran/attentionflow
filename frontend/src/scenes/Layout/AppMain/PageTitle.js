import cx from 'classnames';
import React, { Component } from 'react';
import { connect } from 'react-redux';

class PageTitle extends Component {
  render() {
    const {
      enablePageTitleIcon,
      enablePageTitleSubheading,

      heading,
      icon,
      subheading,
    } = this.props;

    return (
      <div className="app-page-title">
        <div className="page-title-wrapper">
          <div className="page-title-heading">
            <div
              className={cx('page-title-icon', {
                'd-none': !enablePageTitleIcon,
              })}
            >
              <i className={icon} />
            </div>
            <div>
              {heading}
              <div
                className={cx('page-title-subheading', {
                  'd-none': !enablePageTitleSubheading,
                })}
              >
                {subheading}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  enablePageTitleIcon: state.ThemeOptions.enablePageTitleIcon,
  enablePageTitleSubheading: state.ThemeOptions.enablePageTitleSubheading,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(PageTitle);
