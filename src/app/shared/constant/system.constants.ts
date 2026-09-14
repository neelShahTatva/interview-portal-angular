export const SYSTEM_CONSTANTS = {
  PASSWORD_REGEX: '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$',
  USERNAME_REGEX: '^(?=.*[a-zA-Z])[a-zA-Z0-9]+(?:[._][a-zA-Z0-9]+)*$',
  ASSESSMENT_TITLE_REGEX: "^[A-Za-z0-9][A-Za-z0-9 ._&()'\\-,:]*$",
  ASSESSMENT_TIME_LIMIT_MIN: 30,
  ASSESSMENT_TIME_LIMIT_MAX: 180,
};
