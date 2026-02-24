import { render, screen } from '@testing-library/react';
import App from './App';

test('renders ChurchConnect heading', () => {
  render(<App />);
  const heading = screen.getByText(/ChurchConnect/i);
  expect(heading).toBeInTheDocument();
});

test('renders Event Manager subtitle', () => {
  render(<App />);
  const subtitle = screen.getByText(/Event Manager/i);
  expect(subtitle).toBeInTheDocument();
});
