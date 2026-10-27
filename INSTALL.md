# Install RevenueCat Assets

Version 0.2.1 targets Codex and Claude Code. The distribution repository is [pixel-point/rc-assets-generation](https://github.com/pixel-point/rc-assets-generation). Repository installation requires the plugin files to be present on its default branch. Fresh-session activation has not yet been verified; see [VALIDATION.md](VALIDATION.md).

## Requirements

- A supported Codex desktop/CLI or Claude Code installation.
- Node.js 22 or newer, npm and a writable workspace.
- Network access for the first dependency and Chrome Headless Shell downloads.
- Enough disk space for the bundled library, copied project, dependencies and rendered media.

Normal use needs neither a RevenueCat website repository nor Figma credentials. The plugin does not install Node.js or add global settings merely by being downloaded.

## Install an extracted local bundle

Extract the archive to a persistent directory and use the absolute path to the folder containing `plugin.json`, `.agents/`, `.claude-plugin/` and `skills/`. Replace `/absolute/path/revenuecat-assets-generation` in these commands with that path.

### Codex

```sh
codex plugin marketplace add /absolute/path/revenuecat-assets-generation
codex plugin add revenuecat-assets-generation@revenuecat-assets-local
```

The second command is supported by the locally inspected CLI. If a different client version does not expose `plugin add`, use `/plugins` in Codex CLI or the desktop Plugins UI to select the registered marketplace and install the plugin. Start a new session before invoking `$revenuecat-assets-generation` or asking for a RevenueCat asset.

The current OpenAI documentation supports repo/local marketplaces and the desktop/CLI plugin browser. The Codex IDE extension is not a plugin target. See [packaging and marketplace setup](https://developers.openai.com/plugins/build/plugins) and [supported plugin surfaces](https://learn.chatgpt.com/docs/plugins).

### Claude Code

```sh
claude plugin marketplace add /absolute/path/revenuecat-assets-generation
claude plugin install revenuecat-assets-generation@revenuecat-assets-local --scope user
```

Start a new session, or use the host's reload flow. Invoke `/revenuecat-assets-generation:revenuecat-assets-generation` or describe the creative task. For a temporary development session without a persistent marketplace installation:

```sh
claude --plugin-dir /absolute/path/revenuecat-assets-generation
```

See [Claude Code plugins](https://code.claude.com/docs/en/plugins) and [plugin installation](https://code.claude.com/docs/en/plugins/install).

The marketplace identifier `revenuecat-assets-local` is retained for compatibility. It is an identifier, not a restriction that prevents distributing the same marketplace through Git.

## Install from the repository

The repository contains the shared skill, both host marketplaces and the complete local runtime. The repository name differs from the stable plugin identifier `revenuecat-assets-generation`; keep the plugin and marketplace names exactly as shown.

Codex:

```sh
codex plugin marketplace add pixel-point/rc-assets-generation
codex plugin add revenuecat-assets-generation@revenuecat-assets-local
```

Claude Code:

```sh
claude plugin marketplace add pixel-point/rc-assets-generation
claude plugin install revenuecat-assets-generation@revenuecat-assets-local --scope user
```

Claude Code v2.1.292+ also supports a single shell command:

```sh
claude plugin install revenuecat-assets-generation --marketplace pixel-point/rc-assets-generation --scope user
```

The in-session equivalent requires v2.1.275+ and opens the host's confirmation/details flow. See [add a marketplace and install in one command](https://code.claude.com/docs/en/plugins/install#add-a-marketplace-and-install-in-one-command).

A public repository marketplace is separate from publication in OpenAI's universal plugin directory. Directory publication uses its own [submission process](https://developers.openai.com/plugins/deploy/submission).

## Install with a prompt

Once the plugin files are available in the repository, the employee can ask their agent:

> Install RevenueCat Assets from https://github.com/pixel-point/rc-assets-generation for this agent. Use its documented installation steps, then create a new project and generate a PNG and MP4 from the adaptive-data example.

The agent can perform the available setup commands. The host may still require an installation confirmation, trust approval, reload or new session. The plugin cannot activate itself before installation. A simple prompt is the intended entry point, not a promise to bypass host installation controls.

## First creative request

The installed skill resolves its own root and runs:

```text
node <absolute-plugin-root>/scripts/create-project.mjs <absolute-new-project-path> --install
```

This copies the starter and artwork, runs `npm ci`, and prepares the rendering browser. The destination must be new or empty and outside the installed plugin. The agent then selects components, authors a scene and runs:

```sh
npm run generate -- --props examples/embedded-adaptive-data.json --output out/first-example
```

The default output includes PNG, MP4, review HTML, scene JSON and a manifest. The user does not assemble or export in Studio.

## Updates and existing projects

Use the host's marketplace refresh and plugin update controls. Start a new or reloaded session when requested by the host. Test updates in a new copied project first.

For Claude Code, update the installed plugin in the shell, then run `/reload-plugins` in an existing session:

```sh
claude plugin update revenuecat-assets-generation@revenuecat-assets-local --scope user
```

Marketplace refresh alone does not update an installed plugin, and `/plugin update` is not an in-session command. Future published changes need a version increment so hosts can invalidate cached packages. See [Claude plugin updates](https://code.claude.com/docs/en/plugins/publish#ship-updates-to-users).

Existing creative projects keep their copied version. Migrating one is an explicit agent task: preserve its scene, custom files and component IDs, validate against the new catalog, and regenerate for review.

## Release verification

Before declaring the employee installation workflow verified, complete these checks:

1. Publish an actual versioned distribution location and finalize the code/artwork/font release terms recorded in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
2. Install from that location in a fresh Codex session and a fresh Claude Code session.
3. Discover the skill, create a project, resolve an exact component, revise data and generate PNG/MP4 through each agent.
4. Inspect the outputs and verify an update with an existing project left intact.

Current runtime tests and manifest validation are useful evidence, but do not prove fresh-account host activation. Cloud execution has its own acceptance checks in [CLOUD.md](CLOUD.md).
