**Bootstrapping new projects comes with some friction.** Even if it only takes a
couple of commands, taking the time to come up with a project name or waiting
for packages to install can disrupt your flow.

If you regularly create scratchpad projects using the same template, it's
helpful to have an empty project ready to go.

That's what `nextpage` does: it pre-bootstraps a _spare_ project for you, so
it's ready when you need it. You can start working while another spare project
is bootstrapped in the background.

## Gettings Started

Install globally from npm:

```
npm install -g nextpage
pnpm install -g nextpage
yarn install -g nextpage
```

Add a `.nextpage` subdirectory to the directory where you store your scratchpad
projects. This directory will hold your project template, which can be either a
directory or a file.

```
.nextpage
└ template
  └ ...project files...
```

```
.nextpage
└ template.ext
```

The template directory must be named `template`. Template files may have an
optional extension.

## Open and Prepare Scripts

Add the `open` script to open your bootstrapped project immediately in your
editor of choice. Add `config.json` to the `.nextpage` subdirectory:

```
.nextpage
├ config.json
└ template
  └ ...project files...
```

In `config.json`:

```json
{
  "open": "code $NEXTPAGE"
}
```

The bootstrapped project's randomly generated name is passed to the script via
the `$NEXTPAGE` environment variable. The command in the above example opens the
project in vscode.

Add `prepare` script to run bootstrap commands:

```json
{
  "open": "code $NEXTPAGE",
  "prepare": "npm install"
}
```

Since bootstrap commands are executed in advance, a randomly named spare project
is always prepared in advance.

## Bootstrapping

Running the `nextpage` command does two things:

1. It opens the _spare_ project using the `open` script.
2. It bootstraps another _spare_ project by copying the template and running the
   `prepare` script.

When the project template is copied, a random name is assigned to the project.
This name is made available to the `prepare` script via the `$NEXTPAGE`
environment variable.

If the template is a file, it is copied with a random name, but its extension is
preserved.

When you run the `nextpage` command for the first time, it prepares two projects
for you: one to open immediately and one spare:

```
your-dir
├ .nextpage
| ├ config.json
| └ template
| └ ...project files...
└ stupid-banks-dance (opened as soon as ready)
| └ ...project files...
└ big-aliens-call (spare)
  └ ...project files...
```

During subsequent runs, the spare project opens immediately and the new project
is bootstrapped in the background.

## How Scripts Are Executed

When the `open` and `prepare` scripts are executed, the current working
directory (cwd) is set to the directory containing the `.nextpage` subdirectory.

If the template is a directory, then the working directory (cwd) is set to the
spare project directory.

In any case, the `$NEXTPAGE` environment variable contains the randomly
generated name of the spare project.

The `nextpage` command always looks for the closest parent directory with a
`.nextpage` subdirectory.
