/* @vitest-environment jsdom */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';

vi.mock('axios');

describe('App', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        profiles: [],
        page: 1,
        pages: 1,
        total: 0,
      },
    });
  });

  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(container).toBeTruthy();
  });
});
