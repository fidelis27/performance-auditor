'use strict';

const fs = require('fs-extra');
const path = require('node:path');
const matter = require('gray-matter');

const REQUIRED_AGENTS = ['claude-code', 'cursor'];
const SKILL_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

async function listSkills(skillsDirectory = path.resolve(__dirname, '..', '..', 'skills')) {
  const entries = await fs.readdir(skillsDirectory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && SKILL_ID_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function validateSkillFile(filePath, expectedSkillId) {
  if (!SKILL_ID_PATTERN.test(expectedSkillId)) {
    throw new Error(`Invalid skill ID "${expectedSkillId}".`);
  }

  const source = await fs.readFile(filePath, 'utf8');
  let parsed;

  try {
    parsed = matter(source);
  } catch (error) {
    throw new Error(`Invalid YAML frontmatter in ${filePath}: ${error.message}`);
  }

  const { name, description, agents } = parsed.data;
  if (name !== expectedSkillId) {
    throw new Error(`${filePath} must declare name: ${expectedSkillId} in its frontmatter.`);
  }
  if (typeof description !== 'string' || description.trim().length === 0) {
    throw new Error(`${filePath} must declare a non-empty description in its frontmatter.`);
  }
  if (!Array.isArray(agents)) {
    throw new Error(`${filePath} must declare an agents list in its frontmatter.`);
  }

  const supportByAgent = new Map(
    agents
      .filter((agent) => agent && typeof agent.name === 'string')
      .map((agent) => [agent.name, agent.supported])
  );
  if (supportByAgent.get('codex') !== true) {
    throw new Error(`${filePath} is missing required Codex support: declare name: codex with supported: true.`);
  }

  const unsupported = REQUIRED_AGENTS.filter((agent) => supportByAgent.get(agent) !== true);
  if (unsupported.length > 0) {
    throw new Error(
      `${filePath} must declare supported: true for: ${unsupported.join(', ')}.`
    );
  }

  return parsed;
}

module.exports = { listSkills, validateSkillFile };
