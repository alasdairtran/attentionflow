import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import PerfectScrollbar from 'react-perfect-scrollbar';
import Nav from '../AppNav/VerticalNavWrapper';
import HeaderLogo from '../AppLogo';

import { setEnableMobileMenu } from '../../reducers/ThemeOptions';

class AppSidebar extends Component {
  state = {};

  toggleMobileSidebar = () => {
    const { enableMobileMenu, setEnableMobileMenu } = this.props;
    setEnableMobileMenu(!enableMobileMenu);
  };

  render() {
    const {
      backgroundColor,
      enableBackgroundImage,
      enableSidebarShadow,
      backgroundImage,
      backgroundImageOpacity,
    } = this.props;

    return (
      <>
        <div
          className="sidebar-mobile-overlay"
          onClick={this.toggleMobileSidebar}
        />
        <ReactCSSTransitionGroup
          component="div"
          className={cx('app-sidebar', backgroundColor, {
            'sidebar-shadow': enableSidebarShadow,
          })}
          transitionName="SidebarAnimation"
          transitionAppear
          transitionAppearTimeout={1500}
          transitionEnter={false}
          transitionLeave={false}
        >
          <HeaderLogo />
          <PerfectScrollbar>
            <div className="app-sidebar__inner">
              <Nav />
            </div>
          </PerfectScrollbar>
          <div
            className={cx('app-sidebar-bg', backgroundImageOpacity)}
            style={{
              backgroundImage: enableBackgroundImage
                ? `url(${backgroundImage})`
                : null,
            }}
          />
        </ReactCSSTransitionGroup>
      </>
    );
  }
}

const mapStateToProps = state => ({
  enableBackgroundImage: state.ThemeOptions.enableBackgroundImage,
  enableSidebarShadow: state.ThemeOptions.enableSidebarShadow,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  backgroundColor: state.ThemeOptions.backgroundColor,
  backgroundImage: state.ThemeOptions.backgroundImage,
  backgroundImageOpacity: state.ThemeOptions.backgroundImageOpacity,
});

const mapDispatchToProps = dispatch => ({
  setEnableMobileMenu: enable => dispatch(setEnableMobileMenu(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AppSidebar);
