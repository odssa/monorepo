
import { PersonService, PetService } from '../mock/services'

export const initServices = async () => {
  const pets = new PetService()
  const people = new PersonService()

  return { pets, people } as Odssa.AppServices
}

declare global {
  export namespace Odssa {
    export interface AppServices {
      people: PersonService
      pets: PetService
    }
  }
}