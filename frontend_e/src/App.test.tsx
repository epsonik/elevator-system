import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders elevator system heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Elevator System Simulation/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders instructions', () => {
  render(<App />);
  const instructionsElement = screen.getByText(/How to Use/i);
  expect(instructionsElement).toBeInTheDocument();
});

test('renders connection status indicator', () => {
  render(<App />);
  const statusElement = screen.getByRole('heading', { level: 1 });
  expect(statusElement).toBeInTheDocument();
  // Check that either Connected or Disconnected text exists
  const statusIndicators = screen.getAllByText(/Connected|Disconnected/i);
  expect(statusIndicators.length).toBeGreaterThan(0);
});
