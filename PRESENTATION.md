# Organization Browser — Prototype Presentation

> **Live prototype:** https://sfc-gh-jilee.github.io/organization-browser/

## What This Is

A multi-column browser for managing the organizational hierarchy of **Accounts**, **User Groups**, and **Org Users** in Snowflake. The UI uses a linked-column pattern (similar to macOS Finder or Miller columns) where selecting items in one column reveals related items in adjacent columns.

---

## Key User Journeys

### 1. Orientation — "What does my org look like?"

A new ORGADMIN opens the page and immediately sees three columns: Accounts, User Groups, and Org Users. Each column shows item counts in the search placeholder. The admin can scroll through hundreds of items efficiently (virtual scroll handles 500+ items). Hovering over any item shows a popover with details. The list/table view toggle per column lets users switch between a compact card view and a detailed table view with sortable columns.

### 2. Relationship Discovery — "Who belongs where?"

Clicking any item highlights its upstream and downstream relationships across columns. For example, selecting a User Group highlights its parent Accounts on the left and its member Users on the right. The selection header shows contextual counts ("In 5 accounts · 561 users"). Related items float to the top of their columns for easy scanning.

This answers questions like *"Which accounts does this group have access to?"* without navigating away.

### 3. Comparison / Troubleshooting — "Do these users share the same access?"

When multiple items are selected (via checkboxes in table view, Cmd+click, or Shift+click for range select), the highlight mode dropdown appears. Toggling from **"Showing all related"** to **"Showing in common"** switches from union to intersection highlighting. The counts update live ("In 1 group · In 5 accounts in common").

This directly supports auditing: *"These 3 users should have identical group membership — do they?"*

### 4. Assignment — "Add users to a group"

Drag-and-drop between columns lets admins assign entities. Select one or more users, drag them onto a User Group, and a confirmation toast appears. Multi-select drag is supported — the ghost element shows the count of items being moved.

This makes the setup journey (*"create an org user and add it to a group"*) feel direct and spatial rather than form-driven.

### 5. Filtering & Search — "Find a specific user or group"

Each column has its own search box with focused state and clear button. Column-level filter menus support sorting by multiple attributes (name, creation date, user count, etc.) and filtering to show unassigned items.

This directly supports the troubleshooting journey — *"find users with no group assignment"* is one click.

### 6. Flexible Layout — "I only care about users and groups right now"

The column visibility toggle lets admins hide/show columns. The Create button dynamically updates based on the rightmost visible column ("Create Account" vs "Create User group" vs "Create Org user"). This keeps the interface focused on the task at hand.

---

## Why This Design Works

