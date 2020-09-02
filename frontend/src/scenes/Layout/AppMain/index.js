import React, { lazy, Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';

const Overview = lazy(() => import('../../Pages/Overview'));
// const Widgets = lazy(() => import('../../DemoPages/Widgets'));
// const Elements = lazy(() => import('../../DemoPages/Elements'));
// const Components = lazy(() => import('../../DemoPages/Components'));

const AppMain = () => {
  return (
    <>
      {/* Overview */}

      <Suspense
        fallback={
          <div className="loader-container">
            <div className="loader-container-inner">
              <h6 className="mt-3">
                Please wait while we load all the Dashboards examples
                <small>
                  Because this is a demonstration, we load at once all the
                  Dashboards examples. This wouldn't happen in a real live app!
                </small>
              </h6>
            </div>
          </div>
        }
      >
        <Route path="/overview" component={Overview} />
      </Suspense>

      <Route exact path="/" render={() => <Redirect to="/overview/basic" />} />
    </>
  );
};

export default AppMain;
