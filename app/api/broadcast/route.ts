import { connections } from '../events/route'

export async function POST(request: Request) {
  const { type, data } = await request.json()
  
  connections.forEach((connection) => {
    try {
      connection.send({ type, data })
    } catch (error) {
      console.error('Failed to send to connection:', error)
    }
  })
  
  return Response.json({ success: true })
}
