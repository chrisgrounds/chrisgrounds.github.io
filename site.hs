{-# LANGUAGE OverloadedStrings #-}

import Control.Monad (filterM)
import Data.List (intercalate)
import qualified Data.Text as T
import Hakyll
import System.FilePath (dropExtension, takeFileName, (</>), (<.>))
import Text.Pandoc.Definition (Block (Header), Inline (Link, Str), Pandoc)
import Text.Pandoc.Walk (walk)

main :: IO ()
main = hakyll $ do
    publishedPosts <- publishedPattern

    match "assets/**" $ do
        route idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route idRoute
        compile compressCssCompiler

    tags <- buildTags publishedPosts (fromCapture "tags/*.html")

    tagsRules tags $ \tag pattern -> do
        let title = "Writing tagged “" <> tag <> "”"
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll pattern
            let context =
                    constField "title" title
                        <> constField "tag" tag
                        <> listField "posts" (postContext tags) (pure posts)
                        <> siteContext
            makeItem ("" :: String)
                >>= loadAndApplyTemplate "templates/archive.html" context
                >>= loadAndApplyTemplate "templates/default.html" context
                >>= relativizeUrls

    match publishedPosts $ do
        route postRoute
        compile $
            postCompiler
                >>= saveSnapshot "content"
                >>= loadAndApplyTemplate "templates/post.html" (postContext tags)
                >>= loadAndApplyTemplate "templates/default.html" (postContext tags)
                >>= relativizeUrls

    match "about.markdown" $ do
        route $ constRoute "about/index.html"
        compile $
            pandocCompiler
                >>= loadAndApplyTemplate "templates/page.html" siteContext
                >>= loadAndApplyTemplate "templates/default.html" siteContext
                >>= relativizeUrls

    match "404.html" $ do
        route idRoute
        compile $
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" siteContext
                >>= relativizeUrls

    match "index.html" $ do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll publishedPosts
            let context =
                    listField "posts" (postContext tags) (pure posts)
                        <> siteContext
            getResourceBody
                >>= applyAsTemplate context
                >>= loadAndApplyTemplate "templates/default.html" context
                >>= relativizeUrls

    create ["feed.xml"] $ do
        route idRoute
        compile $ do
            posts <- fmap (take 10) . recentFirst =<< loadAllSnapshots publishedPosts "content"
            renderRss feedConfiguration (feedContext tags) posts

    match "templates/*" $ compile templateBodyCompiler

-- | Like 'pandocCompiler', but turns every heading into a self-link so readers
-- can grab a URL straight to a section. Pandoc already assigns each heading an
-- @id@; this appends an anchor pointing at that @id@.
postCompiler :: Compiler (Item String)
postCompiler =
    pandocCompilerWithTransform defaultHakyllReaderOptions defaultHakyllWriterOptions linkHeadings

linkHeadings :: Pandoc -> Pandoc
linkHeadings = walk addAnchor
  where
    addAnchor (Header level attr@(ident, _, _) inlines)
        | not (T.null ident) = Header level attr (inlines ++ [anchor ident])
    addAnchor block = block

    anchor ident =
        Link ("", ["heading-anchor"], []) [Str "#"] ("#" <> ident, "")

publishedPattern :: Rules Pattern
publishedPattern = do
    ids <- getMatches "_posts/*.md"
    published <- filterM isPublished ids
    pure (fromList published)
  where
    isPublished identifier = do
        metadata <- getMetadata identifier
        pure (lookupString "published" metadata /= Just "false")

postRoute :: Routes
postRoute = customRoute $ \identifier ->
    let fileName = dropExtension . takeFileName . toFilePath $ identifier
        year = take 4 fileName
        month = take 2 . drop 5 $ fileName
        day = take 2 . drop 8 $ fileName
        slug = drop 11 fileName
     in intercalate "/" [year, month, day] </> slug <.> "html"

postContext :: Tags -> Context String
postContext tags =
    dateField "date" "%B %-d, %Y"
        <> tagsField "tags" tags
        <> siteContext

feedContext :: Tags -> Context String
feedContext tags =
    bodyField "description"
        <> postContext tags

siteContext :: Context String
siteContext =
    constField "siteTitle" "Chris Grounds"
        <> constField "siteDescription" "Software, types, functional programming, and the ideas around them."
        <> defaultContext

feedConfiguration :: FeedConfiguration
feedConfiguration =
    FeedConfiguration
        { feedTitle = "Chris Grounds"
        , feedDescription = "Software, types, functional programming, and the ideas around them."
        , feedAuthorName = "Chris Grounds"
        , feedAuthorEmail = ""
        , feedRoot = "https://chrisgrounds.github.io"
        }

