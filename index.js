/*
0 : title
1 : h1#title
2 : p#description
3 : a#url
*/
class modifyPara{
  constructor(type){
    this.type = type
  }
  element(element){
    const tagName = element.tagName
    
    if(tagName.localeCompare("a") == 0){
      element.setAttribute("href","https://github.com/aswin6197/cloudflare")
    }

    // console.log('incoming element :'+ element.tagName)
  }

  text(element){
    if(this.type < 2){
      if(element.lastInTextNode){
        element.after(" modified")
      }
    }
    else{
      if(!element.lastInTextNode)
        element.remove()
      else if(this.type == 2){
        element.replace("paragraph is changed")
      }
      else if(this.type == 3)
        element.replace("Go to github repo")
    }
    // console.log("contents "+element.text)
  }
}

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

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})  




/**
 * request handler contains main logic
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
  
  const htmlModifier = new HTMLRewriter().on("h1[id=title]",new modifyPara(1)).on("p[id=description]",new modifyPara(2))
                        .on("a[id=url]",new modifyPara(3)).on("title",new modifyPara(0));


  const data = await fetch(url)
              .then(data => htmlModifier.transform(data))
              .then(html => html.text())
        
  op = new Response(data,head)
  
  if(setCookie)
    op.headers.set("Set-Cookie","url="+url)

  return op;
}
