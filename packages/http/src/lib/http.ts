// allow extension interfaces:
/* eslint-disable @typescript-eslint/no-empty-interface */


import express, { Router, Request, Response, NextFunction } from 'express'
import { BaseBuilder, AppInstanceFactory, ConfigBuilder, ServiceInitializer } from '@odssa/core'
import './http.types'

export { Router }
export interface Handler<RT = unknown> {
  (req: Request, res: Response): RT
}
export interface Middleware<RT = unknown> {
  (req: Request, res: Response, next: NextFunction): RT
}

export const initMiddleware = (factory: AppInstanceFactory) => {
  const middleware: Odssa.http.Middleware = async (req, res, next) => {
    factory.withInstance({ req, res }, () => {
      next()
    })
  }
  return middleware
}


type ExportedMethods = 'listen' | 'router' 
export type ActionableWebBuilder = Pick<WebBuilder, ExportedMethods>


type Primitatives = 
  { type: 'router', route?: string, router: Router }
  | { type: 'middleware', middleware: Middleware }

export class WebBuilder extends BaseBuilder<ActionableWebBuilder> {
  #stack: Primitatives[] = []

  static define(){
    return new WebBuilder() as ConfigBuilder<WebBuilder>
  }

  router(router: Router): ActionableWebBuilder
  router(route: string, router: Router): ActionableWebBuilder
  router(routerOrRoute: Router | string, router?: Router): ActionableWebBuilder {
    if( router && typeof(routerOrRoute) === 'string'  ){
      this.#stack.push({ type: 'router', router, route: routerOrRoute })
    }else {
      this.#stack.push({ type: 'router', router: routerOrRoute as Router })
    }
    return this as ActionableWebBuilder
  }

  middleware(middleware: Middleware){
    this.#stack.push({ type: 'middleware', middleware})
  }

  async listen(port?: number){
    const app = express()

    const factory = await this.buildInstanceFactory()
    const imw = initMiddleware(factory)

    app.use(imw)

    for(const t of this.#stack){
      switch(t.type){
        case 'middleware':
          app.use(t.middleware)
          break;
        
        case 'router':
          if( t.route ){
            app.use(t.route, t.router)
          }else{
            app.use(t.router)
          }
          break;

        default:
          // @ts-expect-error defensive type check here 
          throw new Error('Unexpected web type: ' + t.type)
      }
    }

    const server = await new Promise( resolve => {
      const s = app.listen(port, () => {
        resolve(s)
      })
    })

    return { server, app, port }
  }

}