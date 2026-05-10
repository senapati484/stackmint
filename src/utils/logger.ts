import chalk from 'chalk';

const intro = (title: string) => {
  console.log(chalk.bold.rgb(99, 102, 241)(`◆ stackmint`) + ` ${title}`);
};

const step = (msg: string) => {
  console.log(chalk.gray('  ·') + ' ' + msg);
};

const success = (msg: string) => {
  console.log(chalk.green('  ✓') + ' ' + msg);
};

const warn = (msg: string) => {
  console.log(chalk.yellow('  ⚠') + ' ' + msg);
};

const error = (msg: string) => {
  console.log(chalk.red('  ✗') + ' ' + msg);
};

const info = (msg: string) => {
  console.log(chalk.blue('  ℹ') + ' ' + msg);
};

const deprecated = (framework: string, suggestion: string) => {
  console.log(chalk.yellow(`  ⚠ ${framework} is in maintenance mode. Consider ${suggestion}.`));
};

const conflict = (a: string, b: string, resolution: string) => {
  console.log(chalk.keyword('orange')(`  ⚡ Conflict: ${a} + ${b} — ${resolution}`));
};

const section = (label: string) => {
  console.log(chalk.dim(`  ─ ${label} `));
};

export const log = { intro, step, success, warn, error, info, deprecated, conflict, section };