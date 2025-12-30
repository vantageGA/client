import React from 'react';
import './Accordion.scss';

const Accordion = ({ question, answer, onClick, id }) => {
  const answerId = `answer-${id}`;
  const isExpanded = !!answer;

  return (
    <div className="accordion-wrapper">
      <button
        type="button"
        className="question"
        onClick={onClick}
        aria-expanded={isExpanded}
        aria-controls={answerId}
      >
        {question ? (
          <div className="accordion-inner-wrapper">
            <h2 className="accordion-heading">{question}</h2>
            {answer ? (
              <i className="fas fa-chevron-circle-up" aria-hidden="true"></i>
            ) : (
              <i className="fas fa-chevron-circle-down" aria-hidden="true"></i>
            )}
          </div>
        ) : null}
      </button>
      {answer && (
        <div className="answer drop" id={answerId}>
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

export default Accordion;
