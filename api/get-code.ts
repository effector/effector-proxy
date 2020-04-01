import {NowRequest, NowResponse} from '@now/node'
import  * as https from 'https'
import axios from 'axios'


function getCode(slug, cb) {
  const url = `https://share.effector.dev/${slug}`

  let body = ''
  axios.get(url).then((res) => {
    // res.setEncoding('utf8')
    // res.on('data', (chunk) => {
    //   body += chunk
    // })
    // res.on('end', () => {

      const regexp = /window\.__code__ = JSON\.parse\(window\.decompress\("(.*)"\)\);\s*<\/script>\s*<link*/
      // console.log(res.data)
      const [, code] = regexp.exec(res.data)
      cb(null, code || '')
    // })
  })
    .catch(e => cb(e))
  // req.setHeader('content-type', 'text/html')
  // req.end()
  // req.on('error', (e) => {
  //   cb(e.message)
  // })
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
