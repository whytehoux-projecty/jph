export const Sentry = {
  captureException: (error: any, context?: any) => {
    console.error("Sentry Captured Exception:", error, context);
  },
  captureMessage: (message: string, level?: string) => {
    console.log(`Sentry Captured Message [${level || "info"}]:`, message);
  },
};
