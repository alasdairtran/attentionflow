import cx from 'classnames';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import SearchBox from './Components/SearchBox';
import '../../assets/vevovis.css';

class Header extends React.Component {
  render() {
    const {
      headerBackgroundColor,
      enableMobileMenuSmall,
      enableHeaderShadow,
    } = this.props;
    return (
      <>
        <ReactCSSTransitionGroup
          component="div"
          className={cx('app-header', headerBackgroundColor, {
            'header-shadow': enableHeaderShadow,
          })}
          transitionName="HeaderAnimation"
          transitionAppear
          transitionAppearTimeout={1500}
          transitionEnter={false}
          transitionLeave={false}
        >
          <div className="header">
            <a href="/" class="logo">
              AttentionFlow
            </a>

            {/*
        <div className="app-header-left">
          <SearchBox />
        </div>
        */}

            <div className="header-right">
              <a href="/#/overview/artist/UComP_epzeKzvBX156r6pm1Q">
                Vevo artist
              </a>
              <a href="/#/overview/video/rYEDA3JcQqw">Vevo video</a>
              <a href="/#/overview/wiki/318487">Wiki traffic</a>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </>
    );
  }
}

const mapStateToProps = state => ({
  enableHeaderShadow: state.ThemeOptions.enableHeaderShadow,
  closedSmallerSidebar: state.ThemeOptions.closedSmallerSidebar,
  headerBackgroundColor: state.ThemeOptions.headerBackgroundColor,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Header);
