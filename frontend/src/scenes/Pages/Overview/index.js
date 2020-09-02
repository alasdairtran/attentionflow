import React from 'react';
import { Route } from 'react-router-dom';
import AppFooter from '../../Layout/AppFooter';
// Layout
import AppHeader from '../../Layout/AppHeader';
import AppSidebar from '../../Layout/AppSidebar';
import ArtistOverview from './ArtistOverview';
// DASHBOARDS
import BasicOverview from './Basic';
import GenreNetwork from './GenreNetwork';
import GenreOverview from './GenreOverview';
import VideoOverview from './VideoOverview';
import WikiOverview from './WikiOverview';

const Overview = ({ match }) => (
  <>
    <AppHeader />
    <div className="app-main">
      <AppSidebar />
      <div className="app-main__outer">
        <div className="app-main__inner">
          <Route path={`${match.url}/basic`} component={BasicOverview} />
          <Route exact path={`${match.url}/genre`} component={GenreOverview} />
          <Route path={`${match.url}/genre/:id`} component={GenreNetwork} />
          <Route path={`${match.url}/artist/:id?`} component={ArtistOverview} />
          {/* <Route path={`${match.url}/artist/:id`} component={ArtistEgo} /> */}
          <Route path={`${match.url}/video/:id?`} component={VideoOverview} />
          <Route path={`${match.url}/wiki/:id?`} component={WikiOverview} />
          {/* <Route path={`${match.url}/video/:id`} component={VideoEgo} /> */}
        </div>
        <AppFooter />
      </div>
    </div>
  </>
);

export default Overview;
