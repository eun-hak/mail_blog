import { parseArticleBlocks } from "@/lib/articleBody";

export function ArticleBody({ text }: { text: string }) {
  const blocks = parseArticleBlocks(text);

  return (
    <div className="mt-6 space-y-3 text-[15px] leading-[1.75] text-black">
      {blocks.map((block, index) =>
        block.type === "subtitle" ? (
          <h2
            key={`h-${index}-${block.content.slice(0, 24)}`}
            className="!mt-6 font-heading text-lg font-semibold text-black first:!mt-0"
          >
            {block.content}
          </h2>
        ) : (
          <p key={`p-${index}-${block.content.slice(0, 24)}`}>
            {block.content}
          </p>
        )
      )}
    </div>
  );
}
