export const dynamic = 'force-dynamic'

interface Connection {
  send: (data: any) => void
  close: () => void
}

const connections = new Set<Connection>()

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let closed = false
      
      const connection: Connection = {
        send: (data: any) => {
          if (!closed) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
          }
        },
        close: () => {
          closed = true
        }
      }

      connections.add(connection)

      const interval = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        }
      }, 30000)
    },
    cancel() {
      connections.forEach(conn => conn.close())
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}

export { connections }
