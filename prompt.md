# ✅ ENHANCED MASTER PROMPT — WhatsApp Flow Builder Platform

## 🎯 OVERVIEW
Production-ready WhatsApp Flow Builder platform with visual flow creation, execution engine, and session management. TypeScript-only, MongoDB-backed, React Flow-based builder.

---

## 🧠 TECH STACK

**Frontend:** React + Vite, TypeScript only, Tailwind v4, shadcn UI, React Flow, Redux Toolkit, Axios, React Router

**Backend:** Node.js, Express.js, TypeScript only, MongoDB, Mongoose ORM only

**Constraints:** No Redis, No PostgreSQL, MongoDB only

---

## 🧾 TYPESCRIPT RULES

- **Interfaces:** Prefix with `I` (e.g., `IUser`)
- **Types:** Prefix with `T` (e.g., `TUserRole`)
- **No `any` allowed** - use `unknown` with type guards
- Apply strict typing to: DB models, API interfaces, services, flow nodes, sessions, Redux store

---

## 🔐 AUTH & ROLES

### Admin Role
- **Single admin:** `admin@gmail.com` / `123456`
- Capabilities: View all users, bots, flows, analytics (monitoring only)
- Cannot create bots or edit flows

### User Role  
- **Multiple users allowed:** Default user `abhi@gmail.com` / `123456`
- Capabilities: Create bots, build flows, test in dev mode, connect WhatsApp, deploy to production
- User isolation: Can only see own bots and data

**Authentication:** Email/password, JWT tokens, bcrypt hashing (min 10 rounds), 24h token expiration

---

## 🌱 DATABASE SEEDING (MANDATORY)

Create two default users on first setup:
1. **Admin:** `admin@gmail.com` / `123456` / ADMIN role
2. **User:** `abhi@gmail.com` / `123456` / USER role

Requirements:
- Hash passwords before storage
- Idempotent seed script (no duplicates)
- Runnable via `npm run seed`
- Console feedback on success/skip

---

## 📡 WHATSAPP INTEGRATION

**One-to-One Mapping:**
- Each bot → exactly one WhatsApp account
- WhatsApp credentials stored at bot level
- Credentials: Phone Number ID, Business Account ID, Access Token

**Integration Flow:**
1. User creates bot (no WhatsApp needed)
2. User builds/tests flows in dev mode
3. User connects WhatsApp in bot settings
4. System validates credentials
5. User deploys to production
6. Webhook routes messages to bot via phone number

**Message Routing:** Webhook payload → find bot by recipient phone → load flow → create/retrieve session → execute flow

---

## 🤖 OPENAI INTEGRATION

**User-Level Integration:**
- One user → one OpenAI API key
- All user's bots share same credentials
- Stored in `OpenAIAccounts` table
- Encrypted (AES-256) before storage

**Integration Flow:**
1. User enters API key in settings
2. System validates with test call
3. All AI nodes use this key
4. If missing, AI nodes fail with clear error

---

## 🤖 BOT STRUCTURE

```
User (1)
 ├── OpenAI Credentials (1) ← Shared across all bots
 └── Bots (Many)
       ├── WhatsApp Account (1) ← One per bot
       └── Flows (Many)
             ├── Flow Versions (Many) ← Draft + Production
             └── Sessions (Many) ← Per WhatsApp user
                   ├── Messages (Many)
                   └── Variables (Many)
```

**Key Relationships:**
- User can create unlimited bots
- Each bot has one WhatsApp account
- Each flow has draft and production versions
- Sessions identified by: botId + userPhoneNumber
- Session variables isolated (no cross-session leakage)

---

## ⭐ FLOW BUILDER (CORE MODULE)

### Technology: React Flow Library

### Canvas Features (All Required)

**Navigation:**
- Infinite canvas (no boundaries)
- Mouse wheel zoom (25%-200%)
- Click-drag to pan (Space + drag alternate)
- Dot/line grid background (20px intervals, subtle)
- Grid snapping (10px tolerance, toggleable)

**Node Manipulation:**
- Drag from Node Library to canvas
- Click-drag to reposition (with snap)
- Single/multi-select (Ctrl+click, drag rectangle)
- Delete (Del/Backspace key)
- Duplicate (Ctrl+D)
- Copy/paste (Ctrl+C/V)
- Node grouping support (select multiple nodes → group into container; not required in MVP but architecture must support future grouping)

**Edge Management:**
- Drag from output → input handle
- Validate connections (Start: 1 out, End: 0 out)
- Click to select, Del to remove
- Reconnect by dragging handles
- Visual styling (animated for active paths)

