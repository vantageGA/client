import React, { useState } from 'react';
import Message from './Message';
import './MessageExamples.scss';

/**
 * MessageExamples Component
 *
 * Visual test examples for the Message component showcasing all variants,
 * features, and use cases. Use this component to verify improvements.
 *
 * To use: Import this component in your app or create a test route
 */
const MessageExamples = () => {
  const [showControlled, setShowControlled] = useState(true);
  const [dismissCount, setDismissCount] = useState(0);

  const handleDismiss = () => {
    setDismissCount(prev => prev + 1);
    console.log('Message dismissed!');
  };

  return (
    <div className="message-examples-wrapper">
      <h1>Message Component Examples</h1>
      <p className="subtitle">
        Testing all variants, features, and accessibility improvements
      </p>

      {/* Error Variant (Default) */}
      <section className="example-section">
        <h2>1. Error Variant (Default)</h2>
        <Message message="This is an error message. Something went wrong with your request." />
      </section>

      {/* Success Variant */}
      <section className="example-section">
        <h2>2. Success Variant</h2>
        <Message
          message="Success! Your profile has been updated successfully."
          variant="success"
        />
      </section>

      {/* Warning Variant */}
      <section className="example-section">
        <h2>3. Warning Variant</h2>
        <Message
          message="Warning: Please verify your email address to access all features."
          variant="warning"
        />
      </section>

      {/* Auto-Close Feature */}
      <section className="example-section">
        <h2>4. Auto-Close (5 seconds)</h2>
        <p className="description">This message will automatically dismiss after 5 seconds</p>
        <Message
          message="This message will auto-close in 5 seconds. You can still dismiss it manually."
          variant="success"
          autoClose={5000}
          onDismiss={() => console.log('Auto-closed!')}
        />
      </section>

      {/* Controlled Component */}
      <section className="example-section">
        <h2>5. Controlled Component</h2>
        <p className="description">Parent component controls visibility</p>
        <button
          className="toggle-btn"
          onClick={() => setShowControlled(!showControlled)}
        >
          {showControlled ? 'Hide Message' : 'Show Message'}
        </button>
        <Message
          message="This is a controlled message. Parent component manages visibility."
          variant="success"
          isVisible={showControlled}
          onDismiss={() => setShowControlled(false)}
        />
      </section>

      {/* onDismiss Callback */}
      <section className="example-section">
        <h2>6. onDismiss Callback</h2>
        <p className="description">Dismissed {dismissCount} time(s)</p>
        <Message
          message="Dismiss this message to increment the counter above."
          variant="error"
          onDismiss={handleDismiss}
        />
      </section>

      {/* Long Message Text Wrapping */}
      <section className="example-section">
        <h2>7. Long Message (Text Wrapping)</h2>
        <Message
          message="This is a very long error message that demonstrates how the component handles text wrapping. The close button should remain visible and accessible even with lengthy content. The message text should wrap properly without breaking the layout or pushing the close button off screen. This ensures good responsive behavior across different screen sizes."
          variant="error"
        />
      </section>

      {/* Backward Compatibility - success prop */}
      <section className="example-section">
        <h2>8. Backward Compatibility (Deprecated success prop)</h2>
        <p className="description">Using old success boolean prop (still works)</p>
        <Message
          message="This uses the deprecated 'success' boolean prop for backward compatibility."
          success
        />
      </section>

      {/* All Three Variants Together */}
      <section className="example-section">
        <h2>9. All Variants (Stacked)</h2>
        <div className="stacked-messages">
          <Message
            message="Error: Failed to load user data."
            variant="error"
          />
          <Message
            message="Warning: Your session will expire in 5 minutes."
            variant="warning"
          />
          <Message
            message="Success: Changes saved automatically."
            variant="success"
          />
        </div>
      </section>

      {/* Accessibility Testing Instructions */}
      <section className="example-section accessibility-tests">
        <h2>10. Accessibility Testing Checklist</h2>
        <div className="checklist">
          <h3>Keyboard Navigation</h3>
          <ul>
            <li>Press Tab to focus close button (focus ring should be visible)</li>
            <li>Press Enter or Space to dismiss message</li>
            <li>Tab order should be logical</li>
          </ul>

          <h3>Screen Reader Testing</h3>
          <ul>
            <li>Screen reader should announce "alert" role</li>
            <li>Full message text should be read</li>
            <li>Close button aria-label should be descriptive</li>
          </ul>

          <h3>Touch Targets</h3>
          <ul>
            <li>Close button should be at least 44x44px</li>
            <li>Easy to tap on mobile devices</li>
          </ul>

          <h3>Animation</h3>
          <ul>
            <li>Slide-in animation should be smooth</li>
            <li>Animation should respect prefers-reduced-motion setting</li>
          </ul>
        </div>
      </section>

      {/* Component API Reference */}
      <section className="example-section api-reference">
        <h2>11. Component API</h2>
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>message</code></td>
              <td>string</td>
              <td>required</td>
              <td>The message text to display</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td>'success' | 'error' | 'warning'</td>
              <td>'error'</td>
              <td>Visual style variant</td>
            </tr>
            <tr>
              <td><code>onDismiss</code></td>
              <td>function</td>
              <td>null</td>
              <td>Callback fired when dismissed</td>
            </tr>
            <tr>
              <td><code>autoClose</code></td>
              <td>number</td>
              <td>null</td>
              <td>Auto-dismiss after milliseconds</td>
            </tr>
            <tr>
              <td><code>isVisible</code></td>
              <td>boolean</td>
              <td>undefined</td>
              <td>Control visibility externally</td>
            </tr>
            <tr>
              <td><code>success</code></td>
              <td>boolean</td>
              <td>undefined</td>
              <td>Deprecated: Use variant="success"</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default MessageExamples;
