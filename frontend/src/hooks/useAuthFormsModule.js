import { useCallback, useState } from "react";

const REMEMBER_LOGIN_KEY = "aism.rememberLogin";
const REMEMBER_MERCHANT_LOGIN_KEY = "aism.rememberMerchantLogin";

export const DEFAULT_AUTH_FORM = {
  fullName: "",
  email: "",
  password: "",
  rememberPassword: false
};

function createEmptyAuthForm() {
  return { ...DEFAULT_AUTH_FORM };
}

function createRememberedForm(rememberKey) {
  const form = createEmptyAuthForm();
  const raw = window.localStorage.getItem(rememberKey);
  if (!raw) {
    return form;
  }

  try {
    const data = JSON.parse(raw);
    if (!data?.email || !data?.password) {
      return form;
    }
    return {
      ...form,
      email: String(data.email),
      password: String(data.password),
      rememberPassword: true
    };
  } catch {
    window.localStorage.removeItem(rememberKey);
    return form;
  }
}

function createInitialLoginForm() {
  return createRememberedForm(REMEMBER_LOGIN_KEY);
}

function createInitialMerchantForm() {
  return createRememberedForm(REMEMBER_MERCHANT_LOGIN_KEY);
}

function persistRememberedForm(rememberKey, email, password, rememberPassword) {
  if (!rememberPassword) {
    window.localStorage.removeItem(rememberKey);
    return;
  }

  window.localStorage.setItem(
    rememberKey,
    JSON.stringify({
      email: email || "",
      password: password || ""
    })
  );
}

export function useAuthFormsModule() {
  const [loginMode, setLoginMode] = useState("login");
  const [loginForm, setLoginForm] = useState(createInitialLoginForm);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState(null);

  const [merchantMode, setMerchantMode] = useState("register");
  const [merchantForm, setMerchantForm] = useState(createInitialMerchantForm);
  const [merchantSubmitting, setMerchantSubmitting] = useState(false);
  const [merchantFeedback, setMerchantFeedback] = useState(null);

  const updateLoginField = useCallback((field, value) => {
    setLoginForm((current) => ({ ...current, [field]: value }));
  }, []);

  const updateMerchantField = useCallback((field, value) => {
    setMerchantForm((current) => ({ ...current, [field]: value }));
  }, []);

  const resetLoginForm = useCallback((options = {}) => {
    if (options.useRemembered !== false) {
      setLoginForm(createInitialLoginForm());
      return;
    }
    setLoginForm(createEmptyAuthForm());
  }, []);

  const resetMerchantForm = useCallback((options = {}) => {
    if (options.useRemembered) {
      setMerchantForm(createInitialMerchantForm());
      return;
    }
    setMerchantForm(createEmptyAuthForm());
  }, []);

  const persistRememberedLogin = useCallback((email, password, rememberPassword) => {
    persistRememberedForm(REMEMBER_LOGIN_KEY, email, password, rememberPassword);
  }, []);

  const persistRememberedMerchantLogin = useCallback((email, password, rememberPassword) => {
    persistRememberedForm(REMEMBER_MERCHANT_LOGIN_KEY, email, password, rememberPassword);
  }, []);

  return {
    loginMode,
    setLoginMode,
    loginForm,
    setLoginForm,
    updateLoginField,
    resetLoginForm,
    persistRememberedLogin,
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
    persistRememberedMerchantLogin,
    merchantSubmitting,
    setMerchantSubmitting,
    merchantFeedback,
    setMerchantFeedback
  };
}
