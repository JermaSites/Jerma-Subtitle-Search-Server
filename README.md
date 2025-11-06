Made to get rid of the need to download the subtitle index on the client before being able to search.

Experimental. Running on [Vercel fluid compute](https://vercel.com/fluid).

#### Running Locally

```bash
# feel free to substitute bun with node & npm/yarn/whatever
git clone https://github.com/JermaSites/Jerma-Subtitle-Search-Server.git
cd Jerma-Subtitle-Search-Server
mkdir server/resources
curl -o server/resources/SubtitleIndex.json.gzip https://subtitlefiles.jerma.io/file/jerma-subtitles/SubtitleIndex.json.gzip
bun install
bun run dev
```
