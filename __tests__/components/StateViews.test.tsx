import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadingState, ErrorState, EmptyState } from '../../src/components/StateViews/StateViews';

describe('StateViews Components', () => {
  describe('LoadingState', () => {
    it('renders with default message', () => {
      render(<LoadingState />);

      expect(screen.getByRole('progressbar')).toBeTruthy();
      expect(screen.getByText('Loading charging data...')).toBeTruthy();
    });

    it('renders with custom message', () => {
      render(<LoadingState message="Please wait..." />);

      expect(screen.getByText('Please wait...')).toBeTruthy();
    });
  });

  describe('ErrorState', () => {
    it('renders error message', () => {
      render(<ErrorState message="Network error occurred" />);

      expect(screen.getByRole('alert')).toBeTruthy();
      expect(screen.getByText('Something went wrong')).toBeTruthy();
      expect(screen.getByText('Network error occurred')).toBeTruthy();
    });

    it('renders retry button when onRetry is provided', () => {
      const mockRetry = jest.fn();
      render(<ErrorState message="Error" onRetry={mockRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
    });

    it('does not render retry button when onRetry is not provided', () => {
      render(<ErrorState message="Error" />);

      expect(screen.queryByRole('button')).toBeNull();
    });
  });

  describe('EmptyState', () => {
    it('renders with default text', () => {
      render(<EmptyState />);

      expect(screen.getByText('No Data Available')).toBeTruthy();
      expect(
        screen.getByText('There is no charging data to display for the last 24 hours.')
      ).toBeTruthy();
    });

    it('renders with custom title and description', () => {
      render(<EmptyState title="Custom Title" description="Custom description" />);

      expect(screen.getByText('Custom Title')).toBeTruthy();
      expect(screen.getByText('Custom description')).toBeTruthy();
    });
  });
});
