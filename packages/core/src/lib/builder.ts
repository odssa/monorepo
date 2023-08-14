
import { AsyncLocalStorage } from 'async_hooks'
import { stores, type WithAppCallback } from './apps'


export type ConfigInitializer =
  Odssa.AppConfig
  | (() => Promise<Odssa.AppConfig>)

export interface InfInitializer {
  (config: Odssa.AppConfig): Promise<Odssa.AppInfrastructure>
}
export interface ServiceInitializer {
  (inf: Odssa.AppInfrastructure, config: Odssa.AppConfig): Promise<Odssa.AppServices>
  (inf: Odssa.AppInfrastructure, config: Odssa.AppConfig, initContext: Odssa.AppInstanceContext): Promise<Odssa.AppServices>
}


export type ConfigBuilder<R extends BaseBuilder<unknown> = BaseBuilder<unknown>> = Pick<R, 'config'>
export type InfBuilder<R extends BaseBuilder<unknown> = BaseBuilder<unknown>> = Pick<R, 'infrastructure'>
export type ServicesBuilder<R extends BaseBuilder<unknown> = BaseBuilder<unknown>> = Pick<R, 'services'>
// no generics here, to avoid cycles
export type ActionableBuilder = Pick<BaseBuilder<any>, 'buildSingletonApp' | 'buildInstanceFactory'>


export abstract class BaseBuilder<SB> {
  #config?: ConfigInitializer 
  #inf?: InfInitializer
  #services?: ServiceInitializer

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected constructor(){ }

  config(config: ConfigInitializer){
    type S = typeof this
    this.#config = config
    return this as InfBuilder<S>
  }

  infrastructure(inf: InfInitializer){
    type S = typeof this
    this.#inf = inf
    return this as ServicesBuilder<S>
  }

  services(services: ServiceInitializer): SB {
    this.#services = services
    return this as unknown as SB
  }

  async buildSingletonApp(context: Odssa.AppInstanceContext): Promise<Odssa.App> {
    if( !this.#config || !this.#inf || !this.#services ){
      throw new Error(
        `Missing initializers;`
          + ` config=${!!this.#config}`
          + ` inf=${!!this.#inf}`
          + ` services=${!!this.#services}`
      )
    }

    const config = typeof(this.#config) === 'function' ? await this.#config() : this.#config
    const inf = await this.#inf(config)
    const svc = await this.#services(inf, config, context)

    return {
      ...config,
      ...inf,
      ...svc,
      ...context
    }
  }

  async buildInstanceFactory(): Promise<AppInstanceFactory> {
    if( !this.#config || !this.#inf || !this.#services ){
      throw new Error(
        `Missing initializers;`
          + `config=${!!this.#config} `
          + `inf=${!!this.#inf} `
          + `services=${!!this.#services} `
      )
    }

    const config = typeof(this.#config) === 'function' ? await this.#config() : this.#config
    const inf = await this.#inf(config)
    const factory = new AppInstanceFactory(config, inf, this.#services)
    return factory
  }

}


export class AppInstanceFactory {
  #storage = new AsyncLocalStorage<Odssa.App>()
  constructor(
    public config: Odssa.AppConfig, 
    public inf: Odssa.AppInfrastructure,
    public svcInit: ServiceInitializer
  ){
    if( stores.root ){
      throw new Error('Multiple root stores not supported yet')
    }
    stores.root = this.#storage
  }

  async withInstance<T>(context: Odssa.AppInstanceContext, cb: WithAppCallback<T>): Promise<T>{
    const svc = await this.svcInit(this.inf, this.config, context)
    const app: Odssa.App = {
      ...this.config,
      ...this.inf,
      ...context,
      ...svc
    }

    return await new Promise<T>( (resolve, reject) => {
        this.#storage.run(app, () => {
        Promise.resolve(cb(app))
          .then(resolve)
          .catch(reject)
      })
    })
  }
}

export class AppBuilder extends BaseBuilder<ActionableBuilder> {
  static define() {
    return new AppBuilder() as ConfigBuilder<AppBuilder>
  }
}