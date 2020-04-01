import {NowRequest, NowResponse} from '@now/node'
import  * as https from 'https'


function getCode(slug, cb) {
  const reqOptions = {
    host: 'share.effector.dev',
    port: 443,
    path: `/${slug}`,
    method: 'GET',
  }

  let body = ''
  const req = https.request(reqOptions, (res) => {
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      body += chunk
    })
    res.on('end', () => {
      const regexp = /window\.__code__ = JSON\.parse\(window\.decompress\("(.*)"\)\);\s*<\/script>\s*<link*/
      const [, code] = regexp.exec(body)
      cb(null, code ?? '')
    })
  })

  req.end()
  req.on('error', (e) => {
    cb(e.message)
  })
}

export default (req: NowRequest, res: NowResponse) => {
  const {slug} = req.query
  console.log('slug', slug)
  if (!slug) {
    res.status(400).json({
      status: 400,
      error: `Missing required parameter 'slug'`,
      meta: {
        slug: 'Required parameter'
      }
    })
    return
  }

  getCode(slug, (err, code) => {
    let result
    if (err || !code) {
      console.error('error', err)
      return res.status(400).json({
        status: 400,
        error: err || 'Code not found by slug',
      })
    } else {
      result = {
        status: 200,
        data: code
      }
    }
    console.log('send code')
    res.status(200).json(result)
  })
}
