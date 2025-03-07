import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

fs.mkdirSync(path.join('public', 'build'), { recursive: true });

const commands = [
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'restaurantPage', 'restaurantPage.hbs')} -f ${path.join('public', 'build', 'restaurantPage.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'restaurantList', 'restaurantList.hbs')} -f ${path.join('public', 'build', 'restaurantList.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'loginPage', 'loginPage.hbs')} -f ${path.join('public', 'build', 'loginPage.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'registerPage', 'registerPage.hbs')} -f ${path.join('public', 'build', 'registerPage.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'header', 'header.hbs')} -f ${path.join('public', 'build', 'header.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'auxHeader', 'auxHeader.hbs')} -f ${path.join('public', 'build', 'auxHeader.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'button', 'button.hbs')} -f ${path.join('public', 'build', 'button.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'logo', 'logo.hbs')} -f ${path.join('public', 'build', 'logo.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'restaurantCard', 'restaurantCard.hbs')} -f ${path.join('public', 'build', 'restaurantCard.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'input', 'input.hbs')} -f ${path.join('public', 'build', 'input.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'form__input', 'form__input.hbs')} -f ${path.join('public', 'build', 'form__input.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'form__line', 'form__line.hbs')} -f ${path.join('public', 'build', 'form__line.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'form.hbs')} -f ${path.join('public', 'build', 'form.js')}`,
];

commands.forEach((cmd) => execSync(cmd, { stdio: 'inherit', shell: true }));