| Principle | How it applies |
|---|---|
| **Spatial model matches the mental model** | The left-to-right hierarchy (Accounts → Groups → Users) mirrors how admins think about org structure. Highlighting relationships across columns makes invisible connections visible without navigation. |
| **Progressive disclosure** | Default list view is scannable and compact. Table view is available per-column when detail is needed. Popovers on hover provide detail without commitment. Filter/sort menus are tucked away but accessible. |
| **Direct manipulation** | Drag-and-drop for assignment, click-to-select, checkbox for multi-select in tables — familiar patterns that reduce the distance between intent and action. |
| **Scales gracefully** | Virtual scrolling handles large datasets without performance degradation. Column visibility keeps the UI from feeling overwhelming when only a subset of the hierarchy is relevant. |
| **Union vs. intersection comparison** | Selecting multiple users and instantly seeing what they share (or don't) is a workflow that typically requires exporting to a spreadsheet. Having it built-in dramatically shortens the troubleshooting loop. |

---

## Column Browser vs. Graph UI (Lineage-Style) — Comparison

Two primary UI patterns were considered for visualizing org hierarchy: the **column browser** (this prototype) and a **graph/lineage UI** (node-and-edge diagram). Here's how they compare across the key user tasks.

### At a glance

| Dimension | Column Browser | Graph / Lineage UI |
|---|---|---|
| **Mental model** | List-based, tabular — familiar to admins who work in tables and spreadsheets | Network-based, spatial — intuitive for understanding topology |
| **Scalability** | Handles 500+ items per column via virtual scroll; columns stay manageable | Becomes visually cluttered beyond ~50 nodes; requires aggressive filtering or clustering |
| **Bulk operations** | Native: multi-select, checkbox, Shift+click range, drag-and-drop | Difficult: selecting many nodes in a graph is imprecise; drag-and-drop is ambiguous |
| **Relationship clarity** | Implicit via column position + highlighting; works well for strict hierarchies | Explicit via edges; excels at showing many-to-many and circular relationships |
| **Search & filter** | Per-column search and filter menus feel natural | Filtering a graph often means hiding nodes, which breaks spatial memory |
| **Data density** | High — table view shows multiple attributes per row in a compact space | Low — each node takes significant screen space; attributes require hover/click |
| **Sorting** | Full sort support per column (name, date, count, etc.) | No natural sort order in a graph; layout is algorithmic |
| **Assignment workflows** | Drag between columns is directional and clear | Drag-to-connect exists but direction is ambiguous without explicit affordances |
| **Comparison (union/intersection)** | Built-in via highlight modes with counts | Possible but visually noisy — overlapping edge highlights are hard to parse |
| **Learning curve** | Low — looks like a file browser or spreadsheet | Medium — requires understanding node/edge conventions |

### Where column browser wins

- **Day-to-day admin tasks.** Creating, assigning, and auditing users/groups are list-oriented tasks. Admins think in terms of "show me all users in this group" not "show me the network topology." The column browser matches this workflow directly.

- **Bulk operations at scale.** Selecting 20 users and dragging them to a group is straightforward in a list. In a graph, it requires lasso-select or Cmd+clicking scattered nodes, then finding the target node to connect to.

- **Data density and comparison.** Table view can show 30+ rows with multiple columns of metadata on screen. A graph showing 30 nodes with edges is already visually complex. The union/intersection toggle provides structured comparison that a graph would show as overlapping edge bundles.

- **Filtering to "unassigned" items.** One click shows all users with no group. In a graph, unconnected nodes are scattered and easy to miss.

### Where graph UI wins

- **Complex many-to-many visualization.** If a user belongs to 5 groups across 3 accounts, a graph makes all those connections simultaneously visible as edges. The column browser requires clicking each entity to see its connections one at a time.

- **Topology questions.** "Are there isolated clusters?" "Is there a single point of failure group that all users depend on?" These structural questions are immediately visible in a graph layout but require multiple interactions in a column browser.

- **Cross-hierarchy relationships.** If the data model expands beyond a strict 3-level hierarchy (e.g., roles, policies, warehouses), a graph can accommodate arbitrary relationship types. The column browser is optimized for the current 3-column hierarchy.

- **Storytelling and presentations.** A graph visualization of "here's how our org is structured" is more visually compelling for stakeholder presentations than a screenshot of three columns.

### Recommendation

The **column browser is the right choice for the primary admin interface** — it optimizes for the P0 tasks (orientation, setup, and day-to-day management) at the scale admins actually work with (hundreds to thousands of entities).

A **graph view could be a complementary "Visualize" mode** accessed from a toggle or a separate tab — useful for ad-hoc exploration and presentations, but not the primary workspace. This avoids forcing admins to learn a graph paradigm for routine tasks while still offering the topology insights when needed.

---

## What Can Be Improved

### Empty state (Day 1 experience)

The prototype assumes populated data. For a new org with zero accounts/groups/users, we need an empty state that guides admins through initial setup — likely a prominent "Create your first..." CTA with contextual guidance.

### Bulk operations beyond drag-and-drop

The action bar shows context-dependent buttons (Unassign, etc.) but more bulk operations could be surfaced — bulk delete, bulk role change, export selection. The overflow menu pattern is already in place to accommodate this.

### Undo / confirmation for destructive actions

Drag-and-drop assignment shows a toast, but there's no undo. For unassign or delete operations, a confirmation dialog or undo toast would reduce risk.

### Keyboard navigation

Tab/arrow-key navigation within and between columns isn't fully implemented. For power users managing hundreds of entities, keyboard shortcuts (e.g., Cmd+A to select all, Delete to unassign) would significantly speed up workflows.

### Accessibility

Screen reader support for the relationship highlighting, drag-and-drop, and the union/intersection toggle needs attention. ARIA live regions for the dynamic count updates would help.

### Deep linking / shareable state

Currently, selection and filter state isn't reflected in the URL. An admin can't share a link like *"here are the 3 unassigned users I found"* with a colleague.

### Visual distinction for intersection mode

When "Showing in common" is active, highlighted items could use a visually distinct treatment (e.g., a different highlight color or an icon badge) to reinforce that the view is filtered. The text suffix alone may not be prominent enough.

### Side panel detail view

The side panel exists but could be enriched with a full detail view for the selected item — showing all properties, audit history, and direct edit capabilities without navigating to a separate page.
