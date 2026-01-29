import React from 'react';
import './LoadingSpinner.scss';

const LoadingSpinner = () => {
  return (
    <div className="loading" role="status" aria-label="Loading profiles, please wait">
      <div className="arc"></div>
      <div className="arc"></div>
      <div className="arc"></div>
      <span className="visually-hidden">Loading profiles, please wait</span>
    </div>
  );
};

export default LoadingSpinner;
