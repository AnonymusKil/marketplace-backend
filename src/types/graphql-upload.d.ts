import "express";

declare module "graphql-upload" {
  const GraphQLUpload: any;
  export default GraphQLUpload;
}

declare module "graphql-upload" {
  export function graphqlUploadExpress(options?: any): any;
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer?: Buffer;
      }
    }
  }
}

export {};