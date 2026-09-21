export interface DeliveryConfig {
  host: string;
  username: string;
  password: string;
  port: number;
  path: string;
}

// Configuration readiness is not proof of partner connectivity or delivery.
export function isDeliveryConfigured(config: DeliveryConfig): boolean {
  return Boolean(config.host.trim() && config.username.trim() && config.password.trim())
    && Number.isInteger(config.port) && config.port >= 1 && config.port <= 65535
    && config.path.startsWith('/') && !config.path.includes('..')
    && !/[\r\n\0]/.test(config.path);
}

export async function checkServiceReadiness(
  checkDatabase: () => Promise<unknown>,
  deliveryConfigured: boolean,
) {
  let database: 'ok' | 'unavailable' = 'ok';
  try {
    await checkDatabase();
  } catch {
    database = 'unavailable';
  }
  const ready = database === 'ok' && deliveryConfigured;
  return {
    statusCode: ready ? 200 : 503,
    body: {
      status: ready ? 'ready' : 'not_ready',
      checks: {
        database,
        sftpConfiguration: deliveryConfigured ? 'configured' : 'unavailable',
        sftpConnectivity: 'not_checked',
      },
    },
  };
}
