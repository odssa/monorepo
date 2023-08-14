import URL from 'node:url'
import { default as PgPromise, IDatabase } from 'pg-promise'

declare global {
  export namespace Odssa {
    export interface AppInfrastructure {
      pg: IDatabase<unknown>
    }
  }
}

export const initInf: Odssa.AppInitInfrastructure = async(cfg) => {
  const uri = new URL.URL(cfg.PG_URL.replace("jdbc:", ""));
  const settings = {
    opts: {
      // receive(e){ }
    },
    config: {
      host: uri.hostname,
      port: parseInt(uri.port) || 5432,
      database: uri.pathname.startsWith('/') ? uri.pathname.substring(1) : uri.pathname,
      user: uri.username,
      password: uri.password
    } as any
  }
  if( uri.search.indexOf('ssl=true') >= 0 ){
    settings.config.ssl = true
  }
  
  const pg = PgPromise(settings.opts)(settings.config)
  return {
    ...cfg,
    pg
  }
}