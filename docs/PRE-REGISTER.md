# Pre-Registration Information Page - Technical Specification

## Overview
This document provides a complete technical specification for the Pre-Registration Information Page for the BodyVantage application. The page serves as an informational bridge between the About page and Registration page.

**Note:** This implementation uses a simplified, professional-focused design without complex UI components like accordions or hero sections. The focus is on clear, concise communication of membership benefits and requirements.

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
├── Fieldset (Main container with legend)
│   ├── Legend: "Join Body Vantage – Become a Registered Member"
│   ├── Intro Paragraphs
│   ├── "Who Membership Is For" Section
│   ├── "Why Join Body Vantage" Section (Benefits)
│   ├── "What Membership Includes" Section
│   ├── "How to Become a Registered Member" Section (4-step timeline)
│   ├── "Our Commitment" Section
│   └── CTA Buttons Section
└── Support Link (outside fieldset)
```

---

## 2. Complete JSX Implementation

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/preRegistrationView/PreRegistrationView.jsx`

```jsx
import './PreRegistrationView.scss';
import { useNavigate } from 'react-router-dom';
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';

const PreRegistrationView = () => {
  const navigate = useNavigate();

  return (
    <div className="pre-registration-wrapper">
      <fieldset className="fieldSet">
        <legend>Join <BodyVantage /> – Become a Registered Member</legend>

        <p className="intro-text">
          <BodyVantage /> membership is designed for individual professionals
          working across fitness, beauty, rehabilitation, and wellbeing. Whether
          you operate independently, are self-employed, or work as part of a
          wider team, membership recognises you as a professional, not a
          business listing.
        </p>

        <p>
          Joining <BodyVantage /> confirms your commitment to verified
          expertise, professional conduct, and recognised standards.
        </p>

        {/* Who Membership Is For Section */}
        <section className="content-section">
          <h3>Who Membership Is For</h3>
          <p>
            <BodyVantage /> supports individual practitioners including:
          </p>
          <ul>
            <li>Personal trainers and fitness professionals</li>
            <li>Beauticians and aesthetics practitioners</li>
            <li>Physiotherapists and rehabilitation specialists</li>
            <li>Massage therapists and chiropractors</li>
            <li>Wellbeing and holistic practitioners</li>
          </ul>
          <p>
            Membership is open to professionals who value credibility,
            accountability, and long-term trust over visibility alone.
          </p>
        </section>

        {/* Why Join Section */}
        <section className="benefits-section">
          <h3>Why Join <BodyVantage /></h3>
          <p>As a registered member, you benefit from:</p>
          <ul className="detailed-list">
            <li>
              <strong>Individual professional recognition</strong>
              <span>
                Membership confirms that you meet <BodyVantage />{' '}
                standards for qualifications, conduct, and professional
                alignment.
              </span>
            </li>
            <li>
              <strong>Increased client confidence</strong>
              <span>
                Being a registered member helps potential clients feel reassured
                before making contact.
              </span>
            </li>
            <li>
              <strong>Clear, professional representation</strong>
              <span>
                Your profile is structured to communicate your expertise
                accurately, without reliance on marketing language or
                self-promotion.
              </span>
            </li>
            <li>
              <strong>Alignment with a trusted network</strong>
              <span>
                Join a recognised community of professionals committed to
                maintaining standards within their industry.
              </span>
            </li>
          </ul>
        </section>

        {/* What Membership Includes Section */}
        <section className="includes-section">
          <h3>What Membership Includes</h3>
          <p>Registered members receive:</p>
          <ul className="detailed-list">
            <li>
              <strong>Verified member status</strong>
              <span>
                Recognition as a <BodyVantage /> professional following review
                and approval.
              </span>
            </li>
            <li>
              <strong>Structured professional profile</strong>
              <span>
                Designed to present your information consistently and
                responsibly.
              </span>
            </li>
            <li>
              <strong>Trust-led visibility</strong>
              <span>
                Allowing the public to discover professionals through a platform
                focused on credibility, not popularity.
              </span>
            </li>
            <li>
              <strong>Ongoing professional alignment</strong>
              <span>
                Continued access to guidance and standards to support
                responsible representation.
              </span>
            </li>
          </ul>
        </section>

        {/* How to Become a Member Section */}
        <section className="timeline-section">
          <h3>How to Become a Registered Member</h3>
          <div className="timeline-container">
            <div className="timeline-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Apply as an individual professional</strong>
                <p>
                  Submit your personal details, qualifications, and professional
                  information.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Verification and review</strong>
                <p>
                  Your application is reviewed to ensure <BodyVantage />{' '}
                  standards are met.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Approval and registration</strong>
                <p>
                  Once approved, your profile is activated and you become a
                  registered <BodyVantage /> member.
                </p>
              </div>
            </div>
            <div className="timeline-step">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Maintain standards</strong>
                <p>
                  Membership requires ongoing adherence to professional
                  guidelines and responsible representation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commitment Section */}
        <section className="commitment-section">
          <h3>Our Commitment to Members and the Public</h3>
          <p>
            <BodyVantage /> exists to recognise individual professionals, not
            promote businesses or practices. Our focus is on trust, credibility,
            and professional accountability, helping members and the public
            engage with confidence.
          </p>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
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
          Need help?{' '}
          <LinkComp route="contact" routeName="Contact Support" /> or{' '}
          <LinkComp route="faq" routeName="Browse FAQs" />
        </p>
      </div>
    </div>
  );
};

export default PreRegistrationView;
```

