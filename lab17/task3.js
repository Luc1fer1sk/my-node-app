const inquirer = require('inquirer');
const { Command } = require('commander');

function getStdin() {
  if (process.stdin.isTTY) return Promise.resolve('');
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf-8');
    const timer = setTimeout(() => resolve(data.trim()), 200);
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      resolve(data.trim());
    });
    process.stdin.resume();
  });
}

const program = new Command();

program
  .name('my-cli')
  .description('Interaktivnyi rezhim s inquirer');

program
  .command('init')
  .description('inicializirovat novyi proekt')
  .option('-n, --name <name>', 'nazvanie proekta')
  .option('-t, --type <type>', 'tip proekta (web, cli, lib, micro)')
  .option('--typescript', 'dobavit TypeScript')
  .option('--eslint', 'dobavit ESLint')
  .option('--prettier', 'dobavit Prettier')
  .option('--jest', 'dobavit Jest')
  .option('--git', 'inicializirovat Git')
  .option('--no-git', 'ne inicializirovat Git')
  .option('--no-interactive', 'otklyuchit interaktivnyi dialog')
  .action(async (options) => {
    let name = options.name;
    let type = options.type;
    const isPiped = !process.stdin.isTTY;
    const isNonInteractive = options.interactive === false || isPiped;

    if (isPiped && !name) {
      const stdinBuffer = await getStdin();
      if (stdinBuffer) {
        name = stdinBuffer;
      }
    }

    if (isNonInteractive) {
      if (!name || !type) {
        if (name && !type) {
          console.error('Oshibka: nedostatochno dannyh. Ukazhite --type');
        } else {
          console.error('Oshibka: v neinteraktivnom rezhime neobhodimo ukazat --name i --type');
        }
        process.exit(1);
      }

      const selectedOptions = [];
      if (options.typescript) selectedOptions.push('TypeScript');
      if (options.eslint) selectedOptions.push('ESLint');
      if (options.prettier) selectedOptions.push('Prettier');
      if (options.jest) selectedOptions.push('Jest');

      const typeMap = {
        web: 'Web-prilozhenie',
        cli: 'CLI-utilita',
        lib: 'Biblioteka',
        micro: 'Mikroservis'
      };
      const displayType = typeMap[type.toLowerCase()] || type;

      console.log(`✓ Proekt "${name}" uspeshno inicializirovan!`);
      console.log(`Tip: ${displayType}`);
      console.log(`Opcii: ${selectedOptions.length ? selectedOptions.join(', ') : 'net'}`);
      console.log(`Git: ${options.git ? 'da' : 'net'}`);
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Vvedite nazvanie proekta:',
        default: name || 'my-project'
      },
      {
        type: 'list',
        name: 'type',
        message: 'Vyberite tip proekta:',
        choices: ['Web-prilozhenie', 'CLI-utilita', 'Biblioteka', 'Mikroservis']
      },
      {
        type: 'checkbox',
        name: 'options',
        message: 'Vyberite dopolnitelnye opcii:',
        choices: ['TypeScript', 'ESLint', 'Prettier', 'Jest'],
        default: ['TypeScript', 'Prettier']
      },
      {
        type: 'confirm',
        name: 'git',
        message: 'Ispolzovat Git?',
        default: true
      },
      {
        type: 'password',
        name: 'token',
        message: 'Vvedite token dostupa:',
        mask: '*'
      }
    ]);

    console.log(`✓ Proekt "${answers.name}" uspeshno inicializirovan!`);
    console.log(`Tip: ${answers.type}`);
    console.log(`Opcii: ${answers.options.join(', ')}`);
    console.log(`Git: ${answers.git ? 'da' : 'net'}`);
  });

program.parse(process.argv);
