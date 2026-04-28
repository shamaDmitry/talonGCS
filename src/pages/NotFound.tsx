import { NavLink, useLocation } from "react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-destructive">404</h1>

        <p className="mb-4 text-xl text-destructive">Oops! Page not found</p>

        <Button asChild variant="destructive">
          <NavLink to="/">Return to Home</NavLink>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