**Productivity:**
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z, 50 action stack)
- Keyboard shortcuts (Ctrl+S save, Ctrl+F search, Escape deselect)
- Auto-save every 30s
- Search nodes (Ctrl+F)
- Mini-map navigator (bottom-right, toggleable)

**Performance:**
- Smooth with 100+ nodes
- Node virtualization (render visible only)
- Throttle pan/zoom events
- Debounce auto-save

---

### Builder Panels

**1. Node Library Panel (Left):**
- Fixed width 250-300px, collapsible
- Categorized nodes:
  - **Messaging:** Message, Button, Input
  - **Logic:** Condition, Loop  
  - **Integration:** API, AI
  - **Flow Control:** Start, End, Delay
- Draggable cards with icons
- Search filter

**2. Canvas Panel (Center):**
- Main workspace
- Top toolbar: Save, Undo, Redo, Zoom, Grid toggle, Deploy
- Bottom status: Node count, Zoom level, Last saved time

**3. Node Settings Panel (Right):**
- Fixed width 300-400px, collapsible
- Shows config for selected node
- Common fields: Node ID (read-only), Label, Description
- Node-specific fields (detailed below)
- Real-time validation
- Action buttons: Delete, Duplicate

---

### REQUIRED NODE TYPES (10 Total)

#### 1. START NODE
- **Purpose:** Flow entry point (only one allowed per flow)
- **Visual:** Green circle, play icon
- **Handles:** 0 inputs, 1 output
- **Config:** None (fixed behavior)
- **Execution:** Immediately go to next node
- **Validation:** Enforce single Start node per flow

---

#### 2. MESSAGE NODE
- **Purpose:** Send text WhatsApp message
- **Visual:** Blue rectangle, message icon
- **Handles:** 1 input, 1 output
- **Config Fields:**
  - Message Content (multi-line, max 4096 chars)
  - Variable injection: `{{variableName}}`
  - Emoji picker
  - Preview with variable placeholders
- **Execution:** Replace variables → Send via WhatsApp API → Log message → Go to next node
- **Validation:** Content cannot be empty

**Example Config:**
```json
{
  "nodeType": "MESSAGE",
  "messageContent": "Hello {{userName}}! Your order #{{orderId}} is confirmed.",
  "nextNodeId": "btn_001"
}
```

---

#### 3. BUTTON NODE
- **Purpose:** Send interactive WhatsApp buttons, wait for click
- **Visual:** Purple rectangle, button icon
- **Handles:** 1 input, multiple outputs (one per button)
- **Config Fields:**
  - Message Text (optional, above buttons)
  - Buttons (1-3 max):
    - Label (max 20 chars)
    - Button ID (auto-generated)
    - Next Node (dropdown)
    - Store Response In Variable (optional)
  - Fallback:
    - Fallback Message (if user texts instead)
    - Fallback Next Node
- **Execution:** Send interactive message → Pause → On button click: store ID in variable, go to mapped next node → On text: fallback
- **Validation:** 1-3 buttons, each has label and next node

**Visual Mapping:** Each button has own output handle labeled with button text

**Example Config:**
```json
{
  "nodeType": "BUTTON",
  "messageText": "How can we help?",
  "buttons": [
    {"buttonId": "btn_sales", "label": "Sales", "nextNodeId": "msg_sales", "storeIn": "department"},
    {"buttonId": "btn_support", "label": "Support", "nextNodeId": "msg_support", "storeIn": "department"}
  ],
  "fallback": {"message": "Please click a button", "nextNodeId": "btn_001"}
}
```

---

#### 4. INPUT NODE
- **Purpose:** Wait for user text input, validate, store in variable
- **Visual:** Orange rectangle, keyboard icon
- **Handles:** 1 input, 2 outputs (success, failure)
- **Config Fields:**
  - Prompt Message (required)
  - Input Type: Text, Number, Email, Phone, Custom Regex
  - Validation:
    - Min/Max Length
    - Regex Pattern (if custom)
  - Variable Name (where to store)
  - Retry Config:
    - Max Retries (default 3)
    - Retry Message
    - Failure Next Node (after max retries)
  - Success Next Node
- **Execution:** Send prompt → Pause → Validate input → If valid: store in variable, go to success node → If invalid: retry or go to failure node
- **Validation:** Prompt and variable name required

**Type-Specific Validation:**
- **Email:** Regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- **Phone:** Regex `^\+?[1-9]\d{1,14}$`
- **Number:** Parse as number, check min/max

