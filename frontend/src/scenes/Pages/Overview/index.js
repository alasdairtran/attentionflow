import React from 'react';
import { Route } from 'react-router-dom';
// Layout
import AppHeader from '../../Layout/AppHeader';
// DASHBOARDS
import BasicOverview from './Basic';
import ArtistOverview from './ArtistOverview';
import VideoOverview from './VideoOverview';
import WikiOverview from './WikiOverview';

const Overview = ({ match }) => (
  <>
    <AppHeader />
    <div className="app-main">
      <div className="app-main__outer">
        <Route path={`${match.url}/basic`} component={BasicOverview} />
        <Route path={`${match.url}/artist/:id?`} component={ArtistOverview} />
        <Route path={`${match.url}/video/:id?`} component={VideoOverview} />
        <Route path={`${match.url}/wiki/:id?`} component={WikiOverview} />
      </div>
    </div>
  </>
);

export default Overview;
