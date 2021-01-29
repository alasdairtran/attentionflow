import React from 'react';

class AppFooter extends React.Component {
  render() {
    return (
      <>
        <div className="app-footer">
          <div className="app-footer__inner">
            <div className="app-footer-left">
              Developed by Minjeong Shin, Alasdair Tran, Siqi Wu, Alexander
              Mathews, Rong Wang, Georgiana Lyall, and Lexing Xie @{' '}
              <a href="http://cm.cecs.anu.edu.au/" target="_blank">
                ANU Computational Media Lab
              </a>
              .
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default AppFooter;
