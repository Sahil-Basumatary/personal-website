// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { assertResendAccepted } from './email-result';

describe('assertResendAccepted', () => {
  it('accepts a successful Resend payload', () => {
    expect(() =>
      assertResendAccepted({
        data: { id: 'email_123' },
        error: null,
      })
    ).not.toThrow();
  });

  it('rejects a Resend API error payload', () => {
    expect(() =>
      assertResendAccepted({
        data: null,
        error: { message: 'invalid_from_address' },
      })
    ).toThrow('invalid_from_address');
  });

  it('rejects a missing email id even without an error object', () => {
    expect(() =>
      assertResendAccepted({
        data: null,
        error: null,
      })
    ).toThrow('Email provider rejected the send.');
  });
});