---

## 3. Key Sections and Content

### Page Structure

The page is built around a single `<fieldset>` element with multiple internal sections:

1. **Legend and Introduction**
   - Clear membership value proposition
   - Focus on individual professionals, not businesses

2. **Who Membership Is For**
   - List of practitioner types supported
   - Professional values emphasized

3. **Why Join Body Vantage (Benefits)**
   - 4 key benefits with `<strong>` titles and `<span>` descriptions
   - Individual professional recognition
   - Increased client confidence
   - Clear professional representation
   - Alignment with trusted network

4. **What Membership Includes**
   - 4 membership features with `<strong>` titles and `<span>` descriptions
   - Verified member status
   - Structured professional profile
   - Trust-led visibility
   - Ongoing professional alignment

5. **How to Become a Registered Member (Timeline)**
   - 4-step process (not 5)
   - Simple step numbering with content
   - Each step uses `<span>` for number and `<div>` for content

6. **Our Commitment Section**
   - Single paragraph explaining platform values

7. **CTA Buttons**
   - Register Now (navigates to /registration)
   - Back to About (navigates to /about)

8. **Support Link (Outside Fieldset)**
   - Minimal footer with links to Contact and FAQ

---

## 4. SCSS Styling Notes

### File: `/home/gary/Documents/WebApps/dev/bodyVantage/client/src/views/preRegistrationView/PreRegistrationView.scss`

The SCSS file should include styles for:

- `.pre-registration-wrapper` - Main container
- `.fieldSet` - Main fieldset with standard styling
- `.intro-text` - Introduction paragraph styling
- `.content-section` - "Who Membership Is For" section
- `.benefits-section` - Benefits list styling
  - `.detailed-list` - Styled list with `strong` and `span` children
- `.includes-section` - Membership includes list styling
- `.timeline-section` - Timeline container
  - `.timeline-container` - Timeline wrapper
  - `.timeline-step` - Individual step container
  - `.step-number` - Numbered badge
  - `.step-content` - Step text content
- `.commitment-section` - Commitment statement
- `.cta-section` - CTA buttons container
  - `.cta-buttons` - Button group
- `.support-link` - Footer support links

Key design patterns:
- Uses existing design system colors and fonts
- Responsive layout with mobile-first approach
- Simple, clean structure without complex animations
- Focus on readability and professional presentation

---

## 5. Component Dependencies

### Imported Components
```jsx
import BodyVantage from '../../components/bodyVantage/BodyVantage';
import Button from '../../components/button/Button';
import LinkComp from '../../components/linkComp/LinkComp';
```

**Note:** This implementation does NOT use:
- Accordion components (no FAQ section)
- State management (no useState)
- Complex hero sections
- Icon libraries
- Benefit card grids

---

## 6. Routing Configuration

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

## 7. Design System Compliance

### Color Palette Usage
- Uses existing design system variables from `index.scss`
- Follows established color patterns from other views
- Maintains consistent border and accent colors

### Typography
- **Legend/Headings:** 'Bebas Neue' with letter-spacing: 0.1em (brand standard)
- **Body Text:** 'Comfortaa' (inherited from body)
- **Line Height:** 1.6 for optimal readability

### Layout Patterns
- Uses `.fieldSet` class consistent with other forms
- Simple section-based layout
- Minimal decorative elements
- Focus on content clarity

---

## 8. Accessibility Features

### Semantic HTML
- `<fieldset>` and `<legend>` for main container
- `<section>` elements for distinct content areas
- Proper heading hierarchy (legend → h3)
- Semantic lists (`<ul>`, `<li>`)
- Descriptive button attributes

### Navigation
- All buttons have descriptive `title` attributes
- Links use the `LinkComp` component for consistency
- Logical tab order following visual flow
- Clear, actionable button text

---

## 9. Content Strategy

### Tone and Messaging
- Professional and trust-focused
- Emphasizes individual practitioner recognition over business promotion
- Clear distinction from typical directory listings
- Values-driven language (credibility, accountability, trust)

### Key Messaging Themes
1. **Individual Focus:** Membership for professionals, not businesses
2. **Standards-Based:** Emphasis on verification and professional conduct
3. **Trust-Led:** Platform credibility over marketing tactics
4. **Accessible Process:** Clear 4-step timeline for registration

---

## 10. Testing Checklist

### Manual Testing
- [ ] Route navigation works (from /about to /pre-registration)
- [ ] All buttons navigate correctly
- [ ] Support links work properly
- [ ] Responsive layout functions correctly
- [ ] Text is readable and properly formatted
- [ ] BodyVantage component renders correctly throughout

### Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 11. Implementation Notes

### What Changed from Previous Design
The current implementation is significantly simplified compared to earlier designs:

**Removed:**
- Hero section with large title
- Benefit cards in grid layout
- FAQ section with accordions
- Dedicated support section with icons
- Requirements section with checkmarks
- 5-step timeline (reduced to 4 steps)
- Complex responsive grid layouts
- State management for accordions

**Retained:**
- Core informational content
- Simple timeline structure
- CTA buttons for navigation
- Support links (moved to footer)
- Professional, trust-focused messaging
- Fieldset structure

### Design Philosophy
The simplified design reflects a shift toward:
- Content over chrome
- Clarity over complexity
- Professional presentation over marketing flourishes
- Faster load times and simpler maintenance
- Better alignment with platform values (substance over style)
