import cx from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import ResizeDetector from 'react-resize-detector';
import { withRouter } from 'react-router-dom';
import AppMain from '../../Layout/AppMain';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      closedSmallerSidebar: false,
    };
  }

  render() {
    const {
      colorScheme,
      enableFixedHeader,
      enableMobileMenu,
      enablePageTabsAlt,
    } = this.props;

    return (
      <ResizeDetector
        handleWidth
        render={({ width }) => (
          <>
            <div
              className={cx(`app-container app-theme-${colorScheme}`, {
                'fixed-header': enableFixedHeader,
              })}
            >
              <AppMain />
            </div>
          </>
        )}
      />
    );
  }
}

const mapStateToProp = state => ({
  colorScheme: state.ThemeOptions.colorScheme,
  enableFixedHeader: state.ThemeOptions.enableFixedHeader,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableFixedFooter: state.ThemeOptions.enableFixedFooter,
  enableFixedSidebar: state.ThemeOptions.enableFixedSidebar,
  enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
  enablePageTabsAlt: state.ThemeOptions.enablePageTabsAlt,
});

export default withRouter(connect(mapStateToProp)(Main));
