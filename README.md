Made to get rid of the need to download the subtitle index on the client before being able to search.

Proof of concept.

Tried [Vercel fluid compute](https://vercel.com/fluid), didn't work because their [functions lifecycle](https://vercel.com/docs/functions#functions-lifecycle) causes the subtitle index to be loaded from scratch for most requests.  
Tried [Coolify](https://coolify.io) on a `Raspberry Pi 4 Model B Rev 1.4 (2GB)`, didn't have enough memory.  
Tried [Cloudflare Workers](https://workers.cloudflare.com), didn't have enough memory[^1].  
Tried [Stormkit](https://stormkit.io), deploying fails with a useless error message.  
Tried [Zeabur](zeabur.com), kinda works but their free plan won't cut it.

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
