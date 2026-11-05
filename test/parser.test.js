'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { listSkills, validateSkillFile } = require('../src/utils/parser');

test('all catalog skills have valid frontmatter and support every agent', async () => {
  const skills = await listSkills();
  assert.equal(skills.length, 7);

  for (const skillId of skills) {
    const skillPath = path.resolve(__dirname, '..', 'skills', skillId, 'SKILL.md');
    const parsed = await validateSkillFile(skillPath, skillId);
    assert.ok(parsed.content.trim().length > 0, `${skillId} should include skill instructions`);
  }
});

test('Codex support is required and reported explicitly', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'performance-auditor-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  const skillPath = path.join(directory, 'SKILL.md');
  await fs.writeFile(skillPath, `---
name: sample-skill
description: A test skill.
agents:
  - name: claude-code
    supported: true
  - name: cursor
    supported: true
---
Instructions.
`);

  await assert.rejects(
    validateSkillFile(skillPath, 'sample-skill'),
    /missing required Codex support/
  );
});
