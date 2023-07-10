


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

  private people: Person[] = [
    { id: 1, name: 'Dave' },
    { id: 2, name: 'Andre' },
    { id: 3, name: 'Kaleb' },
  ]

  constructor(private petSvc: PetService){ }

  getFamilies(personId: number, ...peopleIds: number[]){
    const ids = [personId, ...peopleIds]

    const families = this.people
      .filter( p => ids.includes(p.id) )
      .map(person => ({ person, pets: this.petSvc.getByStaffId(person.id)  }))
    
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

  getByStaffId(aPoorSoulsId: number){
    return this.pets.filter(p => p.staffId === aPoorSoulsId)
  }
}