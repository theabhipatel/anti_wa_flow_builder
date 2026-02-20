import { Document, Types } from 'mongoose';

// ============================================================
// TYPE ALIASES
// ============================================================

export type TUserRole = 'ADMIN' | 'USER';
export type TSessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CLOSED' | 'FAILED';
export type TNodeType = 'START' | 'MESSAGE' | 'BUTTON' | 'LIST' | 'INPUT' | 'CONDITION' | 'DELAY' | 'API' | 'AI' | 'LOOP' | 'END' | 'GOTO_SUBFLOW';
export type TVariableType = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'OBJECT' | 'ARRAY';
export type TMessageSender = 'USER' | 'BOT';
export type TConversationSender = 'USER' | 'BOT' | 'MANUAL';
export type TMessageType = 'TEXT' | 'BUTTON' | 'LIST' | 'IMAGE' | 'DOCUMENT';
export type TInputType = 'TEXT' | 'NUMBER' | 'EMAIL' | 'PHONE' | 'CUSTOM_REGEX';
export type THttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
export type TAuthType = 'NONE' | 'BEARER' | 'API_KEY' | 'BASIC_AUTH' | 'CUSTOM_HEADER';
export type TContentType = 'JSON' | 'FORM_URLENCODED' | 'RAW';
export type TLoopType = 'FOR_EACH' | 'COUNT_BASED' | 'CONDITION_BASED';
export type TOnEmptyArray = 'SKIP' | 'ERROR';
export type TEndType = 'NORMAL' | 'ERROR';
export type TSessionAction = 'KEEP_ACTIVE' | 'CLOSE_SESSION';
export type TConditionType = 'KEYWORD_MATCH' | 'VARIABLE_COMPARISON' | 'LOGICAL_EXPRESSION';

// ============================================================
// DOCUMENT INTERFACES (Mongoose)
// ============================================================

export interface IUser extends Document {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    role: TUserRole;
    createdAt: Date;
    updatedAt: Date;
}

export type TAIProvider = 'OPENAI' | 'GEMINI' | 'GROQ' | 'MISTRAL' | 'OPENROUTER' | 'CUSTOM';
export type TAIApiLogStatus = 'SUCCESS' | 'ERROR';

