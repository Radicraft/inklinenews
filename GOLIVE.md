# Going live, step by step

Written for a first run. No terminal needed at any point: Cloudflare does the
building. Order matters; each stage is five to ten minutes.

## Stage 1: put the site's code on GitHub

GitHub is where the site's source lives (think Dropbox for code, with history).
Cloudflare will watch it and publish whatever is there.

1. Go to github.com, Sign up (free). Verify the email.
2. Download and install GitHub Desktop from desktop.github.com, sign in.
3. Unzip inklinenews-site.zip somewhere sensible. IMPORTANT: the zip
   unpacks to a folder named inklinenews; the folder you use in the next
   step must be the one that directly contains package.json (open it and
   check), not a folder that contains the inklinenews folder.
4. In GitHub Desktop: File -> Add local repository -> choose that folder.
   It will say the folder is not a repository and offer "create a repository
   here instead": accept. Name: inklinenews. Leave everything else default.
5. Bottom-left box: type "first version" in the Summary field, press
   "Commit to main".
6. Top bar: "Publish repository". UNTICK "Keep this code private" only if you
   want it public; private is fine and free. Press Publish.

Done: the code is on GitHub. Later changes: edit files in the folder, open
GitHub Desktop, write a one-line summary, Commit, then "Push origin".

7. One tidy-up while you are there: on github.com open the repository, go to
   .github/workflows, click deploy-siteground.yml, the bin icon, and commit
   the deletion. That file is for the SiteGround route and would send you a
   failure email every day otherwise. Keep rebuild-news.yml.

## Stage 2: connect Cloudflare Pages

1. Go to dash.cloudflare.com, create a free account.
2. Left menu: Workers & Pages -> Create -> Pages tab -> "Connect to Git".
3. Authorise GitHub when it asks, pick the inklinenews repository.
4. Build settings, exactly this:
   - Framework preset: Astro
   - Build command: npm run build
   - Build output directory: dist
   - Root directory: leave empty if package.json is at the top of your
     repository; set it to inklinenews if you committed the zip's outer
     folder (the symptom of getting this wrong is a build error saying
     package.json could not be found)
5. Press "Save and Deploy". Watch the log: you should see the same wall of
   green the build prints locally (Registry valid, four gates passed). Two or
   three minutes later you get a working preview at something.pages.dev.
   Click it and check the site on your phone.

If the build fails, the log says why in the last lines; nothing has gone live,
so nothing can break by trying again.

Note: Cloudflare's dashboard sometimes creates a WORKERS project instead of a
Pages project when importing a repository (the giveaway is a "Deploy command"
field containing npx wrangler deploy). That works too; the repository carries
the wrangler.jsonc file it needs. Fill the form as: Build command
npm run build; Deploy command npx wrangler deploy; leave the non-production
command as offered; Path is / if package.json sits at the top of your
repository, or /inklinenews if you committed the zip's outer folder.

## Stage 3: point inklinenews.com at it

1. In the Pages project: Custom domains -> "Set up a custom domain" -> type
   inklinenews.com. Cloudflare shows you exactly one DNS record to create.
2. New tab: SiteGround -> Services -> Domains -> inklinenews.com -> DNS Zone
   Editor. Create the record Cloudflare asked for (usually a CNAME named @ or
   inklinenews.com pointing at your something.pages.dev). Delete any old A
   record for @ that points elsewhere, otherwise the two fight.
3. Back in Cloudflare, press "Check DNS" / "Activate". Allow up to an hour,
   usually minutes. HTTPS is automatic; no certificate to buy or renew.
4. Repeat step 1 for www.inklinenews.com so the www version works too; the
   site redirects it to the bare domain by itself.

If SiteGround's editor refuses a CNAME on @, the alternative Cloudflare will
offer is moving DNS to Cloudflare (free): Cloudflare gives you two nameserver
addresses, and in SiteGround you swap the domain's nameservers to those. The
domain itself stays registered and paid for at SiteGround.

## Stage 4: the daily news refresh (five minutes, optional but worth it)

This makes Substack posts tagged Inkline appear on /news/ within a day.

1. Cloudflare Pages project -> Settings -> Builds & deployments ->
   Deploy hooks -> Create hook. Name: daily-news. Copy the URL it gives you.
2. GitHub -> your repository -> Settings -> Secrets and variables -> Actions
   -> New repository secret. Name: CF_DEPLOY_HOOK. Value: paste the URL.
3. That is all: the small workflow already in the repository pings it every
   morning at 06:10, Cloudflare rebuilds, the build fetches your Substack
   feed, and tagged posts land on /news/.

## Stage 4b: the App Store badge (five minutes)

The download buttons upgrade to Apple's official badge automatically once the
artwork is in place. Apple licenses the artwork to you, so this download is
yours to do:

1. Go to developer.apple.com/app-store/marketing/guidelines/, scroll to the
   licence agreement at the bottom, tick agree, and press Agree and Download.
   (Alternatively, App Store Marketing Tools at
   toolbox.marketingtools.apple.com/app-store can generate the badge already
   linked to Inkline's product page once the app ID exists.)
2. From the downloaded artwork, take the black "Download on the App Store"
   badge in English as SVG. Black is Apple's preferred version and the one
   the site expects; the grey border is part of the artwork, so never
   recolour, crop or animate it.
3. Save it into the repository as
   badges/download-on-the-app-store.svg inside the public folder
   (public/badges/download-on-the-app-store.svg), commit and push.
4. The next build renders the badge in the home hero and on the app and
   pricing pages, one badge per page, correctly sized with Apple's required
   clear space. Until the file exists, the styled text buttons show instead,
   so nothing breaks in the meantime. The Apple trademark credit line is
   already in the site footer.

## Stage 5: email

The free route: Cloudflare dashboard -> your domain -> Email -> Email Routing:
create hello@inklinenews.com and forward it to your normal inbox. Put that
address to work on the support and press pages.

## When you publish an app update post on Substack

Tag it "Inkline". Next morning it is on the site. To force it immediately:
GitHub -> repository -> Actions -> "Daily news rebuild" -> Run workflow.

## If it all goes wrong

Nothing here is destructive. The site is a folder of files; it can be
uploaded anywhere (the SiteGround route stays documented in README.md), and
the domain never leaves SiteGround. Deleting the Pages project and starting
this list again costs ten minutes.
