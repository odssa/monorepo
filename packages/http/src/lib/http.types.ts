 /* eslint-disable @typescript-eslint/no-empty-interface */

declare global {
  export namespace Odssa {

    // Extend the app instance context to include the req/res
    export interface AppInstanceContext extends http.HasHttpContext {} 
    
    export namespace http {

      export interface HasHttpContext {
        req: Express.Request
        res: Express.Response
      }
      

      export interface Middleware<RT = any> {
        (req: Request, res: Response, next: NextFunction): RT | Promise<RT>
      }


      export type Request = Express.Request
      export type Response = Express.Response    
      export interface NextFunction {
        (err?: any): void;
        /**
         * "Break-out" of a router by calling {next('router')};
         * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.router}
         */
        (deferToNext: 'router'): void;
        /**
         * "Break-out" of a route by calling {next('route')};
         * @see {https://expressjs.com/en/guide/using-middleware.html#middleware.application}
         */
        (deferToNext: 'route'): void;
      }
    }
  }
}
export {}