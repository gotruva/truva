# Truva Blog CMS — How to Use It

A plain guide to writing and publishing blog posts with Keystatic. No coding needed for day-to-day writing.

---

## 1. Open the CMS

1. Start the site on your machine:
   ```
   npm run dev
   ```
2. In your browser, go to **http://localhost:3000/keystatic**

You'll see the dashboard with **Blog posts** and how many entries exist.

> The CMS only edits files in your project. "Saving" writes a Markdown file; it goes live after you commit + push (see step 6).

---

## 2. Create a new post

1. Click **Blog posts** → **Create** (top right).
2. Fill in the fields top to bottom. Here's what each one does:

| Field | What it's for |
|---|---|
| **Title** | The headline. The **Slug** (the URL, `/blog/your-slug`) auto-fills from it — click *Regenerate* if you rename. **Don't change the slug after publishing.** |
| **SEO title** | Optional. The title Google shows, if different from the headline. Leave blank to reuse the title. |
| **Meta description** | The 1–2 sentence summary in Google results. ~150 characters. |
| **Subtitle** | The supporting line under the headline on the page. |
| **Category** | Savings & Deposits, Credit Cards, or Guides. Controls which cluster page the post appears on. |
| **Article type** | Rate Guide / Review / Comparison / Explainer. Just sets the little label + icon. |
| **Eyebrow** | Optional small label above the title (e.g. "Safety guide"). |
| **Published date / Updated date** | Set both. Update the "Updated date" whenever you refresh the post — it's a freshness signal for Google. |
| **Featured** | Tick one post to pin it to the top of `/blog`. |
| **Hero image** | Optional. Upload an image; it's saved into the project automatically. |
| **Direct answer** | The highlighted box at the very top of the post. Write the short, quotable answer to the post's main question — this is what wins Google snippets and AI answers. |
| **Keywords** | Click *Add* for each target keyword. Helps you stay focused; minor SEO value. |
| **Disclosure note** | The trust line near the CTA (e.g. taxes/charges not deducted, affiliate note). |
| **Verification note** | Optional "rates verified on [date]" line. |
| **Primary CTA** | The main button. **Label** = button text, **Link** = where it goes (use `/banking/rates`, `/calculator`, or `/credit-cards`). |
| **Secondary CTA** | Optional second button. |
| **FAQ** | Click *Add* for each question/answer. These power the FAQ rich-result in Google. Also write them out in the body if you want them visible. |
| **Related articles** | Add the *slugs* of other posts (e.g. `pdic-insurance-guide`) to cross-link them. |
| **Body** | The article itself — see step 3. |

---

## 3. Write the body

The Body editor is a simple word-processor:

- Use the **Paragraph ▾** dropdown (top-left of the editor) to switch a line to **Heading 2** or **Heading 3**. These headings automatically build the table of contents on the post.
- **Bold**, *italic*, bullet lists, numbered lists, links, and tables are all in the toolbar.
- Write in plain language (Grade 6–8). Lead with the answer.
- **Always include at least one link into a comparison page** — highlight some text, click the link button, and point it at `/banking/rates`, `/calculator`, or `/credit-cards`. That's how a post turns a reader into a user.

> You don't need to add a "Direct Answer" box or a CTA button inside the body — those come from the **Direct answer** and **Primary CTA** fields automatically.

---

## 4. Save

Click **Create** (or **Save** when editing). Keystatic writes the post to
`content/blog/your-slug/index.mdx`.

At this point the post exists **on your computer only**.

---

## 5. Preview it before publishing

With `npm run dev` running, open:
**http://localhost:3000/blog/your-slug**

Check: the headline, the Direct Answer box, your headings/TOC, the CTA button, and that links work. Edit in the CMS and refresh until it looks right.

---

## 6. Publish (make it live)

Because content lives in your code repo, publishing = committing the file:

```
git add content/blog
git commit -m "New blog post: your title"
git push
```

Vercel automatically rebuilds and deploys. Your post is live at
`gotruva.com/blog/your-slug` in ~1–2 minutes. The sitemap, OG image, and
schema are all generated for it automatically.

> Prefer not to touch Git? That's exactly what **Keystatic Cloud** is for (see below) — it does the commit + deploy for you from the browser.

---

## 7. Editing or unpublishing later

- **Edit:** open the post in `/keystatic`, change it, Save, commit/push. Bump the **Updated date**.
- **Unpublish:** delete the post in `/keystatic` (or delete its `content/blog/your-slug` folder), then commit/push.

---

## Optional: publish from any browser (Keystatic Cloud)

Right now the CMS runs on your machine (you commit with Git). To publish from
a phone or hand writing to a non-technical teammate **without Git**:

1. Go to **https://keystatic.cloud**, sign in with GitHub, create a project, and connect the Truva repo.
2. In `keystatic.config.ts`, change `storage: { kind: 'local' }` to:
   ```ts
   storage: { kind: 'cloud' },
   cloud: { project: 'your-team/truva' },
   ```
3. After that, anyone you invite can open `gotruva.com/keystatic`, write, and click Save — it commits and deploys automatically.

(Ask Claude Code to do step 2 for you.)

---

## Quick reference

- **CMS:** http://localhost:3000/keystatic
- **A post on disk:** `content/blog/<slug>/index.mdx`
- **Live URL:** `gotruva.com/blog/<slug>`
- **Golden rules:** lead with the answer · link into a comparison page · never change a live slug · bump the Updated date when you refresh.