**Example Config:**
```json
{
  "nodeType": "INPUT",
  "promptMessage": "Please enter your email:",
  "inputType": "EMAIL",
  "variableName": "userEmail",
  "retryConfig": {"maxRetries": 3, "retryMessage": "Invalid email. Try again.", "failureNextNodeId": "end_error"},
  "successNextNodeId": "msg_confirmed"
}
```

---

#### 5. CONDITION NODE
- **Purpose:** Branch logic based on variables or keywords
- **Visual:** Yellow diamond, branch icon
- **Handles:** 1 input, multiple outputs (one per branch + default)
- **Config Fields:**
  - Condition Type: Keyword Match, Variable Comparison, Logical Expression
  - Branches (each has):
    - Label
    - Expression
    - Next Node
  - Default Branch (required)
  
**Expression Types:**
- **Keyword:** Check if message contains keywords (any/all/exact, case sensitive option)
- **Variable Comparison:** Operators: ==, !=, >, <, >=, <=, contains, starts with, ends with
- **Logical:** Combine with AND/OR: `{{age}} > 18 AND {{country}} == "USA"`

- **Execution:** Evaluate branches top-to-bottom → First true → Go to branch's next node → If none match → Go to default
- **Validation:** At least 1 branch, default branch required

**Example Config:**
```json
{
  "nodeType": "CONDITION",
  "branches": [
    {"label": "Premium", "expression": "{{userTier}} == 'premium'", "nextNodeId": "msg_premium"},
    {"label": "Regular", "expression": "{{userTier}} == 'regular'", "nextNodeId": "msg_regular"}
  ],
  "defaultBranch": {"nextNodeId": "msg_default"}
}
```

---

#### 6. DELAY NODE
- **Purpose:** Pause execution for specified duration
- **Visual:** Gray rectangle, clock icon
- **Handles:** 1 input, 1 output
- **Config Fields:**
  - Delay Duration (number)
  - Delay Unit: Seconds, Minutes, Hours
- **Execution:** Record end timestamp → Pause → Background job checks database → Resume at timestamp → Go to next node
- **Implementation:** Use cron job checking every 10s for sessions with `resumeAt <= NOW()`
- **Validation:** Duration > 0, max 24 hours

**Example Config:**
```json
{
  "nodeType": "DELAY",
  "delayDuration": 30,
  "delayUnit": "SECONDS",
  "nextNodeId": "msg_002"
}
```

---

#### 7. API NODE
- **Purpose:** Call external APIs, store responses
- **Visual:** Teal rectangle, cloud icon
- **Handles:** 1 input, 2 outputs (success, failure)
- **Config Fields:**
  - HTTP Method: GET, POST, PUT, DELETE, PATCH
  - Endpoint URL (supports `{{variables}}`)
  - Headers (key-value pairs, supports variables)
  - Query Params (key-value)
  - Request Body (JSON, supports variables)
  - Response Mapping:
    - JSON path → variable name (e.g., `data.userId` → `apiUserId`)
    - Store Entire Response (checkbox)
  - Retry: Max Retries (3), Retry Delay (2s), Timeout (30s)
  - Success/Failure Next Nodes
- **Execution:** Replace variables → Make HTTP call → Parse response → Extract values via JSON path → Store in variables → Go to success/failure node
- **Validation:** URL valid, at least one response mapping

**Example Config:**
```json
{
  "nodeType": "API",
  "method": "POST",
  "url": "https://api.crm.com/leads",
  "headers": [{"key": "Authorization", "value": "Bearer {{token}}"}],
  "body": "{\"email\": \"{{userEmail}}\", \"name\": \"{{userName}}\"}",
  "responseMapping": [{"jsonPath": "data.leadId", "variableName": "crmLeadId"}],
  "retry": {"max": 3, "delay": 2, "timeout": 30},
  "successNextNodeId": "msg_success",
  "failureNextNodeId": "msg_error"
}
```

---

#### 8. AI NODE
- **Purpose:** OpenAI integration for intelligent responses
- **Visual:** Purple gradient rectangle, sparkle icon
- **Handles:** 1 input, 2 outputs (success, failure)
- **Config Fields:**
  - Model: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
  - Temperature (0.0-1.0, default 0.7)
  - System Prompt (optional, supports variables)
  - User Prompt Template (required, supports variables)
  - Include Conversation History (checkbox, last N messages)
  - History Length (default 10)
  - Max Tokens (default 500)
  - Store Response In Variable
  - Send Response to User (checkbox)
  - Fallback Response (if API fails)
  - Success/Failure Next Nodes
