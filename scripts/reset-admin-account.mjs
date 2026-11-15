import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { config as loadDotEnv } from 'dotenv';
import { existsSync } from 'node:fs';
import { stdin, stdout } from 'node:process';
import { emitKeypressEvents } from 'node:readline';
import { createInterface as createPrompts } from 'node:readline/promises';
import { resolve } from 'node:path';

async function ask(question) {
  const prompts = createPrompts({ input: stdin, output: stdout });
  try {
    return await prompts.question(question);
  } finally {
    prompts.close();
  }
}

function askHidden(question) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal so passwords stay hidden.');
  }

  emitKeypressEvents(stdin);
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolveAnswer, reject) => {
    let value = '';

    const finish = () => {
      stdin.removeListener('keypress', onKeypress);
      stdin.setRawMode(false);
      stdout.write('\n');
    };

    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        finish();
        reject(new Error('Reset cancelled.'));
      } else if (key.name === 'return' || key.name === 'enter') {
        finish();
        resolveAnswer(value);
      } else if (key.name === 'backspace') {
        value = value.slice(0, -1);
      } else if (character && !key.ctrl && !key.meta) {
        value += character;
      }
    };

    stdin.on('keypress', onKeypress);
  });
}

function validatePassword(password) {
  const meetsRequirements =
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!meetsRequirements) {
    throw new Error(
      'Password must be at least 12 characters and include uppercase, lowercase, a number, and a special character.',
    );
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('Password must be 72 bytes or fewer.');
  }
}

async function main() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    throw new Error('Run this command from the project folder containing .env.local.');
  }

  const { error: envError } = loadDotEnv({ path: envPath, override: true });
  if (envError) throw envError;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required in .env.local.');
  }

  const supabase = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`Supabase project: ${supabaseUrl}`);
  console.log('Verify this is the intended project before continuing.');

  const { data: admins, error: adminsError } = await supabase
    .from('admin_users')
    .select('id, email, password_hash, password_history');

  if (adminsError) throw new Error(`Could not read admin accounts: ${adminsError.message}`);

  const adminAccounts = admins ?? [];
  const isFirstAdmin = adminAccounts.length === 0;
  let admin;
  if (isFirstAdmin) {
    console.log('No admin accounts found. This will create the first admin account.');
  } else if (adminAccounts.length === 1) {
    [admin] = adminAccounts;
    console.log(`Admin account: ${admin.email}`);
  } else {
    adminAccounts.forEach((account, index) => console.log(`${index + 1}. ${account.email}`));
    const selection = Number(await ask('Choose the account number to reset: '));
    if (!Number.isInteger(selection) || selection < 1 || selection > adminAccounts.length) {
      throw new Error('Invalid account selection.');
    }
    admin = adminAccounts[selection - 1];
  }

  const emailPrompt = isFirstAdmin ? 'Admin email: ' : `New admin email [${admin.email}]: `;
  const enteredEmail = (await ask(emailPrompt)).trim();
  const newEmail = (enteredEmail || admin?.email || '').toLowerCase();
  if (
    newEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)
  ) {
    throw new Error('Enter a valid email address.');
  }

  if (adminAccounts.some((account) => account.id !== admin?.id && account.email.toLowerCase() === newEmail)) {
    throw new Error('Another admin account already uses that email.');
  }

  const password = await askHidden('New password (input hidden): ');
  const confirmation = await askHidden('Confirm new password (input hidden): ');
  if (password !== confirmation) throw new Error('Passwords do not match.');
  validatePassword(password);

  const passwordHistory = admin && Array.isArray(admin.password_history)
    ? admin.password_history.filter((hash) => typeof hash === 'string')
    : [];
  if (admin) {
    for (const oldHash of [admin.password_hash, ...passwordHistory.slice(0, 3)]) {
      if (await bcrypt.compare(password, oldHash)) {
        throw new Error('Choose a password that is not one of the last three passwords.');
      }
    }
  }

  console.log(`\n${isFirstAdmin ? 'First admin account' : `Account to update: ${admin.email}`}`);
  console.log(`New login email: ${newEmail}`);
  const confirmationWord = isFirstAdmin ? 'CREATE' : 'RESET';
  if ((await ask(`Type ${confirmationWord} to continue: `)) !== confirmationWord) {
    throw new Error('Reset cancelled.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const updatedAt = new Date().toISOString();
  if (isFirstAdmin) {
    const { error: insertError } = await supabase.from('admin_users').insert({
      email: newEmail,
      password_hash: passwordHash,
      password_history: [passwordHash],
      last_password_change: updatedAt,
      name: 'Admin',
      role: 'admin',
    });
    if (insertError) throw new Error(`Could not create the first admin account: ${insertError.message}`);
  } else {
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({
        email: newEmail,
        password_hash: passwordHash,
        password_history: [passwordHash, admin.password_hash, ...passwordHistory].slice(0, 3),
        last_password_change: updatedAt,
      })
      .eq('id', admin.id);

    if (updateError) throw new Error(`Could not update the admin account: ${updateError.message}`);
  }

  console.log(
    `${isFirstAdmin ? 'First admin account created' : 'Admin account updated'}. Sign in with ${newEmail} and your new password.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Admin account reset failed.');
  process.exitCode = 1;
});
