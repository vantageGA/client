/* @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ImageTooltip from './ImageTooltip';

describe('ImageTooltip', () => {
  it('shows a larger preview on hover and hides it on mouse leave', () => {
    const { container } = render(
      <ImageTooltip
        src="/badge.png"
        alt="Verified by Body Vantage"
        previewAlt="Verified by Body Vantage larger preview"
        triggerLabel="CERTIFIED"
      />,
    );

    expect(
      screen.getByRole('button', { name: 'CERTIFIED' }),
    ).toBeTruthy();
    expect(
      screen.queryByAltText('Verified by Body Vantage larger preview'),
    ).toBeNull();

    fireEvent.mouseEnter(container.firstChild);

    expect(
      screen.getByAltText('Verified by Body Vantage larger preview'),
    ).toBeTruthy();

    fireEvent.mouseLeave(container.firstChild);

    expect(
      screen.queryByAltText('Verified by Body Vantage larger preview'),
    ).toBeNull();
  });
});
