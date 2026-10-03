# Connecting Reviso to an agent

Send the user here when Reviso tools are not available in their session. Do not
try to improvise a connection, and do not silently fall back to the command line.
Connecting is the user's decision.

## Preferred: the hosted connector

The shortest path, and the only one that works in hosts without a local shell.

1. Open the Reviso agent setup page at the product origin, under `/developers/mcp`.
2. Follow the connection flow for the client being used. The user authorizes
   access in the browser; no key is copied by hand.
3. Reload or restart the client session so the new tools load.

Once connected, the Reviso tools appear in the session and the main skill takes
over again.

## Fallback: a local server

Only for hosts that require a locally launched server. This path needs a package
install, a workspace-scoped credential, and a session restart, so prefer the
hosted connector when the host supports it.

The user needs three values, which they supply through the client's own private
environment, never through chat:

- the Reviso origin
- a workspace-scoped automation key
- the workspace id, when the key is not already scoped to one

A local server definition looks like this:

```json
{
  "mcpServers": {
    "reviso": {
      "command": "python3",
      "args": ["-m", "reviso", "mcp"],
      "env": {
        "REVISO_SERVER": "<origin>",
        "REVISO_AUTOMATION_KEY": "<from the environment>"
      }
    }
  }
}
```

The generated key must be scoped to the workspace the drafts belong in. Ask the
user to create it in Reviso's workspace settings; never ask them to paste it into
the conversation.

## What to tell the user

Keep it short and specific:

- Which of the two paths applies to their client.
- That the connection needs a restart of the agent session to take effect, if it
  does. Do not promise that tools appear immediately.
- That a key is required and where to create one, without asking for its value.
- That you will publish the draft as soon as the tools are available.

Then stop and wait. Do not start a parallel local workflow that the user did not
ask for.

## If it still does not work

| Symptom | What to check |
| --- | --- |
| Tools do not appear after connecting | The client session was not restarted, or the connector was not saved. |
| Tools appear, every call fails | The credential is missing, expired, or scoped to a different workspace. |
| Calls succeed but the document list is empty | The key is scoped to a workspace the user did not expect. |
| A document was created somewhere unexpected | The key's workspace scope, not the document. Nothing was lost; it can be moved or deleted. |

Run `reviso doctor --json` if the command line is available; it checks the server,
the credential, and the workspace reachability together.
