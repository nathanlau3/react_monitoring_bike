import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/features/authSlice";

export const useAuthHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(() => {
    console.log("Unauthorized access detected - logging out");
    dispatch(logout());
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  const checkAuthError = useCallback(
    (error) => {
      if (error?.status === 401 || error?.payload?.status === 401) {
        handleUnauthorized();
        return true; // Indicates we handled an auth error
      }
      return false; // Not an auth error
    },
    [handleUnauthorized]
  );

  return {
    handleUnauthorized,
    checkAuthError,
  };
};
