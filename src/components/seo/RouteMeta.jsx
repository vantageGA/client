import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import PageMeta from './PageMeta';
import { privateSeoRoutes } from '../../config/seo';

const RouteMeta = ({ children, noindex = true }) => {
  const location = useLocation();
  const routeMeta = privateSeoRoutes[location.pathname] || {
    title: 'Body Vantage',
    description: 'Body Vantage account and platform page.',
  };

  return (
    <>
      <PageMeta
        title={routeMeta.title}
        description={routeMeta.description}
        canonicalPath={location.pathname}
        robots={noindex ? 'noindex, nofollow' : undefined}
      />
      {children}
    </>
  );
};

RouteMeta.propTypes = {
  children: PropTypes.node.isRequired,
  noindex: PropTypes.bool,
};

export default RouteMeta;
