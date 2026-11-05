#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const { checkbox } = require('@inquirer/prompts');
const { listSkills, installSkills, AGENTS } = require('../src');

const program = new Command();

program
  .name('perfom-audit')
  .description('Bootstrap web performance auditing skills for an AI coding agent.')
  .version('1.0.0');

const skillsCommand = program.command('skills').description('Manage auditing skills');

skillsCommand
  .command('install')
  .description('Install one or more auditing skills')
  .argument('[skill-id]', 'skill to install; omit to choose interactively')
  .option('--cursor', 'install for Cursor')
  .option('--claude', 'install for Claude Code')
  .option('--codex', 'install for Codex')
  .option('-g, --global', 'install in the current user home directory')
  .option('-f, --force', 'overwrite existing skill files')
  .action(async (skillId, options) => {
    let selectedSkills = skillId ? [skillId] : null;
    let selectedAgents = AGENTS.filter((agent) => options[agent.flag]);

    if (!selectedSkills) {
      const skills = await listSkills();
      selectedSkills = await checkbox({
        message: 'Choose the skills to install:',
        choices: skills.map((id) => ({ name: id, value: id })),
        required: true
      });

      if (selectedAgents.length === 0) {
        selectedAgents = await checkbox({
          message: 'Choose the agents to install for:',
          choices: AGENTS.map((agent) => ({
            name: agent.label,
            value: agent.id
          })),
          required: true
        });
      } else {
        selectedAgents = selectedAgents.map((agent) => agent.id);
      }
    } else if (selectedAgents.length === 0) {
      selectedAgents = AGENTS.map((agent) => agent.id);
    } else {
      selectedAgents = selectedAgents.map((agent) => agent.id);
    }

    const installed = await installSkills({
      skillIds: selectedSkills,
      agents: selectedAgents,
      global: options.global,
      force: options.force
    });

    for (const destination of installed) {
      console.log(`Installed ${destination.skillId} for ${destination.agent} at ${destination.path}`);
    }
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
