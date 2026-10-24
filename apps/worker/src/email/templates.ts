import { EmailError, type EmailRequest, type EmailTemplateId } from './types.js';

export interface RenderedTemplate {
  subject: string;
  text: string;
}

interface TemplateDefinition {
  /** Variables that must be present and non-empty strings. */
  required: readonly string[];
  render(v: Record<string, string>, appUrl: string): RenderedTemplate;
}

const FREE_TEXT_MAX_CHARS = 80;

/**
 * Makes candidate-controlled free text safe for a plain-text email: control characters and
 * whitespace (including CR, LF, TAB) collapse to single spaces, then the value is trimmed and capped.
 */
function cleanFreeText(value: string | undefined): string {
  const flat = (value ?? '').replace(/[\p{Cc}\p{Cf}\s]+/gu, ' ').trim();
  const chars = Array.from(flat);
  return chars.length > FREE_TEXT_MAX_CHARS
    ? `${chars.slice(0, FREE_TEXT_MAX_CHARS).join('')}…`
    : flat;
}

const TEMPLATES: Record<EmailTemplateId, TemplateDefinition> = {
  'work_history.email_verification': {
    required: ['code', 'expiresAt'],
    render: (v) => ({
      subject: 'Your TalentSphere verification code',
      text: `Your code is ${v.code}. It expires at ${v.expiresAt}.`,
    }),
  },
  'reference.request': {
    required: ['title', 'companyName', 'referenceId', 'token'],
    render: (v, appUrl) => {
      const who = cleanFreeText(v.candidateName) || 'A candidate';
      const title = cleanFreeText(v.title);
      const companyName = cleanFreeText(v.companyName);
      return {
        subject: `${who} asked you for a reference`,
        text:
          `${who} listed you as a reference for ${title} at ${companyName}. ` +
          `Respond here: ${appUrl}/reference/${v.referenceId}#token=${v.token}`,
      };
    },
  },
};

export function isEmailTemplateId(id: string): id is EmailTemplateId {
  return Object.hasOwn(TEMPLATES, id);
}

/** Validates the variable contract, then renders. Throws a non-retryable EmailError. */
export function renderTemplate(
  request: Pick<EmailRequest, 'templateId' | 'variables'>,
  appUrl: string
): RenderedTemplate {
  if (!isEmailTemplateId(request.templateId)) {
    throw new EmailError('invalid_request', 'Unknown email template.');
  }
  const def = TEMPLATES[request.templateId];
  const values: Record<string, string> = {};
  for (const [k, v] of Object.entries(request.variables)) {
    if (typeof v === 'string' || typeof v === 'number') values[k] = String(v);
  }
  const missing = def.required.filter((k) => !values[k]?.trim());
  if (missing.length > 0) {
    // Names only; values may be one-time secrets.
    throw new EmailError(
      'invalid_request',
      `Email template ${request.templateId} is missing variables: ${missing.join(', ')}.`
    );
  }
  return def.render(values, appUrl);
}
