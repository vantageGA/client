import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { buildAbsoluteUrl } from '../../config/seo';

const STRUCTURED_DATA_ID = 'page-structured-data';

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertLink = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const removeElement = (selector) => {
  const element = document.head.querySelector(selector);

  if (element) {
    element.remove();
  }
};

const PageMeta = ({
  canonicalPath,
  description,
  image,
  jsonLd,
  robots,
  title,
  type = 'website',
}) => {
  useEffect(() => {
    const canonicalUrl = canonicalPath
      ? buildAbsoluteUrl(canonicalPath)
      : window.location.href.split('#')[0].split('?')[0];
    const imageUrl = image ? buildAbsoluteUrl(image) : null;

    if (title) {
      document.title = title;
      upsertMeta('meta[property="og:title"]', {
        property: 'og:title',
        content: title,
      });
      upsertMeta('meta[name="twitter:title"]', {
        name: 'twitter:title',
        content: title,
      });
    }

    if (description) {
      upsertMeta('meta[name="description"]', {
        name: 'description',
        content: description,
      });
      upsertMeta('meta[property="og:description"]', {
        property: 'og:description',
        content: description,
      });
      upsertMeta('meta[name="twitter:description"]', {
        name: 'twitter:description',
        content: description,
      });
    }

    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: canonicalUrl,
    });
    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: canonicalUrl,
    });
    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });
    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: imageUrl ? 'summary_large_image' : 'summary',
    });

    if (robots) {
      upsertMeta('meta[name="robots"]', {
        name: 'robots',
        content: robots,
      });
    } else {
      removeElement('meta[name="robots"]');
    }

    if (imageUrl) {
      upsertMeta('meta[property="og:image"]', {
        property: 'og:image',
        content: imageUrl,
      });
      upsertMeta('meta[name="twitter:image"]', {
        name: 'twitter:image',
        content: imageUrl,
      });
    } else {
      removeElement('meta[property="og:image"]');
      removeElement('meta[name="twitter:image"]');
    }

    if (jsonLd?.length) {
      let script = document.head.querySelector(`#${STRUCTURED_DATA_ID}`);

      if (!script) {
        script = document.createElement('script');
        script.id = STRUCTURED_DATA_ID;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }

      script.textContent = JSON.stringify(jsonLd.length === 1 ? jsonLd[0] : jsonLd);
    } else {
      removeElement(`#${STRUCTURED_DATA_ID}`);
    }
  }, [canonicalPath, description, image, jsonLd, robots, title, type]);

  return null;
};

PageMeta.propTypes = {
  canonicalPath: PropTypes.string,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  jsonLd: PropTypes.arrayOf(PropTypes.object),
  robots: PropTypes.string,
  title: PropTypes.string.isRequired,
  type: PropTypes.string,
};

export default PageMeta;
