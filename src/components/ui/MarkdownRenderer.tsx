"use client"
import React from "react"
import Markdown from "markdown-to-jsx"
import { cn } from "@/lib/shadcn/utils"
import { ChevronDown, ChevronRight, Brain } from "lucide-react"
import GameItemTag from "./GameItemTag"
import { resolveGameItems, GameItemInfo, GameItemType } from "@/utils/gameItemResolver"

/** Thinking component for <think> tags */
function Think({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const [showThinking, setShowThinking] = React.useState(false)

  return (
    <div
      className={cn("my-4 border border-border rounded-lg", className)}
      {...props}
    >
      <button
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setShowThinking(!showThinking)}
      >
        {showThinking ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <Brain size={16} />
        <span className="font-medium">Chain of Thought</span>
      </button>
      {showThinking && (
        <div className="p-3 border-t border-border bg-muted/20 prose prose-invert max-w-none">
          {children}
        </div>
      )}
    </div>
  )
}

/** Shadcn-style Table components */
function Table({
  children,
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto my-4">
      <table
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

function TableHeader({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("[&_tr]:border-b", className)} {...props}>
      {children}
    </thead>
  )
}

function TableBody({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
      {children}
    </tbody>
  )
}

function TableRow({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

function TableHead({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle font-medium text-muted-foreground bg-muted/50",
        className
      )}
      {...props}
    >
      {children}
    </th>
  )
}

function TableCell({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("p-3 align-middle", className)} {...props}>
      {children}
    </td>
  )
}

/** Shadcn-style Blockquote (Card-like) */
function Blockquote({
  children,
  className,
  ...props
}: React.BlockquoteHTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "my-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-lg pl-4 pr-4 py-3 italic text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  )
}

/** Shadcn-style Code Block */
function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const isBlock = className?.includes("lang-")
  const language = className?.replace("lang-", "") || ""

  if (isBlock) {
    return (
      <div className="relative my-4 group">
        {language && (
          <div className="absolute right-2 top-2 text-xs text-muted-foreground opacity-70">
            {language}
          </div>
        )}
        <pre
          className={cn(
            "overflow-x-auto rounded-lg border border-border bg-muted/50 p-4",
            className
          )}
        >
          <code className="text-sm font-mono" {...props}>
            {children}
          </code>
        </pre>
      </div>
    )
  }

  return (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-primary",
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}

/** Shadcn-style Link */
function MarkdownLink({
  children,
  href,
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "font-medium text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </a>
  )
}

/** Shadcn-style List Item */
function ListItem({
  children,
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li className={cn("mt-2 leading-7", className)} {...props}>
      {children}
    </li>
  )
}

/** Markdown options with shadcn component overrides */
const markdownOptions = {
  overrides: {
    // Headings
    h1: {
      component: "h1",
      props: {
        className:
          "scroll-m-20 text-2xl font-bold tracking-tight mt-6 mb-4 first:mt-0",
      },
    },
    h2: {
      component: "h2",
      props: {
        className:
          "scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-3 first:mt-0",
      },
    },
    h3: {
      component: "h3",
      props: {
        className: "scroll-m-20 text-lg font-semibold tracking-tight mt-4 mb-2",
      },
    },
    h4: {
      component: "h4",
      props: {
        className:
          "scroll-m-20 text-base font-semibold tracking-tight mt-4 mb-2",
      },
    },

    // Paragraph
    p: {
      component: "p",
      props: { className: "leading-7 [&:not(:first-child)]:mt-4" },
    },

    // Lists
    ul: {
      component: "ul",
      props: { className: "my-4 ml-6 list-disc [&>li]:mt-2" },
    },
    ol: {
      component: "ol",
      props: { className: "my-4 ml-6 list-decimal [&>li]:mt-2" },
    },
    li: { component: ListItem },

    // Links
    a: { component: MarkdownLink },

    // Code
    code: { component: CodeBlock },
    pre: { component: "div", props: { className: "" } },

    // Blockquote
    blockquote: { component: Blockquote },

    // Text formatting
    strong: { component: "strong", props: { className: "font-semibold" } },
    em: { component: "em", props: { className: "italic" } },

    // Table components
    table: { component: Table },
    thead: { component: TableHeader },
    tbody: { component: TableBody },
    tr: { component: TableRow },
    th: { component: TableHead },
    td: { component: TableCell },

    // Horizontal rule
    hr: { component: "hr", props: { className: "my-6 border-border" } },

    // Thinking component
    think: { component: Think },
  },
}

/** Parses :::thinking blocks and converts them to <think> tags */
function parseThinkingBlocks(content: string): string {
  // Simple parser for :::thinking blocks
  const thinkingRegex = /:::thinking\s*\n([\s\S]*?)\n:::/g
  return content.replace(thinkingRegex, "<think>\n$1\n</think>")
}

/** Game item tag placeholder component */
function GameItemPlaceholder({
  type,
  name,
  resolvedItem,
}: {
  type: GameItemType
  name: string
  resolvedItem: GameItemInfo | null
}) {
  if (resolvedItem) {
    return <GameItemTag item={resolvedItem} />
  }
  // Fallback to plain bold text if not resolved
  return <strong className="font-semibold">{name}</strong>
}

/** Parses game item tags [character:Name], [weapon:Name], [artifact:Name] */
function parseGameItemTags(content: string): {
  processedContent: string
  tags: Array<{ type: GameItemType; name: string; placeholder: string }>
} {
  const tagRegex = /\[(character|weapon|artifact):([^\]]+)\]/g
  const tags: Array<{ type: GameItemType; name: string; placeholder: string }> = []
  let match
  let placeholderIndex = 0

  // Extract all tags
  while ((match = tagRegex.exec(content)) !== null) {
    const type = match[1] as GameItemType
    const name = match[2].trim()
    const placeholder = `__GAME_ITEM_TAG_${placeholderIndex}__`
    tags.push({ type, name, placeholder })
    placeholderIndex++
  }

  // Replace tags with placeholders
  const processedContent = content.replace(
    tagRegex,
    (match, type, name) => {
      const tag = tags.find((t) => t.name === name.trim() && t.type === type)
      return tag ? tag.placeholder : match
    }
  )

  return { processedContent, tags }
}

