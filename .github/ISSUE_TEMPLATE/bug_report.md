---
name: Bug report
about: Create a report to help Retrom improve
title: "[Bug]"
labels: bug
assignees: ''

---

# Before Filing A Bug Report

Please be certain that this is in fact a bug that you are reporting, and -- to the best of your knowledge -- not a user error. **This issue tracker is not for support related discussion**. Please start such discourse in the [Retrom discord server](https://discord.gg/tM7VgWXCdZ) or the [discussions section](https://github.com/JMBeresford/retrom/discussions).

If your issue(s) have arisen after a recent update to Retrom ( particularly for major version updates ), please make sure you have followed any relevant steps in the respsective [migration guide(s)](https://github.com/JMBeresford/retrom/wiki/Migration-Guides)

### Describe the bug

A clear and concise description of what the bug is.

### Steps To Reproduce

Steps to reproduce the behavior:

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

### Expected behavior

A clear and concise description of what you expected to happen.

### Screenshots

If applicable, add screenshots to help explain your problem.

### Environment (please complete the following information _where applicable_)

- OS: [e.g. macOS]
- Browser [e.g. chrome, safari]
- Version [e.g. 22]
- Docker compose file or similar

### Configurations

Please provide both server and client configurations, either via screenshot of the config in the client or by copying the contents of the files.

See the [config file docs](https://github.com/JMBeresford/retrom/wiki/Config-Files) for more information, such as file locations etc

### Logs

Please attach any relevant logs from docker containers, browser console etc

Client logs will be in OS-dependant locations:

- Windows: `$APP_DATA/roaming/com.retrom.app/logs` or `$APP_DATA/local/com.retrom.app/logs`
- MacOS: `$HOME/Library/Logs/com.retrom.app`
- Linux: `$XDG_CONFIG_HOME/com.retrom.app/logs` or `$HOME/.config/com.retrom.app/logs`

### Additional context

Add any other context about the problem here.
