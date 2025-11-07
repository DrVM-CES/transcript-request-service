import Client from 'ssh2-sftp-client';

interface SFTPConfig {
  host: string;
  username: string;
  password: string;
  port?: number;
  path?: string;
}

interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

export class ParchmentSFTPClient {
  private config: SFTPConfig;
  private isProduction: boolean;

  constructor() {
    this.config = {
      host: process.env.PARCHMENT_SFTP_HOST || '',
      username: process.env.PARCHMENT_SFTP_USERNAME || '',
      password: process.env.PARCHMENT_SFTP_PASSWORD || '',
      port: parseInt(process.env.PARCHMENT_SFTP_PORT || '22'),
      path: process.env.PARCHMENT_SFTP_PATH || '/incoming'
    };

    // Determine if we're in production mode
    this.isProduction = !!(this.config.host && this.config.username && this.config.password);
    
    if (this.isProduction) {
      console.log('🚀 SFTP Client initialized in production mode');
    } else {
      console.log('🔧 SFTP Client initialized in development mode (will simulate uploads)');
    }
  }

  /**
   * Upload XML content to Parchment SFTP server
   */
  async uploadXML(xmlContent: string, fileName: string): Promise<UploadResult> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown SFTP error';
      console.error('SFTP upload failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      try {
        await sftp.end();
      } catch (closeError) {
        console.warn('Error closing SFTP connection:', closeError);
      }
    }
  }

  /**
   * Test SFTP connection without uploading files
   */
  async testConnection(): Promise<UploadResult> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
      console.error('SFTP connection test failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      try {
        await sftp.end();
      } catch (closeError) {
        console.warn('Error closing SFTP connection:', closeError);
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

/**
 * Upload transcript request XML to Parchment SFTP
 * Falls back to console logging in development
 */
export async function uploadTranscriptXML(
  xmlContent: string, 
  fileName: string
): Promise<UploadResult> {
  try {
    if (parchmentSFTP.isProductionMode()) {
      return await parchmentSFTP.uploadXML(xmlContent, fileName);
    } else {
      // Development mode - log instead of upload
      console.log('=== DEVELOPMENT MODE: Would upload to SFTP ===');
      console.log(`File: ${fileName}_request.xml`);
      console.log(`XML Content Preview: ${xmlContent.substring(0, 200)}...`);
      console.log('===============================================');
      
      return {
        success: true,
        path: `dev-mode/${fileName}_request.xml`
      };
    }
  } catch (error) {
    console.error('Failed to upload transcript XML:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}