import { isRouteErrorResponse, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const status = isRouteErrorResponse(error) ? error.status : 500;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ground px-pad text-center text-ink">
      <h1 className="text-[clamp(88px,15vw,190px)] leading-none font-light tracking-[-0.04em]">
        {status}
      </h1>
      <p className="mt-4 text-[clamp(15px,1.6vw,19px)] text-ink-3">
        {status === 404 ? "nothing is stored at this path" : "something went wrong"}
      </p>
    </main>
  );
};

export default ErrorPage;
