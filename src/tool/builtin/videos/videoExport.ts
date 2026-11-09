import { copyFile, link, mkdir, unlink } from "node:fs/promises";
import { constants } from "node:fs";
import { randomUUID } from "node:crypto";
import { dirname, extname } from "node:path";
import { G9AgentToolRuntimeError } from "../../protocol/errors.js";
import type { G9AgentToolRuntimeContext } from "../../protocol/types.js";
import { resolveG9AgentWorkspacePath } from "../filesystem/pathSafety.js";
import { withFileMutation } from "../filesystem/coordinateMutation.js";
import type { GeneratedVideo } from "./VideoStore.js";
export function outputPath(path: string, context: G9AgentToolRuntimeContext): string {
  const resolved = resolveG9AgentWorkspacePath(path, context, { forWrite: true });
  if (!resolved.ok) throw new G9AgentToolRuntimeError(resolved.error.code, resolved.error.message);
  if (extname(path).toLowerCase() !== ".mp4") throw new G9AgentToolRuntimeError("invalid_tool_input", "Output path must end in .mp4.");
  return resolved.absolutePath;
}
export async function publish(video: GeneratedVideo, path: string, context: G9AgentToolRuntimeContext): Promise<string> {
  const target = outputPath(path, context);
  return withFileMutation(context, target, async () => {
    outputPath(path, context); context.abortSignal?.throwIfAborted();
    await context.fileHistory?.trackEdit(target, context.messageId ?? context.turnId);
    await mkdir(dirname(target), { recursive: true }); const staging = `${target}.${randomUUID()}.tmp`;
    try {
      await copyFile(video.path, staging, constants.COPYFILE_EXCL); context.abortSignal?.throwIfAborted();
      await link(staging, target);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new G9AgentToolRuntimeError("file_conflict", "The output file already exists. Choose a new path.");
      throw error;
    } finally { await unlink(staging).catch(() => {}); }
    await context.fileHistory?.recordEdit?.(target, context.messageId ?? context.turnId); return target;
  });
}
