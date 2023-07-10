import { AsyncLocalStorage } from "async_hooks"


export const stores = {
  root: undefined
} as { root: AsyncLocalStorage<Odssa.App> | undefined }


interface WithAppCallback<T = unknown> {
  (app: Odssa.App): T | Promise<T>
}
export const withApp = (cb: WithAppCallback) => {
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


    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface AppInfrastructure {}

    export interface AppConfig {
      name: string
    }

    export interface BaseApp extends AppInfrastructure, AppConfig { }
    

    export type AppServicesType = Omit<BaseApp, keyof AppInfrastructure | keyof AppConfig>
    
    /**
     * 
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface AppServices extends AppServicesType { }

    export interface App extends AppInfrastructure, AppConfig, AppServices { }

    export interface AppInit<T = void> { 
      (args: T): Promise<Odssa.App>
    }
  }
}