- **Execution:** Check user has OpenAI key → Build messages array (system + history + user prompt) → Replace variables → Call OpenAI API with user's key → Store response → Optionally send to user → Go to success/failure node
- **Validation:** Prompt template required, variable name required

**Example Config:**
```json
{
  "nodeType": "AI",
  "model": "gpt-4",
  "temperature": 0.7,
  "systemPrompt": "You are a helpful support agent.",
  "userPrompt": "User said: {{lastMessage}}\nOrder status: {{orderStatus}}\nRespond helpfully.",
  "includeHistory": true,
  "historyLength": 5,
  "maxTokens": 300,
  "storeResponseIn": "aiResponse",
  "sendToUser": true,
  "fallback": "I'm having trouble right now. Please try again.",
  "successNextNodeId": "end_001",
  "failureNextNodeId": "msg_error"
}
```

---

#### 9. LOOP NODE
- **Purpose:** Repeat sub-flow until exit condition met
- **Visual:** Circular node, loop icon
- **Handles:** 1 input, 3 handles (loop body out, loop continue in, exit out)
- **Config Fields:**
  - Loop Type: Count-Based, Condition-Based
  - **Count-Based:**
    - Iteration Count
    - Current Iteration Variable (auto-incremented)
  - **Condition-Based:**
    - Exit Condition (expression)
  - Max Iterations (safety limit, default 10)
  - Loop Body Next Node
  - Exit Next Node
- **Execution:**
  - Count: Initialize counter → Enter loop body → Execute sub-flow → Increment counter → If < count: repeat, else exit
  - Condition: Evaluate condition → If false: enter loop body → Execute sub-flow → Re-evaluate → If true or max iterations: exit
- **Validation:** Loop body and exit nodes required, max iterations set

**Visual:** Sub-flow connects back to loop's continue input

**Example Config:**
```json
{
  "nodeType": "LOOP",
  "loopType": "CONDITION_BASED",
  "exitCondition": "{{inputValid}} == true",
  "maxIterations": 5,
  "loopBodyNextNodeId": "input_validate",
  "exitNextNodeId": "msg_success"
}
```

---

#### 10. END NODE
- **Purpose:** Terminate flow execution
- **Visual:** Red circle, stop icon
- **Handles:** 1 input, 0 outputs
- **Config Fields:**
  - End Type: Normal, Error (affects analytics)
  - Final Message (optional, sent before ending)
  - Session Action: Keep Active, Close Session
- **Execution:** Send final message → Mark session as COMPLETED or CLOSED → Stop execution
**Post-Execution:**
  - If session closed: New message creates a new session starting from Start node
  - If session active: System checks restart policy:
      - Resume from last node
      - Restart from Start node
      - Route to fallback flow
  - Restart policy configurable per flow
- **Validation:** Cannot have outgoing edges

**Example Config:**
```json
{
  "nodeType": "END",
  "endType": "NORMAL",
  "finalMessage": "Thank you! We'll get back to you soon.",
  "sessionAction": "CLOSE_SESSION"
}
```

---

### Flow JSON Schema

```json
{
  "flowId": "flow_abc123",
  "flowName": "Welcome Flow",
  "botId": "bot_xyz789",
  "version": 1,
  "isProduction": false,
  "nodes": [
    {
      "nodeId": "start_001",
      "nodeType": "START",
      "position": {"x": 100, "y": 100},
      "config": {}
    },
    {
      "nodeId": "msg_001",
      "nodeType": "MESSAGE",
      "position": {"x": 300, "y": 100},
      "config": {"messageContent": "Hello {{userName}}!"}
    }
  ],
  "edges": [
    {
      "edgeId": "edge_001",
      "sourceNodeId": "start_001",
      "targetNodeId": "msg_001",
      "sourceHandle": "output",
      "targetHandle": "input"
    }
  ],
  "variables": {
    "bot": ["companyName", "supportEmail"],
    "session": []
  }
}
```

---

### Flow Validation Engine

Run before deployment:

**Critical Validations:**
1. Exactly one Start node exists
2. All nodes reachable from Start (no orphans)
3. All paths lead to End node (no infinite loops except Loop nodes)
4. All required node fields filled
5. All variables used are defined
6. All edges valid (both ends connected)

**Validation UI:**
- ✅ Passed (green)
- ⚠️ Warnings (yellow, can deploy)
- ❌ Errors (red, cannot deploy)

