'use strict';

const fs = require('fs-extra');
const os = require('node:os');
const path = require('node:path');
const { listSkills, validateSkillFile } = require('./utils/parser');

const AGENTS = [
  { id: 'cursor', flag: 'cursor', label: 'Cursor', directory: '.cursor/skills' },
  { id: 'claude', flag: 'claude', label: 'Claude Code', directory: '.claude/skills' },
  { id: 'codex', flag: 'codex', label: 'Codex', directory: '.agents/skills' }
];

const SKILLS_DIRECTORY = path.resolve(__dirname, '..', 'skills');

async function installSkills({ skillIds, agents, global = false, force = false }) {
  if (!Array.isArray(skillIds) || skillIds.length === 0) {
    throw new Error('Select at least one skill to install.');
  }

  if (!Array.isArray(agents) || agents.length === 0) {
    throw new Error('Select at least one agent to install for.');
  }

  const availableSkills = new Set(await listSkills());
  const uniqueSkillIds = [...new Set(skillIds)];
  const uniqueAgents = [...new Set(agents)];

  for (const skillId of uniqueSkillIds) {
    if (!availableSkills.has(skillId)) {
      throw new Error(`Unknown skill "${skillId}". Run "perfom-audit skills install" to see available skills.`);
    }
  }

  const agentById = new Map(AGENTS.map((agent) => [agent.id, agent]));
  const selectedAgents = uniqueAgents.map((agentId) => {
    const agent = agentById.get(agentId);
    if (!agent) {
      throw new Error(`Unknown agent "${agentId}". Supported agents: ${AGENTS.map(({ id }) => id).join(', ')}.`);
    }
    return agent;
  });

  const validatedSkills = await Promise.all(uniqueSkillIds.map(async (skillId) => {
    const sourcePath = path.join(SKILLS_DIRECTORY, skillId, 'SKILL.md');
    await validateSkillFile(sourcePath, skillId);
    return { skillId, sourcePath };
  }));

  const rootDirectory = global ? os.homedir() : process.cwd();
  const destinations = validatedSkills.flatMap(({ skillId, sourcePath }) =>
    selectedAgents.map((agent) => ({
      skillId,
      sourcePath,
      agent: agent.id,
      destinationPath: path.join(rootDirectory, agent.directory, skillId, 'SKILL.md')
    }))
  );

  if (!force) {
    const existing = [];
    for (const destination of destinations) {
      if (await fs.pathExists(destination.destinationPath)) {
        existing.push(destination.destinationPath);
      }
    }

    if (existing.length > 0) {
      throw new Error(
        `The following skill files already exist (use --force to overwrite):\n${existing.join('\n')}`
      );
    }
  }

  for (const destination of destinations) {
    await fs.ensureDir(path.dirname(destination.destinationPath));
    await fs.copyFile(destination.sourcePath, destination.destinationPath);
  }

  return destinations.map(({ skillId, agent, destinationPath }) => ({
    skillId,
    agent,
    path: destinationPath
  }));
}

module.exports = { AGENTS, installSkills };
