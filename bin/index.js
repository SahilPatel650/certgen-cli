#!/usr/bin/env node
//writes a functiont that generates and renews a certificate using certbot

import chalk from 'chalk';
import isElevated from "is-elevated";
import inquirer from 'inquirer';
import { exec } from 'child_process';
var action;

async function privlageCheck() {
    //make sure the user is the root user 
    if (await isElevated()) {
        console.log(chalk.green("You are root, continuing..."));
        //console.log(true);
    }
    else {
        console.log(chalk.red("Must be root to run this script"));
        process.exit();
    }
}

async function ask() {
    //asks the user if they want to generate a new certificate or renew an existing one
    const questions = await inquirer
    .prompt({
        name: 'Select action',
        type: 'list',
        choices: [
            'Generate a new certificate',
            'Renew an existing certificate'
        ],
    })
    .then(answers => {
        if (answers['Select action'] === 'Generate a new certificate') {
            action = "generate";
        } else {
            action = "renew";
        }
    });

}

async function generateCertificate() {
    //ask for the domain name
    const questions = await inquirer
    .prompt({
        name: 'Domain name',
        type: 'input',
        message: 'Enter the domain name you want to generate a certificate for:',
        validate: function(value) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter a domain name';
            }
        }
    })
    .then(answers => {
        var domain = answers['Domain name'];
        const myShellScript = exec('sudo bash ./bin/generate.sh ' + domain);
        myShellScript.stdout.on('data', (data)=>{
            console.log(data); 
        // do whatever you want here with data
        });
        myShellScript.stderr.on('data', (data)=>{
            console.error(data);
        });
    });
}

async function renewCertificate() {
    const myShellScript = exec('sudo bash ./bin/renew.sh');
    myShellScript.stdout.on('data', (data)=>{
        console.log(data); 
    // do whatever you want here with data
    });
    myShellScript.stderr.on('data', (data)=>{
        console.error(data);
    });
}



//var action = await ask();
await privlageCheck();

await ask();

if (action === 'generate') {
    await generateCertificate();
}
else if (action === 'renew') {
    await renewCertificate();
}
else {
    console.log(chalk.red('Invalid action'));
}

