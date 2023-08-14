
import { WebBuilder, Router } from '@odssa/http'

// the 3 layers of your app
import { initConfig } from './app/config'
import { initInf } from './app/inf'
import { initServices } from './app/services'
import { debug, families } from './routers/example.routes'

const builder = 
  WebBuilder.define()
    .config(initConfig)
    .infrastructure(initInf)
    .services(initServices)
    
async function main(){
  const router = Router()
    .all( '/families/:id', families)
    .get( '/internal/debug', debug)

  const { port  } 
    = await builder
      .router(router)
      .listen(2999)

  console.log('listening on', port)
}

main()
  .then( () => console.log('main complete') )
  .catch( err => console.warn('main errored', err))

