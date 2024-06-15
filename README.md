# Fragments Project

## Project Description

The `fragments` project is designed to provide a robust back-end API for managing data transactions with high efficiency and reliability. This server is built using Node.js and Express, leveraging modern development practices for optimal performance.

## Running the Server

To run the server, you can use different commands depending on your development needs:

- **Start Script**: npm start

Runs the server normally without any development tools.

- **Development Mode**: npm run dev

Uses `nodemon` to automatically restart the server when changes are detected in the source code.

- **Debug Mode**: npm run debug

Runs the server with Node Inspector enabled, allowing for real-time debugging through VSCode or any compatible debugger.

## ESLint Setup

To ensure code quality and consistency, ESLint is configured with the following steps:

1. Initialize ESLint configuration: npm init @eslint/config@latest

Follow the prompts to select the appropriate configurations for your project environment.

✔ How would you like to use ESLint? · problems  
✔ What type of modules does your project use? · commonjs  
✔ Which framework does your project use? · none  
✔ Does your project use TypeScript? · javascript  
✔ Where does your code run? · node  
The config that you've selected requires the following dependencies:

globals, @eslint/js, eslint  
✔ Would you like to install them now? · No / Yes (Select Yes)  
✔ Which package manager do you want to use? · npm

2. The `eslint.config.mjs` file is set up as follows:

```js
import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  pluginJs.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.commonjs,
        ...globals.es2021,
        ...globals.node,
      },
    },
  },
];
```

3. Add the lint script to your package.json: script: { "lint": "eslint --config eslint.config.mjs \"./src/\*_/_.js\"" }

## Testing

- **Lint Script**: npm run lint

Use curl to test the API. On Windows, remember to use curl.exe to avoid conflicts with PowerShell aliases: curl.exe localhost:8080

4. Connect Ec2 ssh -i "~/.ssh/dps955-key-pair.pem" ec2-user@ec2-3-94-166-221.compute-1.amazonaws.com from .ssh location
5. Sending file from fragments: pscp -i ~/.ssh/dps955-key-pair.pem Filename ec2-user@ec2-3-94-166-221.compute-1.amazonaws.com:package/Dockerfile,
