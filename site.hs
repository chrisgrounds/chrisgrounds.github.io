{-# LANGUAGE OverloadedStrings #-}

import Control.Monad (filterM)
import Control.Monad.Trans.State.Strict (State, evalState, gets, modify')
import Data.Bits (xor)
import Data.Char (isAlphaNum, isDigit)
import Data.List (foldl', intercalate)
import Data.Maybe (mapMaybe)
import Data.Set (Set)
import qualified Data.Set as Set
import qualified Data.Text as T
import Data.Word (Word64)
import Hakyll
import Numeric (showHex)
import System.FilePath (dropExtension, takeFileName, (</>), (<.>))
import Text.Pandoc.Definition (Block (Div, Header, Para, Plain), Inline (LineBreak, Link, SoftBreak, Str), Pandoc (Pandoc))
import Text.Pandoc.Walk (walk, walkM)

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
        >>= renderPandocWithTransform defaultHakyllReaderOptions defaultHakyllWriterOptions (linkFootnotes . linkHeadings)

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

-- | Footnotes in the plain style the posts already use: write @[1]@ in the
-- text, and start a top-level paragraph with @[1]@ (usually under an Appendix)
-- to define it. Each reference links down to its definition, and the
-- definition's marker links back up to the first reference. Numbers without a
-- definition are left as plain text, and code is never touched. Definitions on
-- consecutive lines, with no blank line between them, are still separate.
linkFootnotes :: Pandoc -> Pandoc
linkFootnotes (Pandoc meta authored) =
    Pandoc meta (evalState (traverse footnoteBlock blocks) Set.empty)
  where
    blocks = concatMap splitDefinitions authored
    defined = Set.fromList (mapMaybe definitionNumber blocks)

    footnoteBlock :: Block -> State (Set T.Text) Block
    footnoteBlock block = case (block, definitionNumber block) of
        (Para (_ : rest), Just n) -> definition n Para <$> walkM linkReferences rest
        (Plain (_ : rest), Just n) -> definition n Plain <$> walkM linkReferences rest
        _ -> walkM linkReferences block

    definition n wrap rest =
        Div ("fn-" <> n, ["footnote"], [])
            [wrap (Link ("", ["footnote-back"], [("aria-label", "Back to reference")]) [Str (marker n)] ("#fnref-" <> n, "") : rest)]

    linkReferences :: [Inline] -> State (Set T.Text) [Inline]
    linkReferences = fmap concat . traverse linkInline

    linkInline (Str text) = traverse piece (splitReferences text)
    linkInline inline = pure [inline]

    piece (Left text) = pure (Str text)
    piece (Right n)
        | n `Set.member` defined = do
            seen <- gets (Set.member n)
            modify' (Set.insert n)
            -- Only the first reference carries the id the back-link targets.
            let ident = if seen then "" else "fnref-" <> n
            pure (Link (ident, ["footnote-ref"], []) [Str (marker n)] ("#fn-" <> n, ""))
        | otherwise = pure (Str (marker n))

    marker n = "[" <> n <> "]"

-- | Markdown joins consecutive lines into one paragraph, so a run of
-- definitions written line by line arrives as a single paragraph. Split it
-- wherever a new line starts with a footnote marker.
splitDefinitions :: Block -> [Block]
splitDefinitions block@(Para inlines)
    | Just _ <- definitionNumber block = map Para (go [] inlines)
  where
    go current (lineEnd : rest@(Str text : _))
        | isLineEnd lineEnd
        , Just _ <- markerNumber text =
            reverse current : go [] rest
    go current (inline : rest) = go (inline : current) rest
    go current [] = [reverse current]

    isLineEnd SoftBreak = True
    isLineEnd LineBreak = True
    isLineEnd _ = False
splitDefinitions block = [block]

-- | The footnote number a definition paragraph starts with, if it is one.
definitionNumber :: Block -> Maybe T.Text
definitionNumber block = case block of
    Para (Str text : _) -> markerNumber text
    Plain (Str text : _) -> markerNumber text
    _ -> Nothing

-- | The number in text that is exactly a footnote marker, such as @[1]@.
markerNumber :: T.Text -> Maybe T.Text
markerNumber text = case splitReferences text of
    [Right n] -> Just n
    _ -> Nothing

-- | Splits text such as @runs[1]:@ into the plain text and footnote numbers.
splitReferences :: T.Text -> [Either T.Text T.Text]
splitReferences text
    | T.null text = []
    | otherwise = case T.breakOn "[" text of
        (before, rest)
            | T.null rest -> [Left before]
            | (digits, after) <- T.span isDigit (T.drop 1 rest)
            , not (T.null digits)
            , Just remaining <- T.stripPrefix "]" after ->
                leading before ++ Right digits : splitReferences remaining
            | otherwise -> case splitReferences (T.drop 1 rest) of
                Left next : more -> Left (before <> "[" <> next) : more
                more -> Left (before <> "[") : more
  where
    leading t = [Left t | not (T.null t)]

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
        <> field "wordCount" (fmap show . postWordCount)
        <> field "readingTime" (\item -> do
            count <- postWordCount item
            pure $ show $ max 1 ((count + 199) `div` 200))
        <> siteContext

-- Count the rendered post before templates add navigation and metadata.
-- Ignore punctuation-only tokens, including the heading permalink markers.
postWordCount :: Item String -> Compiler Int
postWordCount item = do
    content <- loadSnapshotBody (itemIdentifier item) "content"
    pure $ length $ filter (any isAlphaNum) $ words $ stripTags content

feedContext :: Tags -> Context String
feedContext tags =
    -- Titles go into the feed verbatim, so a bare '&' produces invalid XML.
    field "title" (\item -> escapeHtml <$> getMetadataField' (itemIdentifier item) "title")
        <> bodyField "description"
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
