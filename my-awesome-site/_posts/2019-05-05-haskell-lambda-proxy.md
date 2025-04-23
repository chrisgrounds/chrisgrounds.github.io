---
layout: post
title: "Build a HTTP Proxy in Haskell on AWS Lambda"
date: 2019-05-05
published: true
tags: ["haskell", "aws", "lambda"]
---

This is just a quick one to put some Haskell code on AWS Lambda, and what’s better than a good-old HTTP Proxy?

## The Setup

We’re going to use serverless, so let’s ensure we have that installed.

```bash
npm install -g serverless
```

And we’re going to use serverless-haskell as our Haskell-Lambda library and stack as our build tool. So let’s install stack if we haven’t already:

```bash
curl -sSL https://get.haskellstack.org/ | sh
```

and let’s create a project with serverless-haskell:

```bash
stack new http-proxy-lambda https://raw.githubusercontent.com/seek-oss/serverless-haskell/master/serverless-haskell.hsfiles
```

We’ve called our project http-proxy-lambda and we’ve used the serverless-haskell template to create the project. Now cd http-proxy-lambda.

## The Config

Inside this project you’ll see a serverless.yml file, which is where we will configure our Lambda. We really want two things to be happening with this project. First, we want our Lambda to be proxying some resource, and we’ll write our Lambda handler in app/Main.hs, and second we want this endpoint to be publicly accessible through API Gateway. With serverless, that’s incredibly easy to express. In our serverless.yml file add:

```yaml
functions:  
  http-proxy-lambda:
    runtime: haskell    
    handler: http-proxy-lambda.http-proxy-lambda-exe
    events:     
     - http:        
        path: endpoint/{url}        
        method: get        
        cors: true
```

There’s a couple things to note here. First is that we’ve moved runtime from the top-level to inside our specific function. This is because this provides us with the possibility of having multiple run-times for different functions at a later date — maybe we want a JS frontend?

The handler key is what tells serverless where to find the handler code. Specifically, http-proxy-lambda.http-proxy-lambda-exe says this is the http-proxy-lambda project (which we just created) and http-proxy-lambda-exe is the name of the executable. We can change the executable name by finding it in package.yaml and changing it there.

The events key is where we configure our API Gateway, setting up a HTTP GET request-response cycle when you hit endpoint/{url} — and we’ve turned CORS on, because why not?

## The Code

Open app/Main.hs and replace the code already there with the following.

```haskell
{-# LANGUAGE OverloadedStrings #-} 
module Main where 
import           AWSLambda.Events.APIGateway
import           Control.Lens
import qualified Data.ByteString.Lazy.Internal as BSL
import qualified Data.HashMap.Strict as HMS
import           Data.Text
import qualified Data.Text.Lazy as LazyText
import qualified Data.Text.Lazy.Encoding as LazyText
import qualified Network.Wreq as Http
main :: IO ()
main = apiGatewayMain handler
htmlRes :: Int -> Text -> IO (APIGatewayProxyResponse Text)
htmlRes status proxyBody 
  = pure $ htmlResWithNoBody status & responseBody ?~ proxyBody  
  where    
    htmlResWithNoBody :: Int -> APIGatewayProxyResponse Text
    htmlResWithNoBody statusCode 
      = APIGatewayProxyResponse statusCode [("Content-Type", "text/html")] Nothing
getProxyBody :: Http.Response BSL.ByteString -> IO Text
getProxyBody resFromGivenUrl
  = return
  . LazyText.toStrict
  . LazyText.decodeUtf8
  $ resFromGivenUrl ^. Http.responseBody
handler :: APIGatewayProxyRequest Text -> IO (APIGatewayProxyResponse Text)
handler request = do  
  let urlPath = HMS.lookup "url" $ request ^. agprqPathParameters   
  case urlPath of    
    Just path ->      
      (Http.get $ "https://" <> unpack path)         
        >>= getProxyBody        
        >>= htmlRes 200    
    Nothing -> htmlRes 500 "No path found"
```

Because this will be compiled to an executable, we need to define a main function. And in this main function we set up what kind of Lambda handler we will be using — in this case, an apiGatewayMain handler.

The most important function after main is the handler function. And what it does is it takes the request and pulls off the path parameters. So if you visit endpoint/proxymeplease the request will contain a path hashmap of url: proxymeplease. This url key comes directly from the serverless.yml config we wrote earlier, when we wrote path: endpoint/{url}.

With this hashmap we lookup for the url key and if we find it we make a HTTP GET request to that endpoint. Once we’ve done that we pull out the response body with getProxyBody and then we form some HTML which we will return with htmlRes. If we don’t find a url key then we just return a 500 page.

What’s nice about this is that to return HTML, instead of the default JSON response Lambda would return, all we have to do is construct a APIGatewayProxyResponse and give it a Content-Type of text/html, as is done in the htmlRes function.

Note that the core sequence logic of our code is expressed in 3 lines here:

```haskell
(Http.get $ "https://" <> unpack path)         
  >>= getProxyBody        
  >>= htmlRes 200
```

How clean and elegant.

With that we can deploy our Lambda + API Gateway with:

```bash
sls deploy
```
Providing we have an AWS account, of course. This will then give us a magical https://{bla}.execute-api-region.amazonaws.com/dev/endpoint/{url} endpoint.

## The Result

And the proof is in the screenshots.

And since our AWS Lambda is sitting in the US (us-east-1), we can verify that we are proxying through US servers.
