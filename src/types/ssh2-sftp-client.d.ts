declare module 'ssh2-sftp-client' {
  export default class SFTPClient {
    connect(config: any): Promise<void>;
    end(): Promise<void>;
    put(input: Buffer | string, remotePath: string): Promise<string>;
    list(remotePath: string): Promise<any[]>;
  }
}
