
import { initMiddleware } from '@odssa/http'

import { PersonService, PetService } from './mock/services'


import express, { Router } from 'express'
import { withApp } from '@odssa/core'

declare global {
  export namespace Odssa {
    export interface AppServices {
      people: PersonService
      pets: PetService
    }
  }
}

const initServices = async () => {
  const pets = new PetService()
  const people = new PersonService(pets)

  return { pets, people } as Odssa.AppServices
}


let services: Odssa.AppServices | undefined
const serviceFn: Odssa.http.AppInitServices = async ({ req, res }) => {
  if( !services ){
    services = await initServices()
  }
  const app: Odssa.App = {
    name: 'Example App',
    ...services,
    req, 
    res
  }

  return app
}

async function main(){

  const { middleware } = initMiddleware(serviceFn)

  const web = express()
  web.use(middleware)
  
  const router = Router()
  router.all( '/families/:id', ({ params }, res ) =>
    withApp( async({ people }) => {
      const id = Number.parseInt(params.id)
      if( !Number.isInteger(id) ){
        return res.status(500).send({ error: `Invalid id: ${id}; must be an integer`})
      }
      const [ fam ] = people.getFamilies(id)

      if(fam){
        res.send(fam)
      }else{
        res.status(404).send({ message: `Could not locate person by ID=${id}`})
      }
    })
  )
  web.use(router)

  web.listen(2999, () => {
    console.log('listening on 2999')
  })
}

main()
  .then( () => console.log('main complete') )
  .catch( err => console.warn('main errored', err))




const dummy = (app: Odssa.App, inf: Odssa.AppInfrastructure, svc: Odssa.AppServices) => {

  console.log(
    app.name, 
    app.people, 
    inf.req, 
    inf.res,
    svc.pets,
    svc.people,
  )
} 