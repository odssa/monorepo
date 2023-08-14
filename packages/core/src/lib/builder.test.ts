import { AppBuilder } from './builder'


const config: Odssa.AppConfig = {name: 'app1'}
const EMPTY_FACTORY = async() => ({})

describe('app builder', () => {
  it('builds with config initializer', async () => {

    const ab = AppBuilder
      .define()
        .config(async () => (config))
        .infrastructure(EMPTY_FACTORY)
        .services(EMPTY_FACTORY)
    
    expect(ab.buildSingletonApp({}))
      .rejects.toMatchObject(new Error('Missing initializers; config=true inf=false services=false'))
  })

  it('builds with direct config', async () => {

    const ab = AppBuilder
    .define()
      .config(config)
      .infrastructure(EMPTY_FACTORY)
      .services(EMPTY_FACTORY)
  
    
    expect(ab.buildSingletonApp({}))
      .rejects.toMatchObject(new Error('Missing initializers; config=true inf=false services=false'))
  })
})