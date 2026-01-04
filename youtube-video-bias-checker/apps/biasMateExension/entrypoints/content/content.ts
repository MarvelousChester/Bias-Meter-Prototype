import { extractVideoId } from "@bias-mate/shared";
import { extractVideoMetadata } from "../../utils/videoMetadata";
import { getTranscript } from "../../utils/transcript";

export default defineContentScript({
  matches: ["*://*.youtube.com/watch*"],
  main() {},
});