Only allow deployment if no errors.

---

## 🧪 FLOW DRAFT & PRODUCTION MODES

### Development Mode (Draft)
- Editable flows
- Auto-save every 30s
- Testable in simulator (not via WhatsApp)
- Multiple draft versions (version history)
- Full debugging enabled

### Production Mode
- Read-only, immutable versions
- Accessible via WhatsApp webhook
- One active production version per flow
- Versioned deployments
- Limited logging (privacy/performance)

### Deployment Process
1. User completes flow in dev mode
2. User runs validation (required)
3. If passes: User clicks "Deploy to Production"
4. System checks: WhatsApp connected? Validation passed? No locks?
5. System creates immutable production version
6. Archives old production version
7. Webhook uses new version immediately

### Rollback
- User can revert to previous production version
- All versions retained in database

**Version Metadata:**
```json
{
  "versionNumber": 5,
  "isDraft": false,
  "isProduction": true,
  "deployedAt": "2026-02-09T10:30:00Z",
  "deployedBy": "user_123"
}
```

---

## 🐞 FLOW DEBUGGING SYSTEM

### Debug Mode (Development Only)

**1. Node Execution Logs:**
- Timestamp, node ID/type, execution duration
- Input/output variables
- Next node selected
- Displayed chronologically in Debug Panel

**2. Variable Inspector:**
- Real-time view of bot and session variables
- Grouped by scope
- Show type and last updated timestamp
- Editable in debug mode (for testing)

**3. Decision Path Tracing:**
- Highlight edges traversed (green)
- Show unchosen paths (gray)
- Log which condition/button was selected

**4. API Response Logs:**
- Request: method, URL, headers (masked sensitive), body
- Response: status, headers, body, duration
- Collapsible sections, syntax highlighted

**5. AI Response Logs:**
- Model, prompt (with variables replaced), conversation history
- Response text, token usage, cost estimate, duration

**6. Session Timeline Viewer:**
- Vertical timeline of all execution events
- Color-coded by node type
- Click to expand details
- Export as JSON/PDF

**Debug Panel Layout:**
- Right Panel Tabs: Node Settings, Variable Inspector, Execution Logs, Session Timeline
- Bottom Panel: Console-style real-time log output

---

## 🧠 VARIABLE MANAGEMENT

### Variable Scopes

**1. Bot Variables (Global):**
- Defined at bot level
- Shared across all flows and sessions
- Read-only from session perspective
- Use cases: Company name, support email, API endpoints
- Stored in `BotVariables` table

**2. Session Variables (Session):**
- Unique per WhatsApp user session
- Isolated between sessions (no leakage)
- Persist for session duration
- Use cases: User input, API responses, AI output
- Stored in `SessionVariables` table
- Session ID: `botId + userPhoneNumber`

### Variable Operations

- **Set:** Create or overwrite (e.g., `Set {{userEmail}} = input`)
- **Read:** Use in templates (e.g., `Hello {{userName}}`)
- **Update:** Modify existing (same as Set for primitives)
- **Delete:** Remove from session
- **Increment:** Increase numeric variable (e.g., `Increment {{counter}} by 1`)

### Variable Types

- String, Number, Boolean, Object (JSON), Array
- Type enforcement and validation

### Variable Naming Rules

- Alphanumeric + underscores only
- Must start with letter
- Case-sensitive
- No spaces or special characters
- Reserved names: `sessionId`, `userId`, `botId`, `timestamp`, `messageId`

### Variable Injection Syntax

- Standard: `{{variableName}}`
- Nested: `{{user.profile.email}}`
- Array: `{{orders[0].id}}`
- Fallback: `{{userName || "Guest"}}`

### Variable Persistence

- Session variables: Persist in database, survive restarts, cleared when session closes
- Bot variables: Persist indefinitely until manually changed

---

## ⚙️ FLOW EXECUTION ENGINE

### Execution Trigger

1. **Webhook receives WhatsApp message**
2. **Identify bot** (query by recipient phone number)
3. **Find/create session** (`botId + senderPhoneNumber`)
4. **Load active production flow**
5. **Execute current node**
6. **Update variables**
7. **Send response** (if needed)
8. **Determine next node**
9. **Save session state**

### Execution Steps

**Step 1: Message Received**
- Webhook: `/api/webhook/whatsapp`
- Payload: from, to, messageType, messageContent, timestamp
- Log and validate

