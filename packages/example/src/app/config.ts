declare global {
  export namespace Odssa {
    export interface AppConfig {
      PG_URL: string
    }
  }
}

export const initConfig = async () => {
  // Note, you could just use a hardcoded config
  //   or you could evaluate runtime options
  //   or pull from consul/vault/etc
  const config: Odssa.AppConfig = { 
    name: 'Example App',
    PG_URL: 'jdbc:postgresql://localhost:5441/npm_proxy'
  }
  return config
}

