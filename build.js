import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

fs.mkdirSync(path.join('public', 'build'), { recursive: true });

const commands = [
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'restaurantPage', 'restaurantPage.hbs')} -f ${path.join('public', 'build', 'restaurantPage.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'restaurantList', 'restaurantList.hbs')} -f ${path.join('public', 'build', 'restaurantList.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'pages', 'authPage', 'authPage.hbs')} -f ${path.join('public', 'build', 'authPage.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'header', 'header.hbs')} -f ${path.join('public', 'build', 'header.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'auxHeader', 'auxHeader.hbs')} -f ${path.join('public', 'build', 'auxHeader.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'button', 'button.hbs')} -f ${path.join('public', 'build', 'button.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'logo', 'logo.hbs')} -f ${path.join('public', 'build', 'logo.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'restaurantCard', 'restaurantCard.hbs')} -f ${path.join('public', 'build', 'restaurantCard.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'formInput', 'formInput.hbs')} -f ${path.join('public', 'build', 'formInput.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'formLine', 'formLine.hbs')} -f ${path.join('public', 'build', 'formLine.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'form', 'form.hbs')} -f ${path.join('public', 'build', 'form.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'select', 'select.hbs')} -f ${path.join('public', 'build', 'select.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'loginForm', 'loginForm.hbs')} -f ${path.join('public', 'build', 'loginForm.js')}`,
  `npx handlebars -m ${path.join('public', 'src', 'components', 'registerForm', 'registerForm.hbs')} -f ${path.join('public', 'build', 'registerForm.js')}`,
];

commands.forEach((cmd) => execSync(cmd, { stdio: 'inherit', shell: true }));
