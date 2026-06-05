import type { ParsedNewsletter } from "../parsers/newsletter.parser.js";

export type ParsedEmail = {
  gmailMessageId: string;
  subject: string | null;
  from: string | null;
  to: string | null;
  date: string | null;
  html: string | null;
  text: string | null;
  parsed: ParsedNewsletter;
};

export type CredentialsFile = {
  installed?: OAuthClientConfig;
  web?: OAuthClientConfig;
};

export type OAuthClientConfig = {
  client_id: string;
  client_secret: string;
  redirect_uris?: string[];
  auth_uri?: string;
  token_uri?: string;
};

export type TokenFile = {
  type?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
  access_token?: string;
  scope?: string;
  token_type?: string;
  expiry_date?: number;
};
