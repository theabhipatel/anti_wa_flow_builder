import { IFlowData, IValidationResult, IValidationError, IValidationWarning } from '../types';

export const validateFlow = (flowData: IFlowData, flowName?: string): IValidationResult => {
    const errors: IValidationError[] = [];
    const warnings: IValidationWarning[] = [];

    const { nodes, edges } = flowData;

    // Helper: look up node label and type for a given nodeId
    const nodeInfo = (nodeId: string): { nodeName?: string; nodeType?: string } => {
        const node = nodes.find((n) => n.nodeId === nodeId);
        return {
            nodeName: node?.label || node?.nodeId,
            nodeType: node?.nodeType,
        };
    };

    // Helper: build an error with full context
    const makeError = (nodeId: string | undefined, field: string | undefined, message: string): IValidationError => {
        const info = nodeId ? nodeInfo(nodeId) : {};
        return {
            nodeId,
            nodeName: info.nodeName,
            nodeType: info.nodeType,
            flowName,
            field,
            message,
        };
    };

    // Helper: build a warning with full context
    const makeWarning = (nodeId: string | undefined, message: string): IValidationWarning => {
        const info = nodeId ? nodeInfo(nodeId) : {};
        return {
            nodeId,
            nodeName: info.nodeName,
            nodeType: info.nodeType,
            flowName,
            message,
        };
    };

    // 1. Exactly one Start node
    const startNodes = nodes.filter((n) => n.nodeType === 'START');
    if (startNodes.length === 0) {
        errors.push(makeError(undefined, undefined, 'Flow must have exactly one Start node'));
    } else if (startNodes.length > 1) {
        errors.push(makeError(undefined, undefined, `Flow has ${startNodes.length} Start nodes, only one is allowed`));
    }

    // 2. At least one End node (warning only)
    const endNodes = nodes.filter((n) => n.nodeType === 'END');
    if (endNodes.length === 0) {
        warnings.push(makeWarning(undefined, 'Flow has no End node. Flows should terminate properly.'));
    }

    // 3. Check all nodes have required fields
    for (const node of nodes) {
        switch (node.nodeType) {
            case 'MESSAGE': {
                const config = node.config as { text?: string };
                if (!config.text || config.text.trim() === '') {
                    errors.push(makeError(node.nodeId, 'text', 'Message content is required'));
                }
                break;
            }
            case 'BUTTON': {
                const config = node.config as { messageText?: string; buttons?: Array<{ buttonId: string; label: string }> };
                if (!config.messageText || config.messageText.trim() === '') {
                    errors.push(makeError(node.nodeId, 'messageText', 'Button message text is required'));
                } else if (config.messageText.length > 1024) {
                    errors.push(makeError(node.nodeId, 'messageText', 'Message text must not exceed 1024 characters'));
                }
                if (!config.buttons || config.buttons.length === 0) {
                    errors.push(makeError(node.nodeId, 'buttons', 'At least one button is required'));
                } else {
                    if (config.buttons.length > 3) {
                        errors.push(makeError(node.nodeId, 'buttons', 'Maximum 3 buttons allowed'));
                    }
                    config.buttons.forEach((btn, idx) => {
                        if (!btn.label || btn.label.trim() === '') {
                            errors.push(makeError(node.nodeId, `buttons[${idx}]`, `Button ${idx + 1}: label is required`));
                        } else if (btn.label.length > 20) {
                            errors.push(makeError(node.nodeId, `buttons[${idx}]`, `Button ${idx + 1}: label must not exceed 20 characters`));
                        }
                    });
                }
                break;
            }
            case 'LIST': {
                const config = node.config as { messageText?: string; buttonText?: string; sections?: Array<{ title?: string; items?: Array<{ itemId: string; title: string; description?: string }> }> };
                if (!config.messageText || config.messageText.trim() === '') {
                    errors.push(makeError(node.nodeId, 'messageText', 'List message text is required'));
                } else if (config.messageText.length > 1024) {
                    errors.push(makeError(node.nodeId, 'messageText', 'Message text must not exceed 1024 characters'));
                }
                if (!config.buttonText || config.buttonText.trim() === '') {
                    errors.push(makeError(node.nodeId, 'buttonText', 'List button text is required'));
                } else if (config.buttonText.length > 20) {
                    errors.push(makeError(node.nodeId, 'buttonText', 'Button text must not exceed 20 characters'));
                }
                if (!config.sections || config.sections.length === 0) {
                    errors.push(makeError(node.nodeId, 'sections', 'At least one section is required'));
                } else {
                    let totalItems = 0;
                    config.sections.forEach((section, sIdx) => {
                        if (!section.items || section.items.length === 0) {
                            errors.push(makeError(node.nodeId, `sections[${sIdx}]`, `Section ${sIdx + 1}: at least one item is required`));
                        } else {
                            totalItems += section.items.length;
                            section.items.forEach((item, iIdx) => {
                                if (!item.title || item.title.trim() === '') {
                                    errors.push(makeError(node.nodeId, `sections[${sIdx}].items[${iIdx}]`, `Section ${sIdx + 1}, Item ${iIdx + 1}: title is required`));
                                } else if (item.title.length > 24) {
                                    errors.push(makeError(node.nodeId, `sections[${sIdx}].items[${iIdx}]`, `Section ${sIdx + 1}, Item ${iIdx + 1}: title must not exceed 24 characters`));
                                }
                                if (item.description && item.description.length > 72) {
                                    errors.push(makeError(node.nodeId, `sections[${sIdx}].items[${iIdx}]`, `Section ${sIdx + 1}, Item ${iIdx + 1}: description must not exceed 72 characters`));
                                }
                            });
                        }
                    });
                    if (totalItems > 10) {
                        errors.push(makeError(node.nodeId, 'sections', `Total list items (${totalItems}) exceeds maximum of 10`));
                    }
                }
                break;
            }
            case 'INPUT': {
                const config = node.config as { promptText?: string; variableName?: string };
                if (!config.promptText || config.promptText.trim() === '') {
                    errors.push(makeError(node.nodeId, 'promptText', 'Prompt message is required'));
                }
                if (!config.variableName || config.variableName.trim() === '') {
                    errors.push(makeError(node.nodeId, 'variableName', 'Variable name is required'));
                }
                break;
            }
            case 'CONDITION': {
                const config = node.config as { leftOperand?: string; operator?: string; rightOperand?: string };
                if (!config.leftOperand || config.leftOperand.trim() === '') {
                    errors.push(makeError(node.nodeId, 'leftOperand', 'Left operand is required'));
                }
                if (!config.operator) {
                    errors.push(makeError(node.nodeId, 'operator', 'Operator is required'));
                }
                break;
            }
            case 'DELAY': {
                const config = node.config as { delaySeconds?: number };
                if (!config.delaySeconds || config.delaySeconds <= 0) {
                    errors.push(makeError(node.nodeId, 'delaySeconds', 'Delay duration must be greater than 0'));
                }
                break;
            }
            case 'API': {
                const config = node.config as { url?: string; method?: string };
                if (!config.url || config.url.trim() === '') {
                    errors.push(makeError(node.nodeId, 'url', 'API URL is required'));
                }
                // method defaults to GET if not set — no validation needed
                break;
            }
            case 'AI': {
                const config = node.config as { userMessage?: string; responseVariable?: string };
                if (!config.userMessage || config.userMessage.trim() === '') {
                    errors.push(makeError(node.nodeId, 'userMessage', 'User message template is required'));
                }
                if (!config.responseVariable || config.responseVariable.trim() === '') {
                    errors.push(makeError(node.nodeId, 'responseVariable', 'Response variable name is required'));
                }
                break;
            }
            case 'LOOP': {
                const config = node.config as { loopType?: string; arrayVariable?: string; iterationCount?: number; continueCondition?: string; maxIterations?: number };
                const loopType = config.loopType || 'FOR_EACH';
                if (loopType === 'FOR_EACH' && (!config.arrayVariable || config.arrayVariable.trim() === '')) {
                    errors.push(makeError(node.nodeId, 'arrayVariable', 'Array variable is required for For Each loops'));
                }
                if (loopType === 'COUNT_BASED' && (!config.iterationCount || config.iterationCount <= 0) && (!config.maxIterations || config.maxIterations <= 0)) {
                    errors.push(makeError(node.nodeId, 'iterationCount', 'Iteration count must be set for Count Based loops'));
                }
                if (loopType === 'CONDITION_BASED' && (!config.continueCondition || config.continueCondition.trim() === '')) {
                    errors.push(makeError(node.nodeId, 'continueCondition', 'Continue condition is required for Condition Based loops'));
                }
                break;
            }
            case 'GOTO_SUBFLOW': {
                const config = node.config as { targetFlowId?: string };
                if (!config.targetFlowId || config.targetFlowId.trim() === '') {
                    errors.push(makeError(node.nodeId, 'targetFlowId', 'Target subflow must be selected'));
                }
                break;
            }
        }
    }

    // 4. Check all nodes are reachable from Start
    if (startNodes.length === 1) {
        const startNodeId = startNodes[0].nodeId;
        const reachable = new Set<string>();

        const traverse = (nodeId: string) => {
            if (reachable.has(nodeId)) return;
            reachable.add(nodeId);

            // Find outgoing edges
            const outgoing = edges.filter((e) => e.sourceNodeId === nodeId);
            for (const edge of outgoing) {
                traverse(edge.targetNodeId);
            }

            // Also check nextNodeId in configs
            const node = nodes.find((n) => n.nodeId === nodeId);
            if (node) {
                const config = node.config as Record<string, unknown>;
                if (config.nextNodeId && typeof config.nextNodeId === 'string') {
                    traverse(config.nextNodeId);
                }
                if (config.successNextNodeId && typeof config.successNextNodeId === 'string') {
                    traverse(config.successNextNodeId);
                }
                if (config.failureNextNodeId && typeof config.failureNextNodeId === 'string') {
                    traverse(config.failureNextNodeId);
                }
                if (config.loopBodyNextNodeId && typeof config.loopBodyNextNodeId === 'string') {
                    traverse(config.loopBodyNextNodeId);
                }
                if (config.exitNextNodeId && typeof config.exitNextNodeId === 'string') {
                    traverse(config.exitNextNodeId);
                }
                // Button branches
                if (Array.isArray(config.buttons)) {
                    for (const btn of config.buttons as Array<{ nextNodeId?: string }>) {
                        if (btn.nextNodeId) traverse(btn.nextNodeId);
                    }
                }
                // List sections/items branches
                if (Array.isArray(config.sections)) {
                    for (const section of config.sections as Array<{ items?: Array<{ nextNodeId?: string }> }>) {
                        if (Array.isArray(section.items)) {
                            for (const item of section.items) {
                                if (item.nextNodeId) traverse(item.nextNodeId);
                            }
                        }
                    }
                }
                // Condition branches
                if (Array.isArray(config.branches)) {
                    for (const branch of config.branches as Array<{ nextNodeId?: string }>) {
                        if (branch.nextNodeId) traverse(branch.nextNodeId);
                    }
                }
                if (config.defaultBranch && typeof config.defaultBranch === 'object') {
                    const db = config.defaultBranch as { nextNodeId?: string };
                    if (db.nextNodeId) traverse(db.nextNodeId);
                }
                if (config.fallback && typeof config.fallback === 'object') {
                    const fb = config.fallback as { nextNodeId?: string };
                    if (fb.nextNodeId) traverse(fb.nextNodeId);
                }
                if (config.retryConfig && typeof config.retryConfig === 'object') {
                    const rc = config.retryConfig as { failureNextNodeId?: string };
                    if (rc.failureNextNodeId) traverse(rc.failureNextNodeId);
                }
            }
        };

        traverse(startNodeId);

        const orphanNodes = nodes.filter((n) => !reachable.has(n.nodeId));
        for (const orphan of orphanNodes) {
            warnings.push(makeWarning(orphan.nodeId, `Node "${orphan.label || orphan.nodeId}" is not reachable from Start node`));
        }
    }

    // 5. Check all edges reference valid nodes
    const nodeIds = new Set(nodes.map((n) => n.nodeId));
    for (const edge of edges) {
        if (!nodeIds.has(edge.sourceNodeId)) {
            errors.push(makeError(undefined, undefined, `Edge ${edge.edgeId} references non-existent source node ${edge.sourceNodeId}`));
        }
        if (!nodeIds.has(edge.targetNodeId)) {
            errors.push(makeError(undefined, undefined, `Edge ${edge.edgeId} references non-existent target node ${edge.targetNodeId}`));
        }
    }

    // 6. End node should not have outgoing edges
    for (const endNode of endNodes) {
        const outgoing = edges.filter((e) => e.sourceNodeId === endNode.nodeId);
        if (outgoing.length > 0) {
            errors.push(makeError(endNode.nodeId, undefined, 'End node cannot have outgoing edges'));
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

