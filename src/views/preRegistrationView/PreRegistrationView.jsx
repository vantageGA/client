import './PreRegistrationView.scss';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import Accordion from '../../components/accordion/Accordion';
import LinkComp from '../../components/linkComp/LinkComp';

const PreRegistrationView = () => {
  const navigate = useNavigate();

  // State for FAQ accordion
  const [activeQuestion, setActiveQuestion] = useState(null);

  // FAQ data structure
  const faqs = [
    {
      id: 1,
      question: 'How long does the registration process take?',
      answer: 'The initial registration form takes approximately 10-15 minutes to complete. After submission, our team will review your application within 3-5 business days. You will be notified via email once your profile is approved and activated.'
    },
    {
      id: 2,
      question: 'What documents do I need to provide?',
      answer: 'You will need to provide proof of professional qualifications, valid insurance documentation, and professional identification. Specific requirements vary by industry sector. All documents should be current and clearly legible.'
    },
    {
      id: 3,
      question: 'Is there a membership fee?',
      answer: 'Yes, BodyVantage operates on a subscription-based model. Membership fees vary depending on your chosen plan and features. Detailed pricing information will be provided during the registration process. We offer flexible payment options to suit different business needs.'
    },
    {
      id: 4,
      question: 'Can I update my profile after registration?',
      answer: 'Absolutely. Once your profile is approved, you will have full access to edit your information, add services, update pricing, upload photos, and manage your availability. You can make updates at any time through your dashboard.'
    },
    {
      id: 5,
      question: 'What happens if my application is not approved?',
      answer: 'If your application does not meet our current requirements, we will provide detailed feedback via email explaining the reasons. You will have the opportunity to address any issues and reapply. Our support team is available to answer questions and guide you through the process.'
    }
  ];

  // Handle FAQ toggle
  const handleQuestionClick = (id) => {
    setActiveQuestion(activeQuestion === id ? null : id);
  };

  return (
    <div className="pre-registration-wrapper">
      <fieldset className="fieldSet">
        <legend>Before You Join <BodyVantage /></legend>

        <p className="intro-text">
          Everything you need to know about becoming a member
        </p>

        {/* Benefits Section */}
        <section className="benefits-section">
          <h3>Membership Benefits</h3>
          <div className="benefits-grid">
            <article className="benefit-card">
              <div className="benefit-icon" aria-hidden="true">
                <i className="fas fa-user-check"></i>
              </div>
              <h4 className="benefit-title">Professional Credibility</h4>
              <p className="benefit-description">
                Enhance your professional reputation with a verified profile on our trusted platform.
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon" aria-hidden="true">
                <i className="fas fa-search-location"></i>
              </div>
              <h4 className="benefit-title">Increased Visibility</h4>
              <p className="benefit-description">
                Reach more potential clients through our location-based search platform.
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon" aria-hidden="true">
                <i className="fas fa-chart-line"></i>
              </div>
              <h4 className="benefit-title">Business Growth</h4>
              <p className="benefit-description">
                Access tools and features designed to help you grow your business.
              </p>
            </article>

            <article className="benefit-card">
              <div className="benefit-icon" aria-hidden="true">
                <i className="fas fa-hands-helping"></i>
              </div>
              <h4 className="benefit-title">Dedicated Support</h4>
              <p className="benefit-description">
                Receive ongoing support from our team with profile optimization and more.
              </p>
            </article>
          </div>
        </section>

        {/* Requirements Section */}
        <section className="requirements-section">
          <h3>Membership Requirements</h3>
          <p>
            To maintain the quality and credibility of our platform, all members must meet the following criteria:
          </p>
          <ul>
            <li><strong>Professional Qualifications:</strong> Hold relevant certifications or licenses in your field</li>
            <li><strong>Valid Insurance:</strong> Maintain current professional indemnity and public liability insurance</li>
            <li><strong>Professional Conduct:</strong> Agree to uphold our code of conduct and standards</li>
            <li><strong>Accurate Information:</strong> Provide truthful information about your services and qualifications</li>
            <li><strong>Responsive Communication:</strong> Commit to responding to client inquiries promptly</li>
          </ul>
        </section>

        {/* Timeline Section */}
        <section className="timeline-section">
          <h3>Registration Process</h3>
          <div className="timeline-container">
            <div className="timeline-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Complete Registration Form</strong>
                <p>Fill out the form with your business details and qualifications (10-15 minutes)</p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Document Verification</strong>
                <p>Upload proof of qualifications, insurance certificates, and identification</p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Application Review</strong>
                <p>Our team reviews your application (3-5 business days)</p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Profile Activation</strong>
                <p>Once approved, customize your profile and settings</p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">5</span>
              <div className="step-content">
                <strong>Go Live</strong>
                <p>Start connecting with potential clients immediately</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h3>Frequently Asked Questions</h3>
          <div className="faq-container">
            {faqs.map((faq) => (
              <Accordion
                key={faq.id}
                id={faq.id}
                question={faq.question}
                answer={activeQuestion === faq.id ? faq.answer : null}
                onClick={() => handleQuestionClick(faq.id)}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <h3>Ready to Join?</h3>
          <p>
            Take the next step in growing your business and connecting with more clients.
          </p>
          <div className="cta-buttons">
            <Button
              text="Register Now"
              
              disabled={false}
              onClick={() => navigate('/registration')}
              type="button"
              title="Proceed to registration"
            />
            <Button
              text="Back to About"
              
              disabled={false}
              onClick={() => navigate('/about')}
              type="button"
              title="Return to about page"
            />
          </div>
        </section>
      </fieldset>

      <div className="support-link">
        <p>
          Need help? <LinkComp route="contact" routeName="Contact Support" /> or <LinkComp route="faq" routeName="Browse FAQs" />
        </p>
      </div>
    </div>
  );
};

export default PreRegistrationView;
