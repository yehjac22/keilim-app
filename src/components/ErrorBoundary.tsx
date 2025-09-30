import React from "react";

type State = { hasError: boolean; error?: unknown };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    // Useful when debugging; keep for dev.
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold">Something went wrong.</h1>
          <p className="mt-2 text-gray-700">
            The page crashed. Please try going <button onClick={() => location.reload()} className="underline">back</button> or reloading.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
