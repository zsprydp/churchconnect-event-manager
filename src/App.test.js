import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const renderApp = () =>
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

test('renders ChurchConnect heading', () => {
  renderApp();
  const heading = screen.getByText(/ChurchConnect/i);
  expect(heading).toBeInTheDocument();
});

test('renders Event Manager subtitle', () => {
  renderApp();
  const subtitle = screen.getByText(/Event Manager/i);
  expect(subtitle).toBeInTheDocument();
});

test('renders all sidebar navigation items', () => {
  renderApp();
  const nav = screen.getByRole('navigation');
  expect(nav).toBeInTheDocument();
  expect(screen.getByText('Dashboard')).toBeInTheDocument();
  expect(screen.getByText('Volunteers')).toBeInTheDocument();
  expect(screen.getByText('Attendees')).toBeInTheDocument();
  expect(screen.getByText('Giving')).toBeInTheDocument();
  expect(screen.getByText('Communications')).toBeInTheDocument();
});

test('shows dashboard (Event Calendar) by default', () => {
  renderApp();
  expect(screen.getAllByText('Event Calendar').length).toBeGreaterThan(0);
});

test('navigates to Events tab when clicked', async () => {
  renderApp();
  const eventsButtons = screen.getAllByText('Events');
  fireEvent.click(eventsButtons[0]);
  expect(await screen.findByText('Youth Fall Retreat')).toBeInTheDocument();
});

test('navigates to Volunteers tab when clicked', async () => {
  renderApp();
  fireEvent.click(screen.getByText('Volunteers'));
  expect(await screen.findByText('Sarah Johnson')).toBeInTheDocument();
});

test('navigates to Settings tab when clicked', async () => {
  renderApp();
  fireEvent.click(screen.getByText('Settings'));
  expect(await screen.findByText('Event Templates')).toBeInTheDocument();
});

test('shows user profile in sidebar (demo mode)', () => {
  renderApp();
  expect(screen.getByText('Demo Admin')).toBeInTheDocument();
});
