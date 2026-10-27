/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
// Keep Studio/direct CLI renders consistent with the export helper.
Config.setVideoImageFormat("png");
Config.setConcurrency(1);
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
