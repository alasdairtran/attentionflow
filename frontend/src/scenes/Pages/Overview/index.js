import React, { Fragment } from 'react';
import { Route } from 'react-router-dom';

// DASHBOARDS

import BasicOverview from './Basic/';
import GenreOverview from './Genre';
import ArtistOverview from './ArtistOverview';
import SongOverview from './SongOverview';
import SongEgo from './SongEgo';

// Layout

import AppHeader from '../../Layout/AppHeader/';
import AppSidebar from '../../Layout/AppSidebar/';
import AppFooter from '../../Layout/AppFooter/';

const Overview = ({ match }) => (
  <Fragment>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route path={`${match.url}/basic`} component={BasicOverview} />
          <Route path={`${match.url}/genre`} component={GenreOverview} />
          <Route path={`${match.url}/artist`} component={ArtistOverview} />
          <Route exact path={`${match.url}/song`} component={SongOverview} />
          <Route path={`${match.url}/song/:id`} component={SongEgo} />
        </div>
        <AppFooter />
      </div>
    </div>
  </Fragment>
);

export default Overview;
