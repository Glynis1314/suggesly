import { render, screen } from '@testing-library/react';
import App from './App';

test('renders dashboard as default tab', () => {
  render(<App />);
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
});
