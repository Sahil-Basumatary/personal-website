import { reportServerError } from '@/lib/observability/report-server-error';

export const ACTION_FAILURE_MESSAGE =
  'Something went wrong. Your changes were not saved. Try again.';

export function reportActionFailure(
  error: unknown,
  action: string
): typeof ACTION_FAILURE_MESSAGE {
  reportServerError(error, {
    scope: `admin-action:${action}`,
  });
  return ACTION_FAILURE_MESSAGE;
}
