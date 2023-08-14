import { withApp } from "@odssa/core"
import { Handler } from "@odssa/http"

export const families: Handler = ({ params }, res ) =>
  withApp( async({ people }) => {
    const id = Number.parseInt(params.id)
    if( !Number.isInteger(id) ){
      return res.status(500).send({ error: `Invalid id: ${id}; must be an integer`})
    }
    const [ fam ] = await people.getFamiliesExplicitly(id)

    if(fam){
      res.send(fam)
    }else{
      res.status(404).send({ message: `Could not locate person by ID=${id}`})
    }
  })

export const debug: Handler = (req, res) => {
  console.log('got a debug request', {
    url: req.url, 
    headers: req.headers,
  })
  res.send({ debug: true })
}