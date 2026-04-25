/* @vitest-environment jsdom */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import PageMeta from './PageMeta';

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll(
      [
        'meta[name="description"]',
        'meta[property^="og:"]',
        'meta[name^="twitter:"]',
        'meta[name="robots"]',
        'link[rel="canonical"]',
        'script[type="application/ld+json"]',
      ].join(','),
    )
    .forEach((element) => element.remove());
});

describe('PageMeta', () => {
  it('updates page title and SEO metadata tags', () => {
    render(
      <PageMeta
        title="Professional Verification Platform UK | Body Vantage"
        description="Verified professionals across fitness, beauty, barbering, and wellbeing."
        canonicalPath="/about"
        robots="index, follow"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Body Vantage',
          },
        ]}
      />,
    );

    expect(document.title).toBe(
      'Professional Verification Platform UK | Body Vantage',
    );
    expect(
      document.head.querySelector('meta[name="description"]')?.content,
    ).toBe(
      'Verified professionals across fitness, beauty, barbering, and wellbeing.',
    );
    expect(
      document.head.querySelector('meta[property="og:title"]')?.content,
    ).toBe('Professional Verification Platform UK | Body Vantage');
    expect(
      document.head.querySelector('meta[name="twitter:card"]')?.content,
    ).toBe('summary');
    expect(
      document.head.querySelector('link[rel="canonical"]')?.href,
    ).toBe('https://www.bodyvantage.co.uk/about');
    expect(document.head.querySelector('meta[name="robots"]')?.content).toBe(
      'index, follow',
    );
    expect(
      document.head.querySelector('script[type="application/ld+json"]')
        ?.textContent,
    ).toContain('"@type":"Organization"');
  });
});
