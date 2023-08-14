// allow extension interfaces:
/* eslint-disable @typescript-eslint/no-empty-interface */

import { AsyncLocalStorage } from "async_hooks"

export const stores = {
  root: undefined
} as { root: AsyncLocalStorage<Odssa.App> | undefined }


export interface WithAppCallback<T = unknown> {
  (app: Odssa.App): T | Promise<T>
}

export const withApp = <T>(cb: WithAppCallback<T>) => {
  if( !stores.root ){
    // TODO: maybe just try and find the "closest" store?
    throw new Error('No store initialized; did you set things up correctly?')
  }

  const app = stores.root.getStore()
  if( app === undefined ){
    throw new Error('Could not locate App from store; did this call happen outside of the async scope?')
  }

  return cb(app)
}


declare global {
  export namespace Odssa {

    export interface AppConfig {
      name: string
    }

    /**
     * Extension interface 
     */
    export interface AppInfrastructure {
      // put your database connections / caches / etc here
    }

            
    export interface AppServices  { }
    
    // useful for instanced apps (per req/res, per event, etc)
    export interface AppInstanceContext { }



    export interface App 
      extends 
        AppConfig, 
        AppInfrastructure, 
        AppServices,
        AppInstanceContext { }

    
    /*
     * Instantiators
     */
    type AppInitInfrastructure = (config: AppConfig) => Promise<Odssa.AppInfrastructure>

  }
}