addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * extracts the url from the cookies
 * @param {*} cookies Cookies received from the request
 */
function extractCookie(cookies){
  cookieArr = cookies.split(";")
  let url = ""

  for(ele of cookieArr){
    let key = ele.split("=")[0].trim()
    if(key.localeCompare("url")==0){
      url = ele.split("=")[1]
      break
    }
  }

  return url
}

/**
 * returns one of the urls from the json api with equal probability
 */
async function urlApi(){
  url = await fetch("https://cfw-takehome.developers.workers.dev/api/variants")
                .then(res => res.json())
                .then(data => {
                  const ind = Math.floor(Math.random()*2)
                  return data['variants'][ind]
                })
  return url
}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

  const head = {
    headers : {
      'content-type' : 'text/html'
    }
  }
  let url = ""
  let cookies = request.headers.get("Cookie") || "empty"
  let setCookie = false

  //checking for cookie
  if(cookies.localeCompare("empty") != 0){
    url = extractCookie(cookies)
  }

  //extract from json api
  if(url.localeCompare("") == 0) {
    url = await urlApi();
    setCookie = true;
  }

  const data = await fetch(url)
                .then(data => data.text())

  op = new Response(data,head)
  
  if(setCookie)
    op.headers.set("Set-Cookie","url="+url)

  return op;
}
