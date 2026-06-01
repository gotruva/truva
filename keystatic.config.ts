import { config, collection, fields } from '@keystatic/core';

/**
 * Keystatic CMS — edits the same content/blog/*.mdx files the /blog pipeline reads.
 *
 * Posts are pure-markdown bodies plus structured frontmatter: the "Direct Answer"
 * box, CTAs, FAQ schema, and related links all come from fields, so a non-technical
 * editor never touches JSX and every post opens cleanly in the editor.
 *
 * Storage is environment-based (the recommended Keystatic pattern):
 *  - Local dev (`npm run dev`): edits files on disk, no sign-in. You commit with Git.
 *  - Production (gotruva.com/keystatic): Keystatic Cloud — editors sign in with
 *    GitHub and Save commits straight to the gotruva/truva repo, triggering a Vercel
 *    deploy. No Git needed, works from any browser (this is the VA-friendly path).
 * Cloud auth only works on a registered Project URL (https://www.gotruva.com), which
 * is why it stays off on localhost. The public /blog always builds from the committed
 * content/blog/*.mdx files via lib/blog.ts, independent of the storage mode.
 */

const isDev = process.env.NODE_ENV === 'development';

export default config({
  storage: isDev ? { kind: 'local' } : { kind: 'cloud' },
  cloud: { project: 'beto/truva' },
  ui: {
    brand: { name: 'Truva Blog' },
  },
  collections: {
    blog: collection({
      label: 'Blog posts',
      slugField: 'title',
      path: 'content/blog/*/',
      format: { contentField: 'content' },
      columns: ['title', 'category', 'updatedAt'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        seoTitle: fields.text({ label: 'SEO title (optional)' }),
        description: fields.text({ label: 'Meta description', multiline: true }),
        subtitle: fields.text({ label: 'Subtitle', multiline: true }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Savings & Deposits', value: 'banking' },
            { label: 'Credit Cards', value: 'credit-cards' },
            { label: 'Guides', value: 'guides' },
          ],
          defaultValue: 'guides',
        }),
        articleType: fields.select({
          label: 'Article type',
          options: [
            { label: 'Rate Guide', value: 'Rate Guide' },
            { label: 'Review', value: 'Review' },
            { label: 'Comparison', value: 'Comparison' },
            { label: 'Explainer', value: 'Explainer' },
          ],
          defaultValue: 'Explainer',
        }),
        eyebrow: fields.text({ label: 'Eyebrow (optional)' }),
        author: fields.text({ label: 'Author', defaultValue: 'Beto' }),
        publishedAt: fields.date({ label: 'Published date' }),
        updatedAt: fields.date({ label: 'Updated date' }),
        featured: fields.checkbox({ label: 'Featured', defaultValue: false }),
        heroImage: fields.image({
          label: 'Hero image (optional)',
          directory: 'public/images/blog',
          publicPath: '/images/blog',
        }),
        directAnswer: fields.text({
          label: 'Direct answer (shown in the highlighted box at the top)',
          multiline: true,
        }),
        keywords: fields.array(fields.text({ label: 'Keyword' }), {
          label: 'Keywords',
          itemLabel: (props) => props.value,
        }),
        disclosureNote: fields.text({ label: 'Disclosure note', multiline: true }),
        verificationNote: fields.text({ label: 'Verification note (optional)', multiline: true }),
        primaryCta: fields.object(
          {
            label: fields.text({ label: 'Label' }),
            href: fields.text({ label: 'Link', defaultValue: '/banking/rates' }),
            description: fields.text({ label: 'Description (optional)' }),
          },
          { label: 'Primary CTA' },
        ),
        secondaryCta: fields.object(
          {
            label: fields.text({ label: 'Label (optional)' }),
            href: fields.text({ label: 'Link (optional)' }),
            description: fields.text({ label: 'Description (optional)' }),
          },
          { label: 'Secondary CTA' },
        ),
        faqItems: fields.array(
          fields.object({
            question: fields.text({ label: 'Question' }),
            answer: fields.text({ label: 'Answer', multiline: true }),
          }),
          { label: 'FAQ', itemLabel: (props) => props.fields.question.value || 'Question' },
        ),
        relatedArticles: fields.array(fields.text({ label: 'Related post slug' }), {
          label: 'Related articles (slugs)',
          itemLabel: (props) => props.value,
        }),
        content: fields.mdx({ label: 'Body' }),
      },
    }),
  },
});
