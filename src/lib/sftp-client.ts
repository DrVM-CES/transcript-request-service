import Client from 'ssh2-sftp-client';
import { isDeliveryConfigured, type DeliveryConfig } from './delivery-readiness';

interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

export class ParchmentSFTPClient {
  private config: DeliveryConfig;
  private isProduction: boolean;

  constructor() {
    this.config = {
      host: process.env.PARCHMENT_SFTP_HOST || '',
      username: process.env.PARCHMENT_SFTP_USERNAME || '',
      password: process.env.PARCHMENT_SFTP_PASSWORD || '',
      port: Number(process.env.PARCHMENT_SFTP_PORT || '22'),
      path: process.env.PARCHMENT_SFTP_PATH || '/incoming'
    };

    this.isProduction = isDeliveryConfigured(this.config);
  }

  /**
   * Upload XML content to Parchment SFTP server
   */
  async uploadXML(xmlContent: string, fileName: string): Promise<UploadResult> {
    if (!this.isProduction) {
      return { success: false, error: 'SFTP_NOT_CONFIGURED' };
    }
    const sftp = new Client();
    
    try {
      // Connect to SFTP server
      await sftp.connect({
        host: this.config.host,
        username: this.config.username,
        password: this.config.password,
        port: this.config.port,
        readyTimeout: 20000,
        retries: 2
      });

      // Ensure the upload directory exists
      const remotePath = `${this.config.path}/${fileName}_request.xml`;
      
      // Upload the XML content
      await sftp.put(Buffer.from(xmlContent, 'utf8'), remotePath);

      console.log(`Successfully uploaded XML to: ${remotePath}`);
      
      return {
        success: true,
        path: remotePath
      };

    } catch (error) {
      const errorMessage = 'SFTP_UPLOAD_FAILED';
      console.error('SFTP upload failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      try {
        await sftp.end();
      } catch (closeError) {
        console.warn('SFTP_CLOSE_FAILED');
      }
    }
  }

  /**
   * Test SFTP connection without uploading files
   */
  async testConnection(): Promise<UploadResult> {
    if (!this.isProduction) {
      return { success: false, error: 'SFTP_NOT_CONFIGURED' };
    }
    const sftp = new Client();
    
    try {
      await sftp.connect({
        host: this.config.host,
        username: this.config.username,
        password: this.config.password,
        port: this.config.port,
        readyTimeout: 10000,
        retries: 1
      });

      // Try to list directory to verify permissions
      await sftp.list(this.config.path);

      return {
        success: true,
        path: this.config.path
      };

    } catch (error) {
      const errorMessage = 'SFTP_CONNECTION_FAILED';
      console.error('SFTP connection test failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      try {
        await sftp.end();
      } catch (closeError) {
        console.warn('SFTP_CLOSE_FAILED');
      }
    }
  }

  /**
   * Check if we're in production mode with valid SFTP config
   */
  isProductionMode(): boolean {
    return this.isProduction;
  }

  /**
   * Get configuration summary for health checks
   */
  getConfigSummary() {
    return {
      host: this.config.host ? '***configured***' : 'not set',
      username: this.config.username ? '***configured***' : 'not set', 
      password: this.config.password ? '***configured***' : 'not set',
      port: this.config.port,
      path: this.config.path,
      mode: this.isProduction ? 'production' : 'development'
    };
  }
}

// Export a singleton instance
export const parchmentSFTP = new ParchmentSFTPClient();

/** Upload only through the configured transport; never simulate delivery. */
export async function uploadTranscriptXML(
  xmlContent: string,
  fileName: string
): Promise<UploadResult> {
  return parchmentSFTP.uploadXML(xmlContent, fileName);
}
