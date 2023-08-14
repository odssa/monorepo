import { RuntimeProxy, withApp } from "@odssa/core"

export interface Person {
  id: number,
  name: string
}
export interface FuzzyFamily {
  people: Array<{ 
    person: Person,
    pets: Pet[]
  }>
}

export class PersonService {

  private petSvc: PetService = RuntimeProxy.create('pets')

  private people: Person[] = [
    { id: 1, name: 'Dave' },
    { id: 2, name: 'Andre' },
    { id: 3, name: 'Kaleb' },
  ]

  async getFamiliesExplicitly(personId: number, ...peopleIds: number[]){
    return await withApp( async ({ pets }) => {
      const ids = [personId, ...peopleIds]
      const families = Promise.all(
        this.people
          .filter( p => ids.includes(p.id) )
          .map( async person => ({ person, pets: await pets.getByStaffId(person.id)  }))
      )
    
      return families
    })
  }

  async getFamiliesWithProxy(personId: number, ...peopleIds: number[]){
    const ids = [personId, ...peopleIds]
    const families = Promise.all(
      this.people
        .filter( p => ids.includes(p.id) )
        .map( async person => ({ person, pets: await this.petSvc.getByStaffId(person.id)  }))
    )
    return families
  }
}


export interface Pet {
  name: string
  staffId: number
  microchipped: boolean
  
}
export class PetService {
  private pets: Pet[] = [
    { name: 'Giacomo', staffId: 1, microchipped: true},
    { name: 'Harriet', staffId: 1, microchipped: false},
    { name: 'Tilly', staffId: 2, microchipped: true},
  ]

  async getByStaffId(aPoorSoulsId: number){
    return this.pets.filter(p => p.staffId === aPoorSoulsId)
  }
}