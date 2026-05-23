import React, { useState } from 'react';
import './FaqsView.scss';
import { faqs } from './faqs';

import Accordion from '../../components/accordion/Accordion';
import PageMeta from '../../components/seo/PageMeta';
import { buildBreadcrumbJsonLd, organizationJsonLd } from '../../config/seo';

const FaqsView = () => {
  const [openId, setOpenId] = useState(null);

  const handleOpen = (faqId) => {
    setOpenId((prev) => (prev === faqId ? null : faqId));
  };

  return (
    <main className="faqs-wrapper">
      <PageMeta
        title="Professional Verification FAQs UK | Body Vantage"
        description="Answers to common questions about Body Vantage professional verification for fitness, barber, hairdresser, beauty, and wellbeing professionals."
        canonicalPath="/faq"
        jsonLd={[
          organizationJsonLd,
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'FAQs', path: '/faq' },
          ]),
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
              },
            })),
          },
        ]}
      />
      <article className="faqs-panel" aria-labelledby="faqs-title">
        <header className="faqs-hero">
          <p className="faqs-kicker">FAQ</p>
          <h1 id="faqs-title">Frequently Asked Questions</h1>
        </header>

        <div className="faqs-layout">
          <section className="faqs-context" aria-label="FAQ overview">
            <div className="section-heading">
              <span>01</span>
              <h2>Professional Verification</h2>
            </div>
            <p>
              Answers to common questions about Body Vantage membership,
              verification, profiles, reviews, and professional standards.
            </p>
          </section>

          <section className="faqs-list-panel" aria-label="Frequently asked questions">
            <div className="section-heading">
              <span>02</span>
              <h2>Questions</h2>
            </div>
            <div className="faqs-list">
              {faqs.map((faq) => (
                <Accordion
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answer={openId === faq.id ? faq.answer : null}
                  onClick={() => handleOpen(faq.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
};

export default FaqsView;