**Step 2: Session Identification**
```javascript
const session = await Session.findOne({
  botId: botId,
  userPhoneNumber: '+1234567890',
  status: { $ne: 'CLOSED' }
}).sort({ createdAt: -1 });
```
- If found: Load state
- If not found: Create new session, set current node to Start

**Flow Restart Handling:**
- If session exists but flow version changed after deployment:
  - Either resume old version OR restart from new version Start node
  - Controlled by flow restart policy
- Prevent session corruption across versions

**Step 3: Node Execution**
- Load node from production flow
- Switch on `nodeType`:
  - **START:** Go to next immediately
  - **MESSAGE:** Replace variables, send, go to next
  - **BUTTON:** Send interactive message, pause, wait for click
  - **INPUT:** Send prompt, pause, validate on response
  - **CONDITION:** Evaluate branches, go to first match or default
  - **DELAY:** Record timestamp, pause, schedule resume
  - **API:** Build request, call, parse, store, go to success/failure
  - **AI:** Build prompt, call OpenAI with user's key, store, go to success/failure
  - **LOOP:** Evaluate condition, go to body or exit
  - **END:** Send final message, mark session complete/closed, stop

**Step 4: Variables Updated**
```javascript
await SessionVariable.findOneAndUpdate(
  { sessionId, variableName: 'userName' },
  { 
    variableValue: 'John Doe', 
    variableType: 'STRING',
    updatedAt: new Date()
  },
  { upsert: true, new: true }
);
```

**Step 5: Response Sent**
- Construct WhatsApp API payload
- POST to `https://graph.facebook.com/v24.0/{phone_number_id}/messages`
- Log in `Messages` table
- Retry on error (up to 3 times)

**Step 6: Next Node Selected**
- Deterministic based on node type
- Update session:
```javascript
await Session.findByIdAndUpdate(sessionId, {
  currentNodeId: nextNodeId,
  updatedAt: new Date()
});
```
- If next node pauses: Stop, wait for webhook
- If continues: Execute next node recursively

**Step 7: Session Saved**
- Commit session state, variables, logs
- Use transactions for atomicity

### Concurrent Session Handling

- Each session isolated (separate DB rows)
- Row-level locking: `SELECT ... FOR UPDATE`
- Message queue per session (sequential processing)
- Multiple sessions execute in parallel

### Error Handling

- **Node config errors:** Log, mark session failed
- **API errors:** Retry with exponential backoff, go to failure node
- **OpenAI errors:** Send fallback, go to failure node
- **WhatsApp errors:** Retry 3x, log, mark message failed
- **DB errors:** Retry query, queue for later if persistent

### Performance Optimization

- Index on `Sessions.botId + userPhoneNumber`
- Cache production flow JSON in memory
- Async webhook processing (return 200 OK immediately)
- Job queue for node execution
- Rate limiting per session

---

## 🗄 DATABASE DESIGN

### Collections & Mongoose Schemas

**User Schema**
```typescript
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' }
}, { timestamps: true });

UserSchema.index({ email: 1 });
```

**OpenAIAccount Schema**
```typescript
const OpenAIAccountSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  apiKey: { type: String, required: true } // Encrypted
}, { timestamps: true });

OpenAIAccountSchema.index({ userId: 1 });
```

**Bot Schema**
```typescript
const BotSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  activeFlowId: { type: Schema.Types.ObjectId, ref: 'Flow' }
}, { timestamps: true });

BotSchema.index({ userId: 1 });
```

**WhatsAppAccount Schema**
```typescript
const WhatsAppAccountSchema = new Schema({
  botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true, unique: true },
  phoneNumberId: { type: String, required: true, unique: true },
  businessAccountId: { type: String, required: true },
  accessToken: { type: String, required: true }, // Encrypted
  phoneNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

WhatsAppAccountSchema.index({ phoneNumber: 1 });
```

**Flow Schema**
```typescript
const FlowSchema = new Schema({
  botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
  name: { type: String, required: true },
  description: { type: String }
}, { timestamps: true });

FlowSchema.index({ botId: 1, name: 1 }, { unique: true });
```

**FlowVersion Schema**
```typescript
const FlowVersionSchema = new Schema({
  flowId: { type: Schema.Types.ObjectId, ref: 'Flow', required: true },
  versionNumber: { type: Number, required: true },
  flowData: { type: Object, required: true }, // Complete flow JSON
  isDraft: { type: Boolean, default: true },
  isProduction: { type: Boolean, default: false },
  deployedAt: { type: Date },
  deployedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

FlowVersionSchema.index({ flowId: 1, versionNumber: 1 }, { unique: true });
FlowVersionSchema.index({ flowId: 1, isProduction: 1 });
```

