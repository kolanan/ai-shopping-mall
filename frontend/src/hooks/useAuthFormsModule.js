import { useState } from "react";

export const DEFAULT_AUTH_FORM = {
  fullName: "",
  email: "",
  password: ""
};

export function useAuthFormsModule() {
  const [loginMode, setLoginMode] = useState("login");
  const [loginForm, setLoginForm] = useState(DEFAULT_AUTH_FORM);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  const [merchantForm, setMerchantForm] = useState(DEFAULT_AUTH_FORM);
  const [merchantSubmitting, setMerchantSubmitting] = useState(false);
  const [merchantFeedback, setMerchantFeedback] = useState(null);

  return {
    loginMode,
    setLoginMode,
    loginForm,
    setLoginForm,
    loginSubmitting,
    setLoginSubmitting,
    loginFeedback,
    setLoginFeedback,
    merchantForm,
    setMerchantForm,
    merchantSubmitting,
    setMerchantSubmitting,
    merchantFeedback,
    setMerchantFeedback
  };
}
