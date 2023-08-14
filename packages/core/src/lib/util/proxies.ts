import { withApp } from "../apps"


export const RUNTIME_SYMBOL = Symbol.for('__runtime_proxy_target__')
export class RuntimeProxy<T extends Record<any, any>> {

  private proxy: any
  protected get _resolve(){
    return withApp(app => {
      const thing = app[this.key] as any
      return thing
    })
  }
	constructor(public key: keyof Odssa.App) {
		this.proxy = new Proxy(
			{},
			{
				get: ( _, property ) => {
          // console.log('attempt 1', new Error().stack)
          if ( property === RUNTIME_SYMBOL ) {
						return( this.proxy );
					}
          return this._resolve[property]
				},
				has: ( _, property ) => {
          console.log('attempt 2')
					return( property in (this._resolve[property] || {}) );
				},
				set: ( _, property, value ) => {
          console.log('attempt 3')
          this._resolve[property] = value
					return true
				}
			}
		) as T;

		return( this.proxy );
	}

  static getTargetOf<X extends Record<any, any>>( proxy: X ) {
		return( (proxy as unknown as any)[RUNTIME_SYMBOL] );
	}

  static create<T extends Record<any, any>>(key: keyof Odssa.App){
    const proxy = new RuntimeProxy<T>(key) 
    return <T>RuntimeProxy.getTargetOf(proxy)
  }

}