/** Recursively processes React children to replace game item tags */
function processGameItemTags(
  children: React.ReactNode,
  resolvedItems: Map<string, GameItemInfo>
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") {
      const parts: React.ReactNode[] = []
      let lastIndex = 0
      const tagRegex = /\[(character|weapon|artifact):([^\]]+)\]/g
      let match

      while ((match = tagRegex.exec(child)) !== null) {
        // Add text before tag
        if (match.index > lastIndex) {
          parts.push(child.substring(lastIndex, match.index))
        }

        // Add game item tag component
        const type = match[1] as GameItemType
        const name = match[2].trim()
        const key = `${type}:${name}`
        const resolvedItem = resolvedItems.get(key) || null
        parts.push(
          <GameItemPlaceholder
            key={`${key}-${match.index}`}
            type={type}
            name={name}
            resolvedItem={resolvedItem}
          />
        )

        lastIndex = match.index + match[0].length
      }

      // Add remaining text
      if (lastIndex < child.length) {
        parts.push(child.substring(lastIndex))
      }

      return parts.length > 1 ? parts : child
    }

    if (React.isValidElement(child)) {
      // Recursively process children
      if (child.props.children) {
        return React.cloneElement(
          child,
          { key: child.key },
          processGameItemTags(child.props.children, resolvedItems)
        )
      }
    }

    return child
  })
}

/** Component that renders markdown with game item tags */
function MarkdownWithGameItems({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  const [resolvedItems, setResolvedItems] = React.useState<
    Map<string, GameItemInfo>
  >(new Map())

  // Parse game item tags
  const { tags } = parseGameItemTags(content)

  // Resolve all game items
  React.useEffect(() => {
    if (tags.length === 0) {
      return
    }

    const resolveItems = async () => {
      const itemsToResolve = tags.map((tag) => ({
        type: tag.type,
        name: tag.name,
      }))
      const resolved = await resolveGameItems(itemsToResolve)
      setResolvedItems(resolved)
    }

    resolveItems()
  }, [content])

  // Parse thinking blocks
  const contentWithThinking = parseThinkingBlocks(content)

  // Create custom overrides that process game item tags
  const customOverrides = {
    ...markdownOptions.overrides,
    p: {
      component: ({ children, ...props }: any) => {
        const processedChildren = processGameItemTags(children, resolvedItems)
        return (
          <p {...props} className="leading-7 [&:not(:first-child)]:mt-4">
            {processedChildren}
          </p>
        )
      },
    },
    li: {
      component: ({ children, ...props }: any) => {
        const processedChildren = processGameItemTags(children, resolvedItems)
        return (
          <li {...props} className="mt-2 leading-7">
            {processedChildren}
          </li>
        )
      },
    },
    // Also process text in other elements
    strong: {
      component: ({ children, ...props }: any) => {
        const processedChildren = processGameItemTags(children, resolvedItems)
        return <strong {...props} className="font-semibold">{processedChildren}</strong>
      },
    },
    em: {
      component: ({ children, ...props }: any) => {
        const processedChildren = processGameItemTags(children, resolvedItems)
        return <em {...props} className="italic">{processedChildren}</em>
      },
    },
  }

  return (
    <div className={cn("prose prose-invert max-w-none", className)}>
      <Markdown options={{ ...markdownOptions, overrides: customOverrides } as any}>
        {contentWithThinking}
      </Markdown>
    </div>
  )
}

/** Renders markdown content with shadcn-styled components */
export default function MarkdownRenderer({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return <MarkdownWithGameItems content={children} className={className} />
}
