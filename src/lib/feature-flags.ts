export const FEATURE_FLAGS = {
  EMAIL_SIGNUP: "email_signup",
  ONBOARDING: "onboarding",
} as const;

export type FeatureFlagKey = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS];
