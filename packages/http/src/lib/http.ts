import { stores } from '@odssa/core'
import { AsyncLocalStorage } from 'async_hooks'
import { Request, Response, NextFunction } from 'express'


export const initMiddleware = 
  (initFn: Odssa.http.AppInitServices): Odssa.http.CreateAppMiddleware => {
    const storage = new AsyncLocalStorage<Odssa.App>()
    if( !stores.root ){
      // TODO: is auto-register a good idea?
      stores.root = storage
    }
    const middleware = async (req: Request, res: Response, next: NextFunction) => {
      const app = await initFn({ req, res })
      req.context = app
      storage.run(app, () => {
        console.log('middlewared', req.url)
        next()
      })
    }

    return { middleware, storage }
  }


declare global {
  export namespace Odssa {

    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface AppInfrastructure extends http.HasHttpContext {}

    export namespace http {

      type AppDefinition<T = any> = {
        [Property in keyof T]: T[Property];
      };

      interface HasHttpContext {
        req: Request
        res: Response
      }

      type AppInitArgs<T> = AppDefinition<T> & HasHttpContext
      type AppInit<T> = (args: AppInitArgs<T>) => Promise<Odssa.App>

      type AppInitServices = (ctx: HasHttpContext) => Promise<Odssa.App>
      

      export interface Middleware<RT = any> {
        (req: Request, res: Response, next: NextFunction): RT | Promise<RT>
      }

      export interface CreateAppMiddleware<RT = any | void | undefined> {
        middleware: Odssa.http.Middleware<RT>,
        storage: AsyncLocalStorage<Odssa.App>
      }
      export interface AppMiddleware<T = any> { 
        (initFn: AppInit<T>): CreateAppMiddleware
      }
    }
  }

  namespace Express {
    export interface Request {
      context: Odssa.App
    }
  }
}