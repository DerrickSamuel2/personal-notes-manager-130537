import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('Notes app renders sidebar, top bar, and empty panel', () => {
  render(<App />);
  expect(screen.getByRole("banner")).toHaveTextContent(/notes/i);
  expect(screen.getByRole("navigation")).toBeInTheDocument();
  expect(screen.getByRole("main")).toBeInTheDocument();
});
