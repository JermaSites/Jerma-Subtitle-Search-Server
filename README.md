Made to get rid of the need to download the subtitle index on the client before being able to search.

Running on a [Hertzner CCX13 VPS](https://www.hetzner.com/cloud#general-purpose) / [Coolify](https://coolify.io), graciously sponsored by [@pauleks](https://github.com/pauleks).

#### Running Locally

```bash
git clone https://github.com/JermaSites/Jerma-Subtitle-Search-Server.git
cd Jerma-Subtitle-Search-Server
mkdir server/resources
curl -o server/resources/SubtitleIndex.json.gzip https://subtitlefiles.jerma.io/file/jerma-subtitles/SubtitleIndex.json.gzip
bun install
bun run dev
```

[^1]: https://developers.cloudflare.com/workers/platform/limits/#worker-limits
