const fs = require('fs');
const chalk = require('chalk');
const ora = require('ora');
const cliProgress = require('cli-progress');
const { Command } = require('commander');

const program = new Command();

program
  .name('my-cli')
  .description('Formatirovannyi vyvod: cveta, spinnery, progress-bary');

program
  .command('process')
  .description('obrabotka faylov s vizualizaciey')
  .option('--files <files...>', 'spisok faylov dlya obrabotki')
  .action(async (options) => {
    const isTTY = process.stdout.isTTY;
    const fileList = options.files || [];

    if (fileList.length === 0) {
      process.stderr.write(chalk.red('✖ Oshibka: ne ukazany fayly dlya obrabotki\n'));
      process.exit(1);
    }

    const spinner = ora({
      text: 'Poisk i proverka faylov...',
      stream: process.stderr,
      isSilent: !process.stderr.isTTY
    }).start();

    await new Promise((r) => setTimeout(r, 600));

    const existingFiles = [];
    const missingFiles = [];

    fileList.forEach((f) => {
      if (fs.existsSync(f)) {
        existingFiles.push(f);
      } else {
        missingFiles.push(f);
      }
    });

    if (missingFiles.length > 0 && existingFiles.length === 0) {
      spinner.fail('Fayly ne naydeny');
      missingFiles.forEach((f) => {
        process.stderr.write(chalk.red(`✖ Fayl ${f} ne nayden\n`));
      });
      process.stderr.write(chalk.yellow(`⚠ Propushcheno ${missingFiles.length} fayl(ov)\n`));
      process.exit(1);
    }

    spinner.succeed(`Fayly naydeny (${existingFiles.length} sht.)`);

    let progressBar = null;
    if (process.stderr.isTTY && existingFiles.length > 1) {
      progressBar = new cliProgress.SingleBar({
        format: 'Obrabotka faylov... [{bar}] {percentage}% | {value}/{total} | ETA: {eta}s',
        barCompleteChar: '█',
        barIncompleteChar: '░',
        stream: process.stderr
      });
      progressBar.start(existingFiles.length, 0);
    }

    const processedResults = [];
    for (let i = 0; i < existingFiles.length; i++) {
      const file = existingFiles[i];
      await new Promise((r) => setTimeout(r, 150));
      processedResults.push({
        file,
        size: fs.statSync(file).size,
        status: 'obrabotan'
      });
      if (progressBar) progressBar.update(i + 1);
    }

    if (progressBar) progressBar.stop();

    existingFiles.forEach((f) => {
      process.stderr.write(chalk.green(`✔ Fayl ${f} obrabotan\n`));
    });

    if (missingFiles.length > 0) {
      missingFiles.forEach((f) => {
        process.stderr.write(chalk.red(`✖ Fayl ${f} ne nayden\n`));
      });
      process.stderr.write(chalk.yellow(`⚠ Propushcheno ${missingFiles.length} fayl\n`));
    }

    process.stderr.write(chalk.green('✔ Obrabotka zavershena\n'));

    const outputData = {
      timestamp: new Date().toISOString(),
      total: fileList.length,
      processed: existingFiles.length,
      skipped: missingFiles.length,
      files: processedResults
    };

    const jsonString = JSON.stringify(outputData, null, 2) + '\n';
    process.stdout.write(jsonString);

    if (isTTY) {
      console.error(chalk.blue('Rezultat sohranen: stdout'));
    }

    if (missingFiles.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  });

program.parse(process.argv);
