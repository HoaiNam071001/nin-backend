declare module 'webhdfs' {
  interface WebHDFSClient {
    createWriteStream(path: string, options?: any): NodeJS.WritableStream;
    createReadStream(path: string, options?: any): NodeJS.ReadableStream;
    listStatus(path: string, callback: (err: any, status: any) => void): void;
    list(path: string, callback: (error: any, result: any) => void): void;
    // Thêm các phương thức khác nếu cần thiết
  }

  function createClient(options: {
    user: string;
    host: string;
    port: number;
    path: string;
  }): WebHDFSClient;

  export { createClient };
}
