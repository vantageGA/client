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
    <div className="faqs-wrapper">
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
      <fieldset className="fieldSet">
        <legend>Frequently Asked Questions</legend>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            id={faq.id}
            question={faq.question}
            answer={openId === faq.id ? faq.answer : null}
            onClick={() => handleOpen(faq.id)}
          />
        ))}
      </fieldset>
    </div>
  );
};

export default FaqsView;
