/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Button, Input, Form } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useParams } from "next/navigation";
import { Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { authService } from "@/services/authService";

interface FormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ email: string; token: string }>();
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(3); // Countdown state

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);
  const { token, email } = params;
  useEffect(() => {
    console.log("token:", token);
    console.log("email:", email);

    if (!token || !email) {
      setIsValidToken(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await authService.verifyResetToken(token, email);
        console.log("Token verification response:", response);
        setIsValidToken(response.isValid);
      } catch (error) {
        console.error("Token validation error:", error);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, [params, token, email]);

  const validationSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
  });

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, setErrors, setStatus }: FormikHelpers<FormValues>
  ) => {
    try {
      if (!token || !email) {
        setErrors({ password: "Invalid reset token" });
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", token);
      formData.append("password", values.password);

      const response = await authService.resetPassword(formData);

      if (response.success) {
        setStatus({ success: true });

        // Start countdown before redirecting
        let timer = 3;
        const countdownInterval = setInterval(() => {
          if (timer > 0) {
            setCountdown(timer - 1);
            timer--;
          } else {
            clearInterval(countdownInterval);
            router.push("/auth/signin");
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      setErrors({ password: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
          <div className="flex flex-col gap-1 items-center">
            <Icon
              icon="solar:danger-triangle-bold"
              className="text-danger text-5xl mb-2"
            />
            <h1 className="text-large font-medium">Invalid or Expired Link</h1>
            <p className="text-small text-default-500 text-center mt-2">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white mt-4"
              color="primary"
              onPress={() => router.push("/auth/forgot-password")}
            >
              Request New Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <div className="flex flex-col gap-1">
          <h1 className="text-large font-medium">Reset Your Password</h1>
          <p className="text-small text-default-500">
            Enter your new password below
          </p>
        </div>

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            handleChange,
            handleSubmit,
            isSubmitting,
            errors,
            status,
          }) => (
            <Form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              {status?.success && (
                <div className="bg-success-100 text-success-700 p-3 rounded-medium mb-2">
                  Password has been reset successfully! Redirecting to login in{" "}
                  {countdown}s...
                </div>
              )}

              <Input
                isRequired
                endContent={
                  <button type="button" onClick={toggleVisibility}>
                    {isVisible ? (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-closed-linear"
                      />
                    ) : (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-bold"
                      />
                    )}
                  </button>
                }
                label="New Password"
                name="password"
                placeholder="Enter your new password"
                type={isVisible ? "text" : "password"}
                variant="bordered"
                value={values.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p style={{ color: "red" }}>{errors.password}</p>
              )}

              <Input
                isRequired
                endContent={
                  <button type="button" onClick={toggleConfirmVisibility}>
                    {isConfirmVisible ? (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-closed-linear"
                      />
                    ) : (
                      <Icon
                        className="pointer-events-none text-2xl text-default-400"
                        icon="solar:eye-bold"
                      />
                    )}
                  </button>
                }
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                type={isConfirmVisible ? "text" : "password"}
                variant="bordered"
                value={values.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && (
                <p style={{ color: "red" }}>{errors.confirmPassword}</p>
              )}

              <Button
                className="w-full bg-primary-500 hover:bg-primary-600 text-white mt-2"
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
