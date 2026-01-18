import React, { useState } from 'react';
import './FaqsView.scss';
import { faqs } from './faqs';

import Accordion from '../../components/accordion/Accordion';

const FaqsView = () => {
  const [openId, setOpenId] = useState(null);

  const handleOpen = (faqId) => {
    setOpenId((prev) => (prev === faqId ? null : faqId));
  };

  return (
    <div className="faqs-wrapper">
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
