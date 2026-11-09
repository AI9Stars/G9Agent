import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { tmpdir } from "node:os";

import { createSendAttachmentTool } from "../../../src/tool/builtin/sendAttachment.js";
import type { G9AgentToolRuntimeContext } from "../../../src/tool/protocol/types.js";

function context(cwd: string, workDir = join(cwd, ".g9agent", "work", "session", "turn")): G9AgentToolRuntimeContext {
  return {
    sessionId: "s1",
    turnId: "t1",
    cwd,
    permissionMode: "bypassPermissions",
    permissionContext: {
      mode: "bypassPermissions",
      cwd,
      additionalWorkingDirectories: [],
      canPrompt: true,
      bypassAvailable: true,
      rules: { allow: [], deny: [], ask: [] },
    },
    env: { G9AGENT_WORK_DIR: workDir },
    now: () => new Date("2026-08-11T00:00:00.000Z"),
  };
}

test("send_attachment rejects workspace .g9agent/work candidates with deliver guidance", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "g9agent-send-attachment-internal-"));
  try {
    const workDir = join(projectRoot, ".g9agent", "work", "session", "turn");
    const candidate = join(workDir, "candidate.docx");
    await mkdir(workDir, { recursive: true });
    await writeFile(candidate, "candidate");

    const tool = createSendAttachmentTool();
    const relativeCandidate = relative(projectRoot, candidate);
    const validation = await tool.validateInput?.({ file_path: relativeCandidate }, context(projectRoot, workDir));

    assert.equal(validation?.ok, false);
    if (validation?.ok === false) {
      assert.equal(validation.issues[0]?.path, "file_path");
      assert.match(validation.issues[0]?.message ?? "", /internal work directory/);
      assert.match(validation.issues[0]?.message ?? "", /delivery workflow/);
    }
    await assert.rejects(
      () => tool.execute({ file_path: relativeCandidate }, context(projectRoot, workDir)),
      /Publish the reviewed final artifact outside G9AGENT_WORK_DIR/,
    );
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("send_attachment also rejects a configured work directory outside workspace .g9agent/work", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "g9agent-send-attachment-workspace-"));
  const configuredWorkDir = await mkdtemp(join(tmpdir(), "g9agent-send-attachment-custom-work-"));
  try {
    const candidate = join(configuredWorkDir, "candidate.pdf");
    await writeFile(candidate, "candidate");

    const validation = await createSendAttachmentTool().validateInput?.(
      { file_path: candidate },
      context(projectRoot, configuredWorkDir),
    );

    assert.equal(validation?.ok, false);
    if (validation?.ok === false) {
      assert.match(validation.issues[0]?.message ?? "", /G9AGENT_WORK_DIR/);
    }
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
    await rm(configuredWorkDir, { recursive: true, force: true });
  }
});

test("send_attachment rejects symlinks that resolve into an internal work directory", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "g9agent-send-attachment-symlink-"));
  try {
    const workDir = join(projectRoot, ".g9agent", "work", "session", "turn");
    const candidate = join(workDir, "candidate.docx");
    const publishedAlias = join(projectRoot, "final.docx");
    await mkdir(workDir, { recursive: true });
    await writeFile(candidate, "unreviewed candidate");
    await symlink(candidate, publishedAlias);

    const tool = createSendAttachmentTool();
    const validation = await tool.validateInput?.(
      { file_path: publishedAlias },
      context(projectRoot, workDir),
    );

    assert.equal(validation?.ok, false);
    await assert.rejects(
      () => tool.execute({ file_path: publishedAlias }, context(projectRoot, workDir)),
      /inside G9Agent's internal work directory/,
    );
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});

test("send_attachment still sends reviewed files published to the workspace", async () => {
  const projectRoot = await mkdtemp(join(tmpdir(), "g9agent-send-attachment-delivered-"));
  try {
    const delivered = join(projectRoot, "final.docx");
    await writeFile(delivered, "reviewed final");

    const tool = createSendAttachmentTool();
    const validation = await tool.validateInput?.({ file_path: delivered }, context(projectRoot));
    assert.deepEqual(validation, { ok: true, input: { file_path: delivered } });

    const result = await tool.execute({ file_path: delivered }, context(projectRoot));
    assert.equal(result.data?.filePath, delivered);
    assert.equal(result.data?.name, "final.docx");
    assert.equal(result.metadata?.attachmentDelivery, true);
  } finally {
    await rm(projectRoot, { recursive: true, force: true });
  }
});
