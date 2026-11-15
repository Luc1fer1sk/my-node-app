const { Command } = require('commander');

const program = new Command();

program
  .name('my-cli')
  .description('CLI-prilozhenie dlya laboratornoy raboty No 17')
  .version('1.0.0', '-V, --version', 'vyvesti versiyu prilozheniya')
  .option('-v, --verbose', 'podrobnyi vyvod')
  .helpOption('-h, --help', 'pokazat spravku po komandam');

program
  .command('generate')
  .description('sgenerirovat otchyot')
  .option('-t, --type <type>', 'tip otchyota (po umolchaniyu: "html")', 'html')
  .option('-o, --output <path>', 'put dlya sohraneniya')
  .option('-f, --force', 'perezapisat sushchestvuyushchiy fayl')
  .option('--dry-run', 'pokazat chto budet sdelano bez vypolneniya')
  .action((options) => {
    const parentOpts = program.opts();
    const isVerbose = parentOpts.verbose;
    const validTypes = ['html', 'pdf', 'json', 'csv'];
    const type = options.type;

    if (!validTypes.includes(type)) {
      console.error(`Oshibka: nedopustimyi tip otchyota "${type}".`);
      console.error('Dopustimye znacheniya: html, pdf, json, csv');
      process.exit(1);
    }

    const outputPath = options.output || `./output.${type}`;

    if (options.dryRun) {
      console.log(`[DRY-RUN] Budet sgenerirovan otchyot tipa: ${type}`);
      console.log(`[DRY-RUN] Fayl budet sohranen v: ${outputPath}`);
      console.log('[DRY-RUN] Deystviya ne vypolneny (rezhim proverki)');
      process.exit(0);
    }

    if (isVerbose) {
      console.log('[VERBOSE] Zapusk generacii otchyota...');
      console.log(`[VERBOSE] Tip otchyota: ${type}`);
      console.log(`[VERBOSE] Put sohraneniya: ${outputPath}`);
    }

    console.log(`Otchyot uspeshno sgenerirovan: ${outputPath}`);
  });

program
  .command('convert')
  .description('konvertirovat fayl')
  .option('-i, --input <path>', 'vhodnoy fayl')
  .option('-o, --output <path>', 'vyhodnoy fayl')
  .action((options) => {
    const input = options.input || 'input.txt';
    const output = options.output || 'output.txt';
    console.log(`Fayl uspeshno skonvertirovan iz ${input} v ${output}`);
  });

program.parse(process.argv);
