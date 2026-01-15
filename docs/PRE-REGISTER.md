# Pre-Registration Information Page - Technical Specification

## Overview
This document provides a complete technical specification for implementing the Pre-Registration Information Page for the BodyVantage application. The page serves as an informational bridge between the About page and Registration page.

---

## 1. Component Structure

### File Locations
```
/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/preRegistrationView/
├── PreRegistrationView.jsx
└── PreRegistrationView.scss
```

### Component Architecture
```
PreRegistrationView (Container)
├── Hero Section
├── Benefits Section (4 benefit cards in grid)
├── Requirements Section (fieldset with list)
├── Timeline Section (5 numbered steps)
├── FAQ Section (using Accordion components)
├── Support Section (contact links)
└── CTA Section (navigation buttons)
```

---

## 2. Complete JSX Implementation

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/preRegistrationView/PreRegistrationView.jsx`

```jsx
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
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-heading">
        <h1 id="hero-heading" className="hero-title">
          Before You Join <BodyVantage />
        </h1>
        <p className="hero-subtitle">
          Everything you need to know about becoming a member
        </p>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section" aria-labelledby="benefits-heading">
        <h2 id="benefits-heading" className="section-title">
          Membership Benefits
        </h2>
        <div className="benefits-grid">
          <article className="benefit-card">
            <div className="benefit-icon" aria-hidden="true">
              <i className="fas fa-user-check"></i>
            </div>
            <h3 className="benefit-title">Professional Credibility</h3>
            <p className="benefit-description">
              Enhance your professional reputation with a verified profile on our trusted platform. Stand out from competitors with our badge of authenticity.
            </p>
          </article>

          <article className="benefit-card">
            <div className="benefit-icon" aria-hidden="true">
              <i className="fas fa-search-location"></i>
            </div>
            <h3 className="benefit-title">Increased Visibility</h3>
            <p className="benefit-description">
              Reach more potential clients through our location-based search platform. Get discovered by people actively seeking your services.
            </p>
          </article>

          <article className="benefit-card">
            <div className="benefit-icon" aria-hidden="true">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3 className="benefit-title">Business Growth</h3>
            <p className="benefit-description">
              Access tools and features designed to help you grow your business. Track inquiries, manage reviews, and showcase your expertise.
            </p>
          </article>

          <article className="benefit-card">
            <div className="benefit-icon" aria-hidden="true">
              <i className="fas fa-hands-helping"></i>
            </div>
            <h3 className="benefit-title">Dedicated Support</h3>
            <p className="benefit-description">
              Receive ongoing support from our team. Get help with profile optimization, technical issues, and marketing strategies.
            </p>
          </article>
        </div>
      </section>

      {/* Requirements Section */}
      <fieldset className="fieldSet requirements-section">
        <legend>Membership Requirements</legend>

        <p className="requirements-intro">
          To maintain the quality and credibility of our platform, all members must meet the following criteria:
        </p>

        <ul className="requirements-list">
          <li>
            <strong>Professional Qualifications:</strong> Hold relevant certifications, licenses, or qualifications in your field of expertise.
          </li>
          <li>
            <strong>Valid Insurance:</strong> Maintain current professional indemnity and public liability insurance appropriate to your services.
          </li>
          <li>
            <strong>Professional Conduct:</strong> Agree to uphold our code of conduct and professional standards at all times.
          </li>
          <li>
            <strong>Accurate Information:</strong> Provide truthful and up-to-date information about your services, qualifications, and business.
          </li>
          <li>
            <strong>Responsive Communication:</strong> Commit to responding to client inquiries in a timely and professional manner.
          </li>
        </ul>

        <p className="requirements-note">
          <strong>Note:</strong> All applications are reviewed manually by our team to ensure quality standards are maintained.
        </p>
      </fieldset>

      {/* Timeline Section */}
      <section className="timeline-section" aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="section-title">
          Registration Process Timeline
        </h2>

        <div className="timeline-container">
          <div className="timeline-step">
            <div className="timeline-number" aria-hidden="true">1</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Complete Registration Form</h3>
              <p className="timeline-description">
                Fill out the comprehensive registration form with your business details, qualifications, and services offered. This typically takes 10-15 minutes.
              </p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="timeline-number" aria-hidden="true">2</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Document Verification</h3>
              <p className="timeline-description">
                Upload required documents including proof of qualifications, insurance certificates, and professional identification for verification.
              </p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="timeline-number" aria-hidden="true">3</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Application Review</h3>
              <p className="timeline-description">
                Our team reviews your application to ensure all requirements are met. This process typically takes 3-5 business days.
              </p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="timeline-number" aria-hidden="true">4</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Profile Activation</h3>
              <p className="timeline-description">
                Once approved, you'll receive an email confirmation and your profile will be activated. You can then customize your profile and settings.
              </p>
            </div>
          </div>

          <div className="timeline-step">
            <div className="timeline-number" aria-hidden="true">5</div>
            <div className="timeline-content">
              <h3 className="timeline-title">Go Live</h3>
              <p className="timeline-description">
                Your profile goes live on the platform. Start connecting with potential clients and growing your business immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="section-title">
          Frequently Asked Questions
        </h2>

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

        <p className="faq-more">
          Have more questions? <LinkComp route="faq" routeName="Visit our comprehensive FAQ page" />
        </p>
      </section>

      {/* Support Section */}
      <section className="support-section" aria-labelledby="support-heading">
        <h2 id="support-heading" className="section-title">
          Need Help?
        </h2>

        <p className="support-text">
          Our team is here to support you throughout the registration process and beyond. If you have questions or need assistance, don't hesitate to reach out.
        </p>

        <div className="support-links">
          <div className="support-link-item">
            <i className="fas fa-envelope" aria-hidden="true"></i>
            <LinkComp route="contact" routeName="Contact Support" />
          </div>
          <div className="support-link-item">
            <i className="fas fa-question-circle" aria-hidden="true"></i>
            <LinkComp route="faq" routeName="Browse FAQs" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" aria-labelledby="cta-heading">
        <h2 id="cta-heading" className="section-title">
          Ready to Join?
        </h2>

        <p className="cta-text">
          Take the next step in growing your business and connecting with more clients.
        </p>

        <div className="cta-buttons">
          <Button
            text="Register Now"
            colour="#C4A523"
            disabled={false}
            onClick={() => navigate('/registration')}
            type="button"
            title="Proceed to registration"
          />
          <Button
            text="Back to About"
            colour="rgba(75, 75, 75, 1)"
            disabled={false}
            onClick={() => navigate('/about')}
            type="button"
            title="Return to about page"
          />
        </div>
      </section>
    </div>
  );
};

