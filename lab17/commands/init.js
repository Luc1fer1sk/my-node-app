const logger = require('../utils/logger');
const { initProject } = require('../services/projectService');

function registerInitCommand(program) {
  program
    .command('init')
    .description('initsializaciya proekta')
    .option('-n, --name <name>', 'imya proekta', 'my-app')
    .option('-t, --type <type>', 'tip proekta', 'cli')
    .action((options) => {
      const res = initProject(options);
      logger.success(`Proekt "${res.name}" sozdan`);
      logger.success('Ustanovleny zavisimosti');
      logger.success('Inicializirovan Git-repozitoriy');
      console.log('Proekt gotov k rabote!');
    });
}

module.exports = {
  registerInitCommand
};
