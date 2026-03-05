import { useCallback, useState } from "react";

export const DEFAULT_AUTH_FORM = {
  fullName: "",
  email: "",
  password: ""
};

function createEmptyAuthForm() {
  return { ...DEFAULT_AUTH_FORM };
}

export function useAuthFormsModule() {
  const [loginMode, setLoginMode] = useState("login");
  const [loginForm, setLoginForm] = useState(createEmptyAuthForm);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  const [merchantMode, setMerchantMode] = useState("register");
  const [merchantForm, setMerchantForm] = useState(createEmptyAuthForm);
  const [merchantSubmitting, setMerchantSubmitting] = useState(false);
  const [merchantFeedback, setMerchantFeedback] = useState(null);

  const updateLoginField = useCallback((field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }, []);

  const updateMerchantField = useCallback((field, value) => {
    setMerchantForm((current) => ({ ...current, [field]: value }));
  }, []);

  const resetLoginForm = useCallback(() => {
    setLoginForm(createEmptyAuthForm());
  }, []);

  const resetMerchantForm = useCallback(() => {
    setMerchantForm(createEmptyAuthForm());
  }, []);

  return {
    loginMode,
    setLoginMode,
    loginForm,
    setLoginForm,
    updateLoginField,
    resetLoginForm,
    loginSubmitting,
    setLoginSubmitting,
    loginFeedback,
    setLoginFeedback,
    merchantMode,
    setMerchantMode,
    merchantForm,
    setMerchantForm,
    updateMerchantField,
    resetMerchantForm,
    merchantSubmitting,
    setMerchantSubmitting,
    merchantFeedback,
    setMerchantFeedback
  };
}
