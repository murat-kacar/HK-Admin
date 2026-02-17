import sanitizeHtml from 'sanitize-html';

const defaultConfig: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ['src', 'alt', 'width', 'height'],
    a: ['href', 'target', 'rel'],
  },
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html || '', defaultConfig);
}
