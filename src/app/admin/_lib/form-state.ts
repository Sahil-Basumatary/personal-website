export interface AdminFormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export const idleFormState: AdminFormState = {
  status: 'idle',
  message: '',
};

export function formError(message: string): AdminFormState {
  return { status: 'error', message };
}

export function formSuccess(message: string): AdminFormState {
  return { status: 'success', message };
}
