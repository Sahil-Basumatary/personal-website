export function assertResendAccepted(result: {
  data: { id: string } | null;
  error: { message: string } | null;
}): void {
  if (result.error || !result.data?.id) {
    throw new Error(
      result.error?.message ?? 'Email provider rejected the send.'
    );
  }
}
