{-# LANGUAGE OverloadedStrings #-}

import Control.Monad (filterM)
import Data.Bits (xor)
import Data.List (foldl', intercalate)
import qualified Data.Text as T
import Data.Word (Word64)
import Hakyll
import Numeric (showHex)
import System.FilePath (dropExtension, takeFileName, (</>), (<.>))
import Text.Pandoc.Definition (Block (Header), Inline (Link, Str), Pandoc)
import Text.Pandoc.Walk (walk)

main :: IO ()
main = hakyll $ do
    (publishedPosts, draftPosts) <- accessiblePostsPattern

    match "assets/**" $ do
        route idRoute
        compile copyFileCompiler

    match "css/*" $ do
        route idRoute
        compile compressCssCompiler

    match "js/*" $ do
        route idRoute
        compile copyFileCompiler

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
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts context)
                >>= relativizeUrls

    match (publishedPosts .||. draftPosts) $ do
        route postRoute
        compile $
            postCompiler
                >>= saveSnapshot "content"
                >>= loadAndApplyTemplate "templates/post.html" (postContext tags)
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts (postContext tags))
                >>= relativizeUrls

    match "about.markdown" $ do
        route $ constRoute "about/index.html"
        compile $
            pandocCompiler
                >>= loadAndApplyTemplate "templates/page.html" siteContext
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts siteContext)
                >>= relativizeUrls

    match "cube.html" $ do
        route $ constRoute "cube/index.html"
        compile $
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts siteContext)
                >>= relativizeUrls

    match "inspiration.markdown" $ do
        route $ constRoute "inspiration/index.html"
        compile $
            pandocCompiler
                >>= loadAndApplyTemplate "templates/inspiration.html" siteContext
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts siteContext)
                >>= relativizeUrls

    match "404.html" $ do
        route idRoute
        -- Keep root-relative URLs: the 404 is served at arbitrary missing paths.
        compile $
            getResourceBody
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts siteContext)

    match "index.html" $ do
        route idRoute
        compile $ do
            posts <- recentFirst =<< loadAll publishedPosts
            let context =
                    listField "posts" (postContext tags) (pure posts)
                        <> siteContext
            getResourceBody
                >>= applyAsTemplate context
                >>= loadAndApplyTemplate "templates/default.html" (defaultPageContext publishedPosts context)
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
    getResourceBody
        >>= withItemBody (pure . expandTldr)
        >>= renderPandocWithTransform defaultHakyllReaderOptions defaultHakyllWriterOptions linkHeadings

-- | Rewrites @<tldr>@ … @</tldr>@ into a @tldr@ div before Pandoc sees it.
-- Pandoc treats unknown tags as inline HTML, which would swallow the block's
-- Markdown into one paragraph; a div with blank lines around its contents keeps
-- lists and paragraphs inside the summary intact.
expandTldr :: String -> String
expandTldr = unlines . map expand . lines
  where
    expand line = case trimWhitespace line of
        "<tldr>" -> "<div class=\"tldr\">\n"
        "</tldr>" -> "\n</div>"
        _ -> line
    trimWhitespace = reverse . dropWhile (== ' ') . reverse . dropWhile (== ' ')

linkHeadings :: Pandoc -> Pandoc
linkHeadings = walk addAnchor
  where
    addAnchor (Header level attr@(ident, _, _) inlines)
        | not (T.null ident) = Header level attr (inlines ++ [anchor ident])
    addAnchor block = block

    anchor ident =
        Link ("", ["heading-anchor"], []) [Str "#"] ("#" <> ident, "")

accessiblePostsPattern :: Rules (Pattern, Pattern)
accessiblePostsPattern = do
    ids <- getMatches "_posts/*.md"
    published <- filterM isPublished ids
    draft <- filterM isDraft ids
    pure (fromList published, fromList draft)
  where
    isPublished identifier = do
        metadata <- getMetadata identifier
        pure (lookupString "status" metadata == Just "published")
    isDraft identifier = do
        metadata <- getMetadata identifier
        pure (lookupString "status" metadata == Just "draft")

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
    field "mainCssUrl" (\_ -> do
        css <- loadBody "css/main.css"
        pure $ "/css/main.css?v=" <> contentFingerprint css)
        <> constField "siteTitle" "Chris Grounds"
        <> constField "siteDescription" "Software, types, functional programming, and the ideas around them."
        <> defaultContext

-- | Version the stylesheet by its contents so cached CSS cannot outlive edits.
contentFingerprint :: String -> String
contentFingerprint content = showHex (foldl' step offset content) ""
  where
    offset = 14695981039346656037 :: Word64
    step hash char = (hash `xor` fromIntegral (fromEnum char)) * 1099511628211

defaultPageContext :: Pattern -> Context String -> Context String
defaultPageContext posts pageContext =
    listField "commandPosts" wanderPostContext (recentFirst =<< loadAllSnapshots posts "content")
        <> pageContext

wanderPostContext :: Context String
wanderPostContext =
    dateField "wanderDate" "%Y-%m-%d"
        <> field "wanderTags" (fmap (intercalate "|") . getTags . itemIdentifier)
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
