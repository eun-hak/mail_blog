import type { BlogCategorySlug } from "./article.types.js";

export type ExtractedTopic = {
  title: string;
  angle: string;
  categorySlug: BlogCategorySlug;
  priority: number;
};

export type TopicExtractionResult = {
  gmailMessageId: string;
  emailSubject: string | null;
  topics: ExtractedTopic[];
};

export type TopicArticleJob = {
  email: import("./email.types.js").ParsedEmail;
  topic: ExtractedTopic;
  topicIndex: number;
};
