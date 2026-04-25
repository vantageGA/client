import React from 'react';
import './ErrorView.scss';
import PageMeta from '../../components/seo/PageMeta';

const ErrorView = () => {
  return (
    <div className="error-view">
      <PageMeta
        title="Page Not Found | Body Vantage"
        description="The requested Body Vantage page could not be found."
        robots="noindex, nofollow"
      />
      <div>
        <h1 className="help-text">SOMETHING WENT WRONG</h1>
      </div>
      <div></div>
    </div>
  );
};

export default ErrorView;