export default PreRegistrationView;
```

---

## 3. Complete SCSS Implementation

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/preRegistrationView/PreRegistrationView.scss`

```scss
@use '../../index.scss' as *;
@use '../../scssMixIn.scss' as *;

.pre-registration-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  // Hero Section
  .hero-section {
    text-align: center;
    margin-bottom: 4rem;
    padding: 3rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(196, 165, 35, 0.1) 0%,
      rgba(51, 51, 51, 0.1) 100%
    );
    border-radius: 8px;
    border: 1px solid $border-colour-light;
    border-left: 4px solid $burnt-orange;

    .hero-title {
      font-family: 'Bebas Neue', cursive;
      letter-spacing: 0.1em;
      font-size: 3rem;
      color: $light-orange;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      color: $main-font-colour;
      opacity: 0.9;
      margin: 0;
    }
  }

  // Section Titles
  .section-title {
    font-family: 'Bebas Neue', cursive;
    letter-spacing: 0.1em;
    font-size: 2rem;
    color: $light-orange;
    margin-bottom: 2rem;
    text-align: center;
  }

  // Benefits Section
  .benefits-section {
    margin-bottom: 4rem;

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .benefit-card {
      padding: 2rem;
      background-color: rgba(51, 51, 51, 0.3);
      border-radius: 8px;
      border: 1px solid $border-colour-light;
      border-left: 3px solid $burnt-orange;
      transition: transform 0.3s ease, box-shadow 0.3s ease,
        border-left-color 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        border-left-color: $light-orange;
      }

      &:focus-within {
        outline: 2px solid $burnt-orange;
        outline-offset: 4px;
      }
    }

    .benefit-icon {
      font-size: 2.5rem;
      color: $burnt-orange;
      margin-bottom: 1rem;
      text-align: center;
    }

    .benefit-title {
      font-family: 'Bebas Neue', cursive;
      letter-spacing: 0.1em;
      font-size: 1.5rem;
      color: $light-orange;
      margin-bottom: 1rem;
      text-align: center;
    }

    .benefit-description {
      line-height: 1.6;
      color: $main-font-colour;
      opacity: 0.9;
      text-align: center;
      margin: 0;
    }
  }

  // Requirements Section (using fieldset)
  .requirements-section {
    margin-bottom: 4rem;
    padding: 2rem;
    background-color: rgba(51, 51, 51, 0.3);
    border-radius: 4px;
    border: 1px solid $border-colour-light;
    border-left: 4px solid $light-orange;

    legend {
      font-family: 'Bebas Neue', cursive;
      letter-spacing: 0.1em;
      font-size: 2rem;
      color: $light-orange;
      padding: 0 1rem;
    }

    .requirements-intro {
      margin-bottom: 1.5rem;
      line-height: 1.6;
      font-size: 1.05rem;
    }

    .requirements-list {
      list-style: none;
      padding-left: 0;
      margin: 2rem 0;

      li {
        margin-bottom: 1.5rem;
        padding-left: 2em;
        position: relative;
        line-height: 1.6;

        &::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: $burnt-orange;
          font-weight: bold;
          font-size: 1.5rem;
        }

        strong {
          color: $light-orange;
          display: block;
          margin-bottom: 0.25rem;
        }
      }
    }

    .requirements-note {
      margin-top: 2rem;
      padding: 1rem;
      background-color: rgba(196, 165, 35, 0.1);
      border-left: 3px solid $burnt-orange;
      border-radius: 4px;
      line-height: 1.6;

      strong {
        color: $light-orange;
      }
    }
  }

  // Timeline Section
  .timeline-section {
    margin-bottom: 4rem;

    .timeline-container {
      position: relative;
      padding: 2rem 0;

      // Vertical line connecting steps (hidden on mobile)
      &::before {
        content: '';
        position: absolute;
        left: 2rem;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(
          to bottom,
          $burnt-orange 0%,
          $light-orange 100%
        );
      }
    }

    .timeline-step {
      display: flex;
      gap: 2rem;
      margin-bottom: 3rem;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .timeline-number {
      flex-shrink: 0;
      width: 4rem;
      height: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, $burnt-orange 0%, $light-orange 100%);
      border-radius: 50%;
      font-family: 'Bebas Neue', cursive;
      font-size: 1.8rem;
      color: $main-bg-colour;
      font-weight: bold;
      position: relative;
      z-index: 1;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .timeline-content {
      flex: 1;
      padding: 1.5rem;
      background-color: rgba(51, 51, 51, 0.3);
      border-radius: 8px;
      border: 1px solid $border-colour-light;
      border-left: 3px solid $burnt-orange;
    }

    .timeline-title {
      font-family: 'Bebas Neue', cursive;
      letter-spacing: 0.1em;
      font-size: 1.5rem;
      color: $light-orange;
      margin-bottom: 0.75rem;
    }

    .timeline-description {
      line-height: 1.6;
      color: $main-font-colour;
      opacity: 0.9;
      margin: 0;
    }
  }

  // FAQ Section
  .faq-section {
    margin-bottom: 4rem;

    .faq-container {
      margin-top: 2rem;
    }

    .faq-more {
      margin-top: 2rem;
      text-align: center;
      font-size: 1.05rem;

      a {
        &:focus {
          outline: 2px solid $burnt-orange;
          outline-offset: 4px;
          border-radius: 2px;
        }

        &:hover {
          text-decoration: underline;
          color: $light-orange;
        }
      }
    }
  }

  // Support Section
  .support-section {
    margin-bottom: 4rem;
    text-align: center;

    .support-text {
      margin-bottom: 2rem;
      line-height: 1.6;
      font-size: 1.05rem;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;
    }

    .support-links {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
    }

    .support-link-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;

      i {
        color: $burnt-orange;
        font-size: 1.5rem;
      }

      a {
        &:focus {
          outline: 2px solid $burnt-orange;
          outline-offset: 4px;
          border-radius: 2px;
        }

        &:hover {
          text-decoration: underline;
          color: $light-orange;
        }
      }
    }
  }

  // CTA Section
  .cta-section {
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(196, 165, 35, 0.1) 0%,
      rgba(51, 51, 51, 0.1) 100%
    );
    border-radius: 8px;
    border: 1px solid $border-colour-light;
    border-left: 4px solid $burnt-orange;

    .cta-text {
      margin-bottom: 2rem;
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}

// Tablet Responsive (768px - 1024px)
@media (max-width: 1024px) {
  .pre-registration-wrapper {
    padding: 1.5rem;

    .hero-section {
      padding: 2rem 1.5rem;

      .hero-title {
        font-size: 2.5rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
      }
    }

    .benefits-section {
      .benefits-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
      }
    }

    .timeline-section {
      .timeline-container {
        &::before {
          left: 1.5rem;
        }
      }

      .timeline-number {
        width: 3rem;
        height: 3rem;
        font-size: 1.5rem;
      }
    }
  }
}

// Mobile Responsive (max 812px)
@media (max-width: 812px) {
  .pre-registration-wrapper {
    padding: 1rem;

    .hero-section {
      padding: 2rem 1rem;
      margin-bottom: 2rem;

      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }
    }

    .section-title {
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }

    .benefits-section {
      margin-bottom: 2rem;

      .benefits-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .benefit-card {
        padding: 1.5rem;
      }
    }

    .requirements-section {
      padding: 1.5rem;
      margin-bottom: 2rem;

      legend {
        font-size: 1.75rem;
        padding: 0 0.5rem;
      }

      .requirements-list {
        li {
          padding-left: 1.5em;
          margin-bottom: 1.25rem;

          &::before {
            font-size: 1.2rem;
          }
        }
      }
    }

    .timeline-section {
      margin-bottom: 2rem;

      .timeline-container {
        // Hide connecting line on mobile
        &::before {
          display: none;
        }
      }

      .timeline-step {
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .timeline-number {
        width: 3rem;
        height: 3rem;
        font-size: 1.5rem;
        margin: 0 auto;
      }

      .timeline-content {
        padding: 1.25rem;
      }

      .timeline-title {
        font-size: 1.3rem;
      }
    }

    .faq-section {
      margin-bottom: 2rem;
    }

    .support-section {
      margin-bottom: 2rem;

      .support-links {
        flex-direction: column;
        gap: 1.5rem;
      }
    }

    .cta-section {
      padding: 2rem 1rem;

      .cta-buttons {
        flex-direction: column;
        gap: 1rem;

        button {
          width: 100%;
        }
      }
    }
  }
}

// Small mobile (max 480px)
@media (max-width: 480px) {
  .pre-registration-wrapper {
    padding: 0.75rem;

    .hero-section {
      .hero-title {
        font-size: 1.75rem;
      }
    }

    .section-title {
      font-size: 1.5rem;
    }

    .timeline-section {
      .timeline-number {
        width: 2.5rem;
        height: 2.5rem;
        font-size: 1.25rem;
      }
    }
  }
}
```

