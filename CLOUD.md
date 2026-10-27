# Cloud execution

Version 0.2.1 includes a local command-line renderer. It does not include a deployed cloud service, remote MCP server, job queue, hosted preview or cloud credentials. The following deployment choices are an implementation design, not installed functionality.

## Option 1: run the project in a cloud coding environment

Prepare the same independent project in a cloud VM with Node.js 22+, npm, the pinned dependencies, Chrome Headless Shell and its Linux system libraries. The agent can then author scene JSON and run the existing generation commands in that VM. Exported media must be saved or downloaded from the environment.

This is the shortest path to a cloud pilot because it keeps the current renderer. It still requires environment setup and a full generation test on that platform. The plugin installed on an employee's laptop is not automatically installed in a cloud task.

Codex currently supports published cloud environments with repositories, dependency setup and isolated task workspaces. Repository skills are available there; personal local skills are not synced. Its documented browser/computer-use limitation also means the desktop playback-review workflow cannot simply be assumed to work unchanged. Check both headless rendering and a supported visual-review path before calling the workflow ready. See [Codex cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments).

Claude Code cloud does not load locally installed plugins or repository marketplace/`enabledPlugins` settings. Repository skills can load, and server-managed organizational plugins have a separate supported installation path. Prepare the standalone project or the applicable organization setup and verify rendering there. Remote Control of a local session keeps execution on the local machine; it is not a cloud renderer. See [cloud environment carryover](https://code.claude.com/docs/en/cloud-environments#what-carries-over-from-your-setup), [organization plugin support](https://code.claude.com/docs/en/plugins/org#when-each-surface-applies-the-plugin-keys) and [Remote Control](https://code.claude.com/docs/en/remote-control).

The Remotion documentation describes [server rendering](https://www.remotion.dev/docs/ssr) and [a Linux/Docker runtime](https://www.remotion.dev/docs/docker). Follow the system dependency requirements and test the pinned version. Preserve this project's single-page rendering, PNG frame capture and fractional movement settings when introducing another deployment method.

## Option 2: a shared render service

For employees who should only need an agent and a prompt, the proposed product architecture is:

```text
Codex / Claude Code
    -> shared skill and remote MCP tools
    -> versioned catalog + scene validation
    -> render queue
    -> isolated Remotion workers with bundled artwork and fonts
    -> private preview, PNG, MP4 and editable scene artifacts
```

The agent composes a scene using the same component contracts. The service validates that scene and renders the pinned library version. Employees do not need Node.js, a render browser or the full library on their computers.

Proposed tools, not current exports:

| Tool | Purpose |
| --- | --- |
| `search_components` | Find exact component IDs, variants and previews. |
| `describe_component` | Return editable fields, data slots, limits and motion targets. |
| `validate_scene` | Validate the complete scene and return actionable errors/warnings. |
| `render_scene` | Submit a PNG/MP4 job and return a job ID; accept an idempotency key. |
| `get_render_job` | Return progress, failure details and generated artifact links. |
| `get_artifacts` | Retrieve an authorized preview, images, video and editable scene. |

A public component package does not require public access to employee-generated scenes. The render service should authenticate callers and isolate job files. Each job needs a time/resource limit; custom logos need an asset-upload path. Start with validated scene JSON and the published library rather than accepting arbitrary executable React code.

Record plugin/catalog version, input scene hash, render settings and artifact hashes with each job. Preserve stable component/data IDs across revisions. Pin library versions so an update cannot silently change an existing scene.

A worker must provide a writable output directory, temporary space and browser cache. The bundled runtime is roughly 300 MB before dependencies; measure the built image and real job duration instead of assuming it fits a short-lived function platform. The current CLI renders sequentially and expects a new or empty output directory, so retries should use a separate attempt directory.

A queue and artifact store allow the agent to submit work, check progress and return downloadable results without keeping a long tool request open. Keep generated output separate from temporary render files and give preview links an explicit retention policy.

## Implementation sequence

1. Verify the extracted distribution in a Linux container: exact fonts/assets, a PNG, a complete MP4, adaptive data and internal motion.
2. Package that tested runtime as a worker image; record the library and dependency versions.
3. Add authenticated scene validation, job submission/status, queueing and artifact storage.
4. Expose those capabilities through a remote MCP server and add its connection to both plugin hosts.
5. Have each host create and revise the same example, including custom data/logo assets; inspect generated frames and play the exported video.
6. Test failure/retry/cancellation behavior, isolation, output retention and costs before employee rollout.

A cloud pilot in a coding environment can happen before the shared service. For a consistent employee experience across agents, the shared render service is the recommended next product stage. It is additional engineering and hosting; installing this release candidate does not deploy it.
