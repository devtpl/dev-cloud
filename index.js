const Router = require('./router')
const qs = require('querystring')

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 处理请求，分发路由
async function handleRequest (request) {
  const r = new Router()
  r.get('.*/cloud/query', () => collResponse(request))
  r.post('.*/cloud/query', () => collResponse(request))

  r.get('/', () => new Response('CLOUD API!')) // return a default message for the root route

  const resp = await r.route(request)
  return resp
}

// 处理跨域
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// 统一处理响应
const handleResponse = (data) => {
  const init = {
    headers: {
      ...corsHeaders,
      'content-type': 'application/json;charset=UTF-8',
    },
  }
  const body = JSON.stringify(data)
  return new Response(body, init)
}

// 获取地点列表
const collResponse = async (request) => {
  const init = await genWxRequest(request)
  const data = await handleWxRequest('databasecollectionget', init)
  return handleResponse(data)
}

//----------------上方是对请求的处理以及响应，下方是对原数据的获取 ----------------------

const prefixUrl = 'https://api.weixin.qq.com/tcb'

// 构造请求体
const genWxRequest = async (request) => {
  const {url} = request
  const {searchParams: sParams} = new URL(url)
  const reqBody = await request.json()
  console.log(sParams.get('token'))
  const params = {
    access_token: sParams.get('token'),
  }
  const body = {
    env: '',
    ...reqBody,
  }
  return {
    params,
    body,
  }
}

// 处理微信请求
const handleWxRequest = async (path, {params, body}) => {
  const tokenUrl = `${prefixUrl}/${path}?${qs.stringify(params)}`
  const data = await new Promise((resolve => {
    fetch(tokenUrl, {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(async response => {
      if (response.status === 200) {
        const data = await response.json()
        resolve(data)
      }
    }).then(response => {
      console.log(response)
    })
  }))
  return data
}


