# Testing and Verification

## Verified state

No application tests, test framework, test scripts, or CI checks exist. There are no application test commands to run.

## Documentation verification

Check that expected files exist, local Markdown links resolve, placeholders accurately describe the empty application state, and no secrets or unsupported implementation claims are included.

## Proposed application strategy

After stack selection, define runnable checks alongside the first workflow. Test business rules at unit level, integration boundaries with appropriate fixtures, and critical user journeys where relevant. Include error cases and authorization checks when those features exist.

Document exact setup, commands, fixture requirements, and expected outcomes after verification. Report a check as unrun when its tools or required environment are unavailable.
