type Environment = Record<string, string | undefined>;
export type DeliveryPolicy = { mode: 'disabled' | 'live' } | { mode: 'staging'; sink: string };

// Deployment-owned configuration only. Request fields never select mode or recipients.
export function getDeliveryPolicy(env: Environment): DeliveryPolicy {
  if (env.TRANSCRIPT_DELIVERY_MODE === 'live' && env.TRANSCRIPT_ENVIRONMENT === 'production') {
    return { mode: 'live' };
  }
  const sink = env.TRANSCRIPT_STAGING_EMAIL_SINK?.trim() ?? '';
  if (env.TRANSCRIPT_DELIVERY_MODE === 'staging' && env.TRANSCRIPT_ENVIRONMENT === 'staging'
      && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(sink)
      && sink.length <= 254) {
    return { mode: 'staging', sink };
  }
  return { mode: 'disabled' };
}

export function publicSubmissionsEnabled(env: Environment): boolean {
  return env.TRANSCRIPT_PUBLIC_SUBMISSIONS_ENABLED === 'true' && getDeliveryPolicy(env).mode !== 'disabled';
}

export function emailRecipient(env: Environment, requested: string): string | null {
  const policy = getDeliveryPolicy(env);
  if (policy.mode === 'disabled') return null;
  return policy.mode === 'staging' ? policy.sink : requested;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}
