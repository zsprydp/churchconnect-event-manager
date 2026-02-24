import { render, screen, fireEvent } from '@testing-library/react';
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

test('renders all sidebar navigation items', () => {
  render(<App />);
  const nav = screen.getByRole('navigation');
  expect(nav).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Volunteers')).toBeInTheDocument();
  expect(screen.getByText('Attendees')).toBeInTheDocument();
  expect(screen.getByText('Payments')).toBeInTheDocument();
  expect(screen.getByText('Communications')).toBeInTheDocument();
});

test('shows dashboard (Event Calendar) by default', () => {
  render(<App />);
  expect(screen.getAllByText('Event Calendar').length).toBeGreaterThan(0);
});

test('navigates to Events tab when clicked', () => {
  render(<App />);
  const eventsButtons = screen.getAllByText('Events');
  fireEvent.click(eventsButtons[0]);
  expect(screen.getByText('Youth Summer Retreat')).toBeInTheDocument();
});

test('navigates to Volunteers tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Volunteers'));
  expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
});

test('navigates to Settings tab when clicked', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Settings'));
  expect(screen.getByText('Event Templates')).toBeInTheDocument();
});
