import { NextRequest, NextResponse } from 'next/server'

// Proxy endpoint para embeber contenido de streaming evitando X-Frame-Options
// Actúa como intermediario: nuestro servidor solicita la página y la sirve sin restricciones de framing
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const targetUrl = searchParams.get('url')
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    // Validar que la URL sea de dominios permitidos
    const allowedDomains = [
      'winplay.co',
      'www.winplay.co',
      'winsports.co',
      'www.winsports.co',
      'www.youtube.com',
      'youtube.com',
    ]
    
    const targetHost = new URL(targetUrl).hostname
    if (!allowedDomains.some(domain => targetHost === domain || targetHost.endsWith('.' + domain))) {
      return NextResponse.json({ error: 'Dominio no permitido' }, { status: 403 })
    }

    // Fetch the target page with stealth headers
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'Referer': '',
        'Origin': new URL(targetUrl).origin,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
    })

    const contentType = response.headers.get('content-type') || 'text/html'
    let body = await response.text()

    // Remove X-Frame-Options and CSP frame-ancestors from the proxied content
    if (contentType.includes('text/html')) {
      // Inject base tag for relative URLs
      const baseTag = `<base href="${new URL(targetUrl).origin}/" target="_self">`
      body = body.replace('<head>', `<head>${baseTag}`)
      
      // Remove any frame-busting JavaScript
      body = body.replace(/top\s*!=\s*self/g, 'false')
      body = body.replace(/top\s*!==\s*self/g, 'false')
      body = body.replace(/window\.top\s*!=\s*window\.self/g, 'false')
      body = body.replace(/window\.top\s*!==\s*window\.self/g, 'false')
      body = body.replace(/if\s*\(\s*top\s*\)/g, 'if(false)')
      body = body.replace(/if\s*\(\s*window\.top\s*\)/g, 'if(false)')
    }

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('X-Content-Type-Options', 'nosniff')
    headers.set('X-Frame-Options', 'ALLOWALL')
    headers.delete('Content-Security-Policy')
    headers.delete('Content-Security-Policy-Report-Only')
    headers.set('Cache-Control', 'public, max-age=30')
    headers.set('Access-Control-Allow-Origin', 'https://tpkplay.vercel.app')
    headers.set('Access-Control-Allow-Methods', 'GET')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return new NextResponse(body, {
      status: response.status,
      headers,
    })
  } catch (error: unknown) {
    console.error('Proxy error:', error)
    const message = error instanceof Error ? error.message : 'Error de proxy'
    return NextResponse.json({ error: `Error de proxy: ${message}` }, { status: 502 })
  }
}
