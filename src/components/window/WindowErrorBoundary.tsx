'use client';

import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { WindowCrashRecovery } from './WindowCrashRecovery';

export function reportWindowCrash(
  error: Error,
  info: ErrorInfo,
  meta: { windowId: string; windowTitle: string }
): void {
  Sentry.captureException(error, {
    tags: {
      scope: 'window-error-boundary',
      windowId: meta.windowId,
      windowTitle: meta.windowTitle,
    },
    extra: {
      componentStack: info.componentStack,
    },
  });
}

interface WindowErrorBoundaryProps {
  windowId: string;
  windowTitle: string;
  onClose: () => void;
  children: ReactNode;
  reportError?: (
    error: Error,
    info: ErrorInfo,
    meta: { windowId: string; windowTitle: string }
  ) => void;
}

interface WindowErrorBoundaryState {
  error: Error | null;
  retryKey: number;
}

export class WindowErrorBoundary extends Component<
  WindowErrorBoundaryProps,
  WindowErrorBoundaryState
> {
  state: WindowErrorBoundaryState = {
    error: null,
    retryKey: 0,
  };

  private hasReported = false;

  static getDerivedStateFromError(
    error: Error
  ): Partial<WindowErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (this.hasReported) return;
    this.hasReported = true;
    const report = this.props.reportError ?? reportWindowCrash;
    report(error, info, {
      windowId: this.props.windowId,
      windowTitle: this.props.windowTitle,
    });
  }

  private handleRetry = (): void => {
    this.hasReported = false;
    this.setState((state) => ({
      error: null,
      retryKey: state.retryKey + 1,
    }));
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <WindowCrashRecovery
          windowId={this.props.windowId}
          windowTitle={this.props.windowTitle}
          onRetry={this.handleRetry}
          onClose={this.props.onClose}
        />
      );
    }

    return <Fragment key={this.state.retryKey}>{this.props.children}</Fragment>;
  }
}