**Session Schema**
```typescript
const SessionSchema = new Schema({
  botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
  userPhoneNumber: { type: String, required: true },
  currentNodeId: { type: String },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'PAUSED', 'COMPLETED', 'CLOSED', 'FAILED'], 
    default: 'ACTIVE' 
  },
  resumeAt: { type: Date }, // For delay nodes
  closedAt: { type: Date }
}, { timestamps: true });

// Partial index for unique active session per bot/user
SessionSchema.index(
  { botId: 1, userPhoneNumber: 1, status: 1 }, 
  { unique: true, partialFilterExpression: { status: { $ne: 'CLOSED' } } }
);
SessionSchema.index({ resumeAt: 1 }, { sparse: true });
```

**SessionVariable Schema**
```typescript
const SessionVariableSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  variableName: { type: String, required: true },
  variableValue: { type: Schema.Types.Mixed },
  variableType: { 
    type: String, 
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'OBJECT', 'ARRAY'], 
    default: 'STRING' 
  }
}, { timestamps: true });

SessionVariableSchema.index({ sessionId: 1, variableName: 1 }, { unique: true });
```

**Message Schema**
```typescript
const MessageSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  sender: { type: String, enum: ['USER', 'BOT'], required: true },
  messageType: { 
    type: String, 
    enum: ['TEXT', 'BUTTON', 'IMAGE', 'DOCUMENT'], 
    default: 'TEXT' 
  },
  messageContent: { type: String },
  nodeId: { type: String }, // Which node generated this (if BOT)
  sentAt: { type: Date, default: Date.now }
});

MessageSchema.index({ sessionId: 1, sentAt: 1 });
```

**BotVariable Schema**
```typescript
const BotVariableSchema = new Schema({
  botId: { type: Schema.Types.ObjectId, ref: 'Bot', required: true },
  variableName: { type: String, required: true },
  variableValue: { type: Schema.Types.Mixed },
  variableType: { 
    type: String, 
    enum: ['STRING', 'NUMBER', 'BOOLEAN', 'OBJECT', 'ARRAY'], 
    default: 'STRING' 
  }
}, { timestamps: true });

BotVariableSchema.index({ botId: 1, variableName: 1 }, { unique: true });
```

**ExecutionLog Schema**
```typescript
const ExecutionLogSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  nodeId: { type: String, required: true },
  nodeType: { type: String, required: true },
  executionDuration: { type: Number }, // milliseconds
  inputVariables: { type: Object },
  outputVariables: { type: Object },
  nextNodeId: { type: String },
  error: { type: String },
  executedAt: { type: Date, default: Date.now }
});

ExecutionLogSchema.index({ sessionId: 1, executedAt: 1 });
```

---

## 🧪 TEST SIMULATOR

**Purpose:** Test flows in development without WhatsApp

**Features:**
- Phone number input (simulated user)
- Message sending interface
- Button click simulation
- Variable inspection
- Session reset
- Real-time execution visualization
- Debug logs display

**Implementation:**
- Separate route: `/api/simulator/message`
- Uses draft flow version
- Creates test sessions (marked as test)
- Full debugging enabled
- No actual WhatsApp API calls

---

## 📊 ANALYTICS (Basic)

Track:
- Flow starts (total sessions created)
- Flow completions (sessions reaching End node)
- Node visit counts (which nodes executed most)
- Drop-off points (where users leave flows)
- Average session duration
- Error rates (API failures, validation failures)
- Message counts per bot
- Active sessions per bot

Display in dashboard:
- Total bots
- Total flows
- Active sessions
- Messages sent (last 24h)
- Flow completion rate
- Top executed flows

---

## 🎨 UI REQUIREMENTS

**Design System:**
- Tailwind CSS v4 for styling
- shadcn UI components
- Central theme config (colors, spacing, typography)
- Dark/light mode toggle

**Layout:**
- Dashboard: Sidebar navigation, main content area, responsive
- Flow Builder: Three-panel layout (Node Library, Canvas, Settings)
- Mobile-friendly (responsive breakpoints)

**Components (shadcn):**
- Button, Input, Select, Dialog, Dropdown, Toast, Card, Tabs, Table, Badge

---

## ⚡ SCALABILITY

**Stateless APIs:**
- No in-memory state (use database)
- Horizontal scaling ready

**Database:**
- Indexed queries (see CREATE INDEX statements)
- Connection pooling (Prisma)
- Query optimization (eager loading, select specific fields)

