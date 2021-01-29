import React, { Component } from 'react';
import MetisMenu from 'react-metismenu';
import { withRouter } from 'react-router-dom';
//import { ComponentsNav, MainNav } from './NavItems';
import { MainNav } from './NavItems';

class Nav extends Component {
  state = {};

  render() {
    return (
      //      <>
      //        <h5 className="app-sidebar__heading">Menu</h5>
      <MetisMenu
        content={MainNav}
        activeLinkFromLocation
        className="vertical-nav-menu"
        iconNamePrefix=""
        classNameStateIcon="pe-7s-angle-down"
      />
      //        <h5 className="app-sidebar__heading">Level</h5>
      //        <MetisMenu
      //          content={ComponentsNav}
      //          activeLinkFromLocation
      //          className="vertical-nav-menu"
      //          iconNamePrefix=""
      //          classNameStateIcon="pe-7s-angle-down"
      //        />
      //      </>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }
}

export default withRouter(Nav);
