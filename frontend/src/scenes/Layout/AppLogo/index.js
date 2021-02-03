import React from 'react';
import Hamburger from 'react-hamburgers';
import { connect } from 'react-redux';
import {
  setEnableClosedSidebar,
  setEnableMobileMenu,
  setEnableMobileMenuSmall,
} from '../../reducers/ThemeOptions';
import AppMobileMenu from '../AppMobileMenu';

class HeaderLogo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      active: false,
      mobile: false,
      activeSecondaryMenuMobile: false,
    };
  }

  toggleEnableClosedSidebar = () => {
    const { enableClosedSidebar, setEnableClosedSidebar } = this.props;
    setEnableClosedSidebar(!enableClosedSidebar);
  };

  state = {
    openLeft: false,
    openRight: false,
    relativeWidth: false,
    width: 280,
    noTouchOpen: false,
    noTouchClose: false,
  };

  render() {
    const { enableClosedSidebar } = this.props;

    const {} = this.state;

    return (
      <>
        <div className="app-header__logo">
          <a href="/">
            <div className="logo-name">AttentionFlow</div>
          </a>
          <div className="header__pane ml-auto">
            <div onClick={this.toggleEnableClosedSidebar}>
              <Hamburger
                active={enableClosedSidebar}
                type="elastic"
                onClick={() => this.setState({ active: !this.state.active })}
              />
            </div>
          </div>
        </div>
        <AppMobileMenu />
      </>
    );
  }
}

const mapStateToProps = state => ({
  enableClosedSidebar: state.ThemeOptions.enableClosedSidebar,
  enableMobileMenu: state.ThemeOptions.enableMobileMenu,
  enableMobileMenuSmall: state.ThemeOptions.enableMobileMenuSmall,
});

const mapDispatchToProps = dispatch => ({
  setEnableClosedSidebar: enable => dispatch(setEnableClosedSidebar(enable)),
  setEnableMobileMenu: enable => dispatch(setEnableMobileMenu(enable)),
  setEnableMobileMenuSmall: enable =>
    dispatch(setEnableMobileMenuSmall(enable)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderLogo);
