"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw } from "lucide-react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    return { hasError: true, message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Kapruka Buddy ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-white px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-kapruka-surface">
            <span className="text-2xl">😮</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">Something went wrong</p>
            <p className="mt-1 text-sm text-kapruka-muted">{this.state.message}</p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 rounded-xl bg-kapruka-purple px-5 py-2.5 text-sm font-semibold text-white hover:bg-kapruka-purple/90"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