---

## 4. Routing Configuration

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/App.jsx`

**Add import at top:**
```jsx
import PreRegistrationView from './views/preRegistrationView/PreRegistrationView';
```

**Add route in Routes component:**
```jsx
<Route path="/pre-registration" element={<PreRegistrationView />} />
```

---

## 5. Navigation Update

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/aboutView/AboutView.jsx`

**Modify the "Become a Member Today" button:**

Change from:
```jsx
onClick={() => navigate('/registration')}
```

To:
```jsx
onClick={() => navigate('/pre-registration')}
```

---

## 6. Design System Compliance

### Color Palette Usage
- **Primary Accent:** `$burnt-orange` (#C4A523) - Used for borders, icons, and accents
- **Secondary Accent:** `$light-orange` (#D4B533) - Used for headings and highlights
- **Background:** `rgba(51, 51, 51, 0.3)` - Consistent with existing patterns
- **Text:** `$main-font-colour` (whitesmoke) - Primary text color
- **Borders:** `$border-colour-light` - Subtle borders matching existing style

### Typography
- **Headings:** 'Bebas Neue' with letter-spacing: 0.1em (brand standard)
- **Body Text:** 'Comfortaa' (inherited from body)
- **Line Height:** 1.6 for optimal readability

---

## 7. Accessibility Features

### Semantic HTML
- `<section>` elements with `aria-labelledby` connecting to heading IDs
- `<article>` for benefit cards
- `<fieldset>` and `<legend>` for requirements section
- Proper heading hierarchy (h1 → h2 → h3)

### ARIA Attributes
- `aria-hidden="true"` on decorative icons
- `aria-labelledby` connecting sections to headings
- Descriptive button `title` attributes

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states with 2px solid outlines and 4px offset
- Logical tab order following visual flow

---

## 8. Responsive Design Strategy

### Breakpoints
1. **Desktop:** > 1024px (default styles)
2. **Tablet:** 768px - 1024px (medium adjustments)
3. **Mobile:** ≤ 812px (major layout changes)
4. **Small Mobile:** ≤ 480px (compact optimizations)

### Key Responsive Behaviors
- **Benefits Grid:** 4 columns → 2 columns → 1 column
- **Timeline:** Horizontal with connecting line → Vertical stacked
- **CTA Buttons:** Side-by-side → Stacked full-width
- **Font Sizes:** Scaled down progressively
- **Padding/Margins:** Reduced for smaller screens

---

## 9. Testing Checklist

### Manual Testing
- [ ] Route navigation from About page works
- [ ] All buttons navigate correctly
- [ ] FAQ accordions expand/collapse properly
- [ ] Responsive layouts work at all breakpoints
- [ ] Keyboard navigation functions correctly
- [ ] Focus indicators are visible
- [ ] Screen reader announces content correctly

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 10. Implementation Steps

### Step 1: Create View Files
1. Create directory: `client/src/views/preRegistrationView/`
2. Create `PreRegistrationView.jsx` with provided code
3. Create `PreRegistrationView.scss` with provided styles

### Step 2: Update Routing
1. Add import in App.jsx
2. Add route in Routes component

### Step 3: Update Navigation
1. Modify AboutView.jsx button onClick handler

### Step 4: Test Implementation
1. Start development server
2. Navigate to /about
3. Click "Become a Member Today"
4. Verify pre-registration page displays correctly
5. Test all interactive elements
6. Test responsive behavior
