/* @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Card from './Card';

vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => vi.fn(),
  };
});

afterEach(() => {
  cleanup();
});

const renderCard = (props = {}) =>
  render(
    <MemoryRouter>
      <Card
        id="profile-1"
        name="Jane Doe"
        src="/avatar.jpg"
        alt="Jane Doe"
        description={<p>Coach description</p>}
        rating={4.5}
        reviews={12}
        {...props}
      />
    </MemoryRouter>,
  );

describe('Card qualification badge treatment', () => {
  it('shows the verified badge when qualificationVerificationStatus is approved', () => {
    renderCard({
      qualificationVerificationStatus: 'approved',
      isQualificationsVerified: false,
    });

    expect(screen.getByText('Verified Professional')).toBeTruthy();
  });

  it('does not show the verified badge when qualificationVerificationStatus is pending', () => {
    renderCard({
      qualificationVerificationStatus: 'pending',
      isQualificationsVerified: true,
    });

    expect(screen.queryByText('Verified Professional')).toBeNull();
  });

  it('falls back to isQualificationsVerified when qualification status is missing', () => {
    renderCard({
      qualificationVerificationStatus: undefined,
      isQualificationsVerified: true,
    });

    expect(screen.getByText('Verified Professional')).toBeTruthy();
  });
});