export interface IAIProvider extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    provider: TAIProvider;
    baseUrl: string;
    apiKey: string; // Encrypted
    defaultModel: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAIApiLog extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    botId: Types.ObjectId;
    sessionId?: Types.ObjectId;
    nodeId: string;
    nodeLabel: string;
    aiProviderId?: Types.ObjectId;
    providerName: string;
    provider: string;
    modelName: string;
    status: TAIApiLogStatus;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    errorMessage: string | null;
    errorCode: string | null;
    responseTimeMs: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBot extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    name: string;
    description?: string;
    activeFlowId?: Types.ObjectId;
    defaultFallbackMessage?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IWhatsAppAccount extends Document {
    _id: Types.ObjectId;
    botId: Types.ObjectId;
    phoneNumberId: string;
    accessToken: string; // Encrypted
    phoneNumber: string;
    verifyToken: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFlow extends Document {
    _id: Types.ObjectId;
    botId: Types.ObjectId;
    name: string;
    description?: string;
    isMainFlow: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IFlowVersion extends Document {
    _id: Types.ObjectId;
    flowId: Types.ObjectId;
    versionNumber: number;
    flowData: IFlowData;
    isDraft: boolean;
    isProduction: boolean;
    deployedAt?: Date;
    deployedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISubflowCallStackEntry {
    flowVersionId: string;
    returnNodeId: string;
}

export interface ISession extends Document {
    _id: Types.ObjectId;
    botId: Types.ObjectId;
    flowVersionId?: Types.ObjectId;
    userPhoneNumber: string;
    currentNodeId?: string;
    status: TSessionStatus;
    subflowCallStack: ISubflowCallStackEntry[];
    resumeAt?: Date;
    closedAt?: Date;
    isTest: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISessionVariable extends Document {
    _id: Types.ObjectId;
    sessionId: Types.ObjectId;
    variableName: string;
    variableValue: unknown;
    variableType: TVariableType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessage extends Document {
    _id: Types.ObjectId;
    sessionId: Types.ObjectId;
    sender: TMessageSender;
    messageType: TMessageType;
    messageContent?: string;
    nodeId?: string;
    sentAt: Date;
}

export interface IConversationMessage extends Document {
    _id: Types.ObjectId;
    botId: Types.ObjectId;
    userPhoneNumber: string;
    sender: TConversationSender;
    messageType: TMessageType;
    messageContent?: string;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBotVariable extends Document {
    _id: Types.ObjectId;
    botId: Types.ObjectId;
    variableName: string;
    variableValue: unknown;
    variableType: TVariableType;
    createdAt: Date;
    updatedAt: Date;
}

export interface IExecutionLog extends Document {
    _id: Types.ObjectId;
    sessionId: Types.ObjectId;
    nodeId: string;
    nodeType: TNodeType;
    executionDuration?: number;
    inputVariables?: Record<string, unknown>;
    outputVariables?: Record<string, unknown>;
    nextNodeId?: string;
    error?: string;
    executedAt: Date;
}

// ============================================================
// FLOW DATA INTERFACES
// ============================================================

export interface IFlowData {
    nodes: IFlowNode[];
    edges: IFlowEdge[];
    variables?: {
        bot?: string[];
        session?: string[];
    };
}

export interface IFlowNode {
    nodeId: string;
    nodeType: TNodeType;
    position: { x: number; y: number };
    label?: string;
    description?: string;
    config: INodeConfig;
}

export interface IFlowEdge {
    edgeId: string;
    sourceNodeId: string;
    targetNodeId: string;
    sourceHandle?: string;
    targetHandle?: string;
}

// ============================================================
// NODE CONFIG INTERFACES
// ============================================================

export type INodeConfig =
    | IStartNodeConfig
    | IMessageNodeConfig
    | IButtonNodeConfig
    | IListNodeConfig
    | IInputNodeConfig
    | IConditionNodeConfig
    | IDelayNodeConfig
    | IApiNodeConfig
    | IAiNodeConfig
    | ILoopNodeConfig
    | IEndNodeConfig
    | IGotoSubflowNodeConfig;

export interface IStartNodeConfig {
    nextNodeId?: string;
}

export interface IMessageNodeConfig {
    text: string;
    messageContent?: string; // legacy alias
    nextNodeId?: string;
}

export interface IButtonConfig {
    buttonId: string;
    label: string;
    nextNodeId?: string;
    storeIn?: string;
}

export interface IButtonNodeConfig {
    messageText?: string;
    buttons: IButtonConfig[];
    fallback?: {
        message?: string;
        nextNodeId?: string;
    };
}

export interface IListItemConfig {
    itemId: string;
    title: string;
    description?: string;
    nextNodeId?: string;
}

export interface IListSectionConfig {
    title: string;
    items: IListItemConfig[];
}

export interface IListNodeConfig {
    messageText?: string;
    buttonText?: string;    // Text shown on the list open button (max 20 chars)
    sections: IListSectionConfig[];
    fallback?: {
        message?: string;
        nextNodeId?: string;
    };
}

export interface IInputNodeConfig {
    promptText: string;
    promptMessage?: string; // legacy alias
    inputType: TInputType;
    validation?: {
        minLength?: number;
        maxLength?: number;
        regexPattern?: string;
    };
    variableName: string;
    retryConfig?: {
        maxRetries: number;
        retryMessage?: string;
        failureNextNodeId?: string;
    };
    successNextNodeId?: string;
}

export interface IConditionBranch {
    label: string;
    expression: string;
    nextNodeId?: string;
}

export interface IConditionNodeConfig {
    conditionType?: TConditionType;
    leftOperand?: string;
    operator?: string;
    rightOperand?: string;
    branches?: IConditionBranch[];
    defaultBranch?: {
        nextNodeId?: string;
    };
}

export interface IDelayNodeConfig {
    delaySeconds: number;
    delayDuration?: number; // legacy alias
    delayUnit?: 'SECONDS' | 'MINUTES' | 'HOURS';
    nextNodeId?: string;
}

export interface IApiHeaderParam {
    key: string;
    value: string;
}

export interface IApiResponseMapping {
    jsonPath: string;
    variableName: string;
}

export interface IApiAuthConfig {
    // Bearer Token
    bearerToken?: string;
    // API Key
    apiKeyName?: string;
    apiKeyValue?: string;
    apiKeyLocation?: 'HEADER' | 'QUERY';
    // Basic Auth
    basicUsername?: string;
    basicPassword?: string;
    // Custom Header
    customAuthHeader?: string;
    customAuthValue?: string;
}

export interface IApiNodeConfig {
    method: THttpMethod;
    url: string;

    // Authentication
    authType?: TAuthType;
    authConfig?: IApiAuthConfig;

    // Headers
    headers?: IApiHeaderParam[];

    // Query Parameters
    queryParams?: IApiHeaderParam[];

    // Request Body (only for POST, PUT, PATCH)
    contentType?: TContentType;
    body?: string;

    // Timeout in seconds (default: 10)
    timeout?: number;

    // Retry configuration
    retryEnabled?: boolean;
    retry?: {
        max: number;
        delay: number;
        timeout?: number; // legacy — now using top-level timeout
    };

    // Response handling
    statusCodeVariable?: string;
    storeEntireResponse?: boolean;
    storeResponseIn?: string;
    responseMapping?: IApiResponseMapping[];

    // Error handling
    errorVariable?: string;

    // Legacy: single response variable (backwards compat with old frontend)
    responseVariable?: string;

    // Navigation
    successNextNodeId?: string;
    failureNextNodeId?: string;
}

export interface IAiNodeConfig {
    // Provider
    aiProviderId?: string;
    customBaseUrl?: string;
    customApiKey?: string;
    model: string;

    // Prompt
    systemPrompt?: string;
    userMessage: string;
    includeHistory?: boolean;
    historyLength?: number;

    // Parameters
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    seed?: number;
    responseFormat?: 'text' | 'json_object';

    // Response Handling
    sendToUser?: boolean;
    responseVariable?: string;
    storeEntireResponse?: boolean;
    storeResponseIn?: string;
    responseMapping?: IApiResponseMapping[];

    // Token Usage
    storeTokenUsage?: boolean;
    tokenUsageVariable?: string;

    // Error Handling
    errorVariable?: string;
    fallbackMessage?: string;

    // Timeout & Retry
    timeout?: number;
    retryEnabled?: boolean;
    retry?: { max: number; delay: number };

    // Navigation (edge-based)
    successNextNodeId?: string;
    failureNextNodeId?: string;
}

export interface ILoopItemMapping {
    jsonPath: string;
    variableName: string;
}

export interface ILoopNodeConfig {
    loopType: TLoopType;

    // FOR_EACH mode
    arrayVariable?: string;
    itemVariable?: string;
    indexVariable?: string;
    itemMapping?: ILoopItemMapping[];

    // COUNT_BASED mode
    iterationCount?: number;
    startValue?: number;
    step?: number;
    counterVariable?: string;

    // CONDITION_BASED mode
    continueCondition?: string;

    // Shared
    maxIterations: number;
    currentIterationVariable?: string;

    // Control variables
    countVariable?: string;

    // Accumulator
    collectResults?: boolean;
    resultVariable?: string;
    resultJsonPath?: string;

    // Error handling
    onEmptyArray?: TOnEmptyArray;
    errorVariable?: string;

    // Navigation (edge-based)
    loopBodyNextNodeId?: string;
    exitNextNodeId?: string;
    errorNextNodeId?: string;
}

export interface IEndNodeConfig {
    endType: TEndType;
    finalMessage?: string;
    sessionAction: TSessionAction;
}

export interface IGotoSubflowNodeConfig {
    targetFlowId?: string;
    nextNodeId?: string;
}

// ============================================================
// API REQUEST / RESPONSE TYPES
// ============================================================

export interface IAuthLoginRequest {
    email: string;
    password: string;
}

export interface IAuthRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface IAuthResponse {
    token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: TUserRole;
    };
}

export interface IApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface IValidationResult {
    isValid: boolean;
    errors: IValidationError[];
    warnings: IValidationWarning[];
}

export interface IValidationError {
    nodeId?: string;
    nodeName?: string;
    nodeType?: string;
    flowName?: string;
    field?: string;
    message: string;
}

export interface IValidationWarning {
    nodeId?: string;
    nodeName?: string;
    nodeType?: string;
    flowName?: string;
    field?: string;
    message: string;
}

// JWT Payload
export interface IJwtPayload {
    userId: string;
    email: string;
    role: TUserRole;
}

// Express Request extension
declare global {
    namespace Express {
        interface Request {
            user?: IJwtPayload;
        }
    }
}
