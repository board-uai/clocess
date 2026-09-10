import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : "Something went wrong";

  return (
    <div className="flex min-h-svh flex-col justify-center items-center gap-4 text-center">
      <p className="text-8xl font-semibold">{status}</p>
      <p className="text-ink-3">{message}</p>
    </div>
  );
};

export default ErrorPage;