**Webhook Handling:**
- Async processing (return 200 OK immediately, queue message)
- Idempotent webhook processing (handle duplicates)

**Caching:**
- Cache production flows in memory (invalidate on deploy)
- Cache bot variables in memory

**Rate Limiting:**
- Per-user API rate limits
- Per-session message limits

---

## 📁 PROJECT STRUCTURE

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowBuilder/
│   │   │   │   ├── Canvas.tsx
│   │   │   │   ├── NodeLibrary.tsx
│   │   │   │   ├── NodeSettings.tsx
│   │   │   │   └── nodes/
│   │   │   │       ├── StartNode.tsx
│   │   │   │       ├── MessageNode.tsx
│   │   │   │       └── ... (all 10 node types)
│   │   │   ├── Simulator/
│   │   │   ├── Dashboard/
│   │   │   └── ui/ (shadcn components)
│   │   ├── store/ (Redux slices)
│   │   ├── types/ (TypeScript interfaces/types)
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── botController.ts
│   │   │   ├── flowController.ts
│   │   │   ├── webhookController.ts
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── executionService.ts (flow execution logic)
│   │   │   ├── whatsappService.ts (WhatsApp API calls)
│   │   │   ├── openaiService.ts (OpenAI API calls)
│   │   │   └── ...
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── botRoutes.ts
│   │   │   ├── flowRoutes.ts
│   │   │   ├── webhookRoutes.ts
│   │   │   └── ...
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.ts (JWT validation)
│   │   │   ├── errorMiddleware.ts
│   │   │   └── ...
│   │   ├── models/ (Mongoose schemas)
│   │   ├── types/ (TypeScript interfaces/types)
│   │   ├── utils/
│   │   ├── seed.ts
│   │   ├── server.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

---

## 🧪 RUNNING STEPS

### Backend Setup
1. Install dependencies: `cd server && npm install`
2. Setup MongoDB database (local or Atlas)
3. Configure `.env`:
   ```
   MONGODB_URI="mongodb://localhost:27017/whatsapp_flow_builder"
   JWT_SECRET="your-secret-key"
   PORT=5000
   ```
4. Seed database: `npm run seed`
5. Start server: `npm run dev`

### Frontend Setup
1. Install dependencies: `cd client && npm install`
2. Configure `.env`:
   ```
   VITE_API_URL="http://localhost:5000"
   ```
3. Start dev server: `npm run dev`

### WhatsApp Webhook Setup
1. Deploy backend to public URL (e.g., ngrok for testing, Render/Railway for production)
2. Configure webhook in Meta Developer Console:
   - URL: `https://your-domain.com/api/webhook/whatsapp`
   - Verify token: (set in backend .env)
3. Subscribe to message events

### Testing Flow
1. Login as `abhi@gmail.com` / `123456`
2. Add OpenAI API key in settings
3. Create new bot
4. Build flow in canvas
5. Test in simulator
6. Debug and refine
7. Connect WhatsApp credentials in bot settings
8. Deploy flow to production
9. Send WhatsApp message to bot's number
10. Verify execution in logs

---

## 🧠 USER MENTAL FLOW

### Admin Journey
Login → View Users Dashboard → Monitor All Bots → Monitor All Flows → View Platform Analytics

### User Journey
Register → Login → Add OpenAI Credentials → Create Bot → Build Flows Visually → Test in Simulator → Debug Flows → Review Execution Logs → Connect WhatsApp Account → Deploy Bot to Production → Production Goes Live → Monitor Sessions → Iterate and Improve

---

## 📦 OUTPUT DELIVERABLES

1. **Full Codebase** (client + server)
2. **README.md** with:
   - Project overview
   - Tech stack
   - Installation instructions
   - Environment variables
   - Database setup
   - Running instructions
   - Deployment guide
3. **Flow JSON Examples** (sample flows for testing)
4. **API Documentation** (endpoints, request/response formats)
5. **Seed Data** (default users, sample bot, sample flow)
6. **Setup Guide** (step-by-step for developers)

---

## 🎯 FINAL GOAL

User must be able to:
1. Login to platform
2. Add OpenAI API key
3. Create a bot
4. Build conversational flows visually
5. Test flows in simulator
6. Debug flows with logs
7. Connect WhatsApp account
8. Deploy bot to production
9. Have WhatsApp users interact with bot
10. Sessions handled correctly with variable isolation

System must be:
- Production-ready
- Scalable
- Type-safe
- Well-documented
- Deployable to cloud platforms

---

🚀 **PROMPT END**
