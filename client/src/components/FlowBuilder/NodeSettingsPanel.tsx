import { useState, useEffect } from 'react';
import { type Node } from '@xyflow/react';
import { X, Trash2, Plus } from 'lucide-react';
import api from '../../lib/api';
import { useParams } from 'react-router-dom';

interface Props {
    node: Node;
    onConfigChange: (nodeId: string, config: Record<string, unknown>) => void;
    onLabelChange: (nodeId: string, label: string) => void;
    onDelete: (nodeId: string) => void;
    onClose: () => void;
}

interface ButtonItem {
    buttonId: string;
    label: string;
}

interface SubflowOption {
    _id: string;
    name: string;
}

const MAX_BUTTONS = 3;
const MAX_BODY_TEXT_CHARS = 1024;
const MAX_BUTTON_LABEL_CHARS = 20;

export default function NodeSettingsPanel({ node, onConfigChange, onLabelChange, onDelete, onClose }: Props) {
    const { botId, flowId } = useParams();
    const data = node.data as { nodeType: string; label: string; config: Record<string, unknown> };
    const nodeType = data.nodeType;
    const config = data.config || {};

    const [subflows, setSubflows] = useState<SubflowOption[]>([]);

    // Fetch subflows for GOTO_SUBFLOW node
    useEffect(() => {
        if (nodeType === 'GOTO_SUBFLOW' && botId) {
            const fetchSubflows = async () => {
                try {
                    const res = await api.get(`/bots/${botId}/flows`);
                    if (res.data.success) {
                        // Filter to subflows only (not main flow, not current flow)
                        const allFlows = res.data.data as Array<{ _id: string; name: string; isMainFlow?: boolean }>;
                        setSubflows(
                            allFlows
                                .filter((f) => !f.isMainFlow && f._id !== flowId)
                                .map((f) => ({ _id: f._id, name: f.name }))
                        );
                    }
                } catch (err) {
                    console.error('Failed to fetch subflows:', err);
                }
            };
            fetchSubflows();
        }
    }, [nodeType, botId, flowId]);

    const updateConfig = (key: string, value: unknown) => {
        onConfigChange(node.id, { [key]: value });
    };

    // ---- Button helpers ----
    const buttons: ButtonItem[] = (config.buttons as ButtonItem[]) || [];

    const setButtons = (newButtons: ButtonItem[]) => {
        onConfigChange(node.id, { buttons: newButtons });
    };

    const addButton = () => {
        if (buttons.length >= MAX_BUTTONS) return;
        const newBtn: ButtonItem = {
            buttonId: `btn_${Date.now()}`,
            label: '',
        };
        setButtons([...buttons, newBtn]);
    };

    const removeButton = (index: number) => {
        if (buttons.length <= 1) return;
        setButtons(buttons.filter((_, i) => i !== index));
    };

    const updateButtonLabel = (index: number, label: string) => {
        if (label.length > MAX_BUTTON_LABEL_CHARS) return;
        const updated = [...buttons];
        updated[index] = { ...updated[index], label };
        setButtons(updated);
    };

    // Auto-add a default button if BUTTON node has no buttons
    useEffect(() => {
        if (nodeType === 'BUTTON' && (!config.buttons || (config.buttons as ButtonItem[]).length === 0)) {
            onConfigChange(node.id, {
                buttons: [{ buttonId: `btn_${Date.now()}`, label: 'Button 1' }],
            });
        }
    }, [nodeType]);

    const messageText = (config.messageText as string) || '';
    const bodyTextCharsLeft = MAX_BODY_TEXT_CHARS - messageText.length;

    return (
        <div className="w-80 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-sm">Node Settings</h3>
                    <span className="text-xs text-surface-500 uppercase">{nodeType === 'GOTO_SUBFLOW' ? 'GO TO SUBFLOW' : nodeType}</span>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Label */}
                <div>
                    <label className="input-label">Label</label>
                    <input
                        value={data.label || ''}
                        onChange={(e) => onLabelChange(node.id, e.target.value)}
                        className="input-field"
                        placeholder="Node label"
                    />
                </div>

                {/* ======================== START ======================== */}
                {nodeType === 'START' && (
                    <div className="text-xs text-surface-500 italic">
                        This is the entry point of the flow. It is automatically added and cannot be removed.
                    </div>
                )}

                {/* ======================== MESSAGE ======================== */}
                {nodeType === 'MESSAGE' && (
                    <div>
                        <label className="input-label">Message Text</label>
                        <textarea
                            value={(config.text as string) || ''}
                            onChange={(e) => updateConfig('text', e.target.value)}
                            className="input-field"
                            rows={4}
                            placeholder="Hello {{name}}! How can I help?"
                        />
                        <p className="text-xs text-surface-500 mt-1">Use {'{{variable}}'} for dynamic content</p>
                    </div>
                )}

                {/* ======================== BUTTON ======================== */}
                {nodeType === 'BUTTON' && (
                    <>
                        <div>
                            <label className="input-label">Message Text</label>
                            <textarea
                                value={messageText}
                                onChange={(e) => {
                                    if (e.target.value.length <= MAX_BODY_TEXT_CHARS) {
                                        updateConfig('messageText', e.target.value);
                                    }
                                }}
                                className="input-field"
                                rows={3}
                                placeholder="Please select an option:"
                            />
                            <p className={`text-xs mt-1 ${bodyTextCharsLeft < 50 ? 'text-red-500' : 'text-surface-500'}`}>
                                {bodyTextCharsLeft} / {MAX_BODY_TEXT_CHARS} characters remaining
                            </p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="input-label !mb-0">Buttons</label>
                                <span className="text-xs text-surface-500">{buttons.length} / {MAX_BUTTONS}</span>
                            </div>

                            <div className="space-y-2">
                                {buttons.map((btn, idx) => (
                                    <div key={btn.buttonId} className="flex items-center gap-2">
                                        <input
                                            value={btn.label}
                                            onChange={(e) => updateButtonLabel(idx, e.target.value)}
                                            className="input-field flex-1 !py-2 text-sm"
                                            placeholder={`Button ${idx + 1} label`}
                                            maxLength={MAX_BUTTON_LABEL_CHARS}
                                        />
                                        <span className="text-[10px] text-surface-400 w-8 text-right whitespace-nowrap">
                                            {btn.label.length}/{MAX_BUTTON_LABEL_CHARS}
                                        </span>
                                        {buttons.length > 1 && (
                                            <button
                                                onClick={() => removeButton(idx)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={addButton}
                                disabled={buttons.length >= MAX_BUTTONS}
                                className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-dashed transition-colors ${buttons.length >= MAX_BUTTONS
                                        ? 'border-surface-200 dark:border-surface-700 text-surface-400 cursor-not-allowed opacity-50'
                                        : 'border-violet-300 dark:border-violet-600 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20'
                                    }`}
                            >
                                <Plus className="w-3 h-3" />
                                Add Button {buttons.length >= MAX_BUTTONS && '(Max 3)'}
                            </button>
                        </div>
                    </>
                )}

                {/* ======================== INPUT ======================== */}
                {nodeType === 'INPUT' && (
                    <>
                        <div>
                            <label className="input-label">Prompt Message</label>
                            <textarea
                                value={(config.promptText as string) || ''}
                                onChange={(e) => updateConfig('promptText', e.target.value)}
                                className="input-field"
                                rows={3}
                                placeholder="Please enter your name:"
                            />
                        </div>
                        <div>
                            <label className="input-label">Save to Variable</label>
                            <input
                                value={(config.variableName as string) || ''}
                                onChange={(e) => updateConfig('variableName', e.target.value)}
                                className="input-field"
                                placeholder="user_name"
                            />
                        </div>
                        <div>
                            <label className="input-label">Validation (regex, optional)</label>
                            <input
                                value={(config.validation as string) || ''}
                                onChange={(e) => updateConfig('validation', e.target.value)}
                                className="input-field font-mono text-xs"
                                placeholder="^[a-zA-Z ]+$"
                            />
                        </div>
                    </>
                )}

                {/* ======================== CONDITION ======================== */}
                {nodeType === 'CONDITION' && (
                    <>
                        <div>
                            <label className="input-label">Left Operand</label>
                            <input
                                value={(config.leftOperand as string) || ''}
                                onChange={(e) => updateConfig('leftOperand', e.target.value)}
                                className="input-field"
                                placeholder="{{user_choice}}"
                            />
                        </div>
                        <div>
                            <label className="input-label">Operator</label>
                            <select
                                value={(config.operator as string) || 'equals'}
                                onChange={(e) => updateConfig('operator', e.target.value)}
                                className="input-field"
                            >
                                <option value="equals">Equals</option>
                                <option value="not_equals">Not Equals</option>
                                <option value="contains">Contains</option>
                                <option value="greater_than">Greater Than</option>
                                <option value="less_than">Less Than</option>
                                <option value="regex_match">Regex Match</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Right Operand</label>
                            <input
                                value={(config.rightOperand as string) || ''}
                                onChange={(e) => updateConfig('rightOperand', e.target.value)}
                                className="input-field"
                                placeholder="yes"
                            />
                        </div>
                    </>
                )}

                {/* ======================== DELAY ======================== */}
                {nodeType === 'DELAY' && (
                    <div>
                        <label className="input-label">Delay (seconds)</label>
                        <input
                            type="number"
                            value={(config.delaySeconds as number) || 5}
                            onChange={(e) => updateConfig('delaySeconds', parseInt(e.target.value))}
                            className="input-field"
                            min={1}
                            max={86400}
                        />
                    </div>
                )}

                {/* ======================== API ======================== */}
                {nodeType === 'API' && (
                    <>
                        <div>
                            <label className="input-label">Method</label>
                            <select
                                value={(config.method as string) || 'GET'}
                                onChange={(e) => updateConfig('method', e.target.value)}
                                className="input-field"
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="input-label">URL</label>
                            <input
                                value={(config.url as string) || ''}
                                onChange={(e) => updateConfig('url', e.target.value)}
                                className="input-field"
                                placeholder="https://api.example.com/data"
                            />
                        </div>
                        <div>
                            <label className="input-label">Request Body (JSON)</label>
                            <textarea
                                value={(config.body as string) || ''}
                                onChange={(e) => updateConfig('body', e.target.value)}
                                className="input-field font-mono text-xs"
                                rows={4}
                                placeholder='{"key": "value"}'
                            />
                        </div>
                        <div>
                            <label className="input-label">Save Response to Variable</label>
                            <input
                                value={(config.responseVariable as string) || ''}
                                onChange={(e) => updateConfig('responseVariable', e.target.value)}
                                className="input-field"
                                placeholder="api_result"
                            />
                        </div>
                    </>
                )}

                {/* ======================== AI ======================== */}
                {nodeType === 'AI' && (
                    <>
                        <div>
                            <label className="input-label">System Prompt</label>
                            <textarea
                                value={(config.systemPrompt as string) || ''}
                                onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                                className="input-field"
                                rows={4}
                                placeholder="You are a helpful customer service agent..."
                            />
                        </div>
                        <div>
                            <label className="input-label">User Message Template</label>
                            <textarea
                                value={(config.userMessage as string) || ''}
                                onChange={(e) => updateConfig('userMessage', e.target.value)}
                                className="input-field"
                                rows={3}
                                placeholder="User asked: {{last_message}}"
                            />
                        </div>
                        <div>
                            <label className="input-label">Max Tokens</label>
                            <input
                                type="number"
                                value={(config.maxTokens as number) || 500}
                                onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
                                className="input-field"
                                min={50}
                                max={4000}
                            />
                        </div>
                        <div>
                            <label className="input-label">Save Response to Variable</label>
                            <input
                                value={(config.responseVariable as string) || ''}
                                onChange={(e) => updateConfig('responseVariable', e.target.value)}
                                className="input-field"
                                placeholder="ai_response"
                            />
                        </div>
                    </>
                )}

                {/* ======================== LOOP ======================== */}
                {nodeType === 'LOOP' && (
                    <>
                        <div>
                            <label className="input-label">Array Variable</label>
                            <input
                                value={(config.arrayVariable as string) || ''}
                                onChange={(e) => updateConfig('arrayVariable', e.target.value)}
                                className="input-field"
                                placeholder="{{items}}"
                            />
                        </div>
                        <div>
                            <label className="input-label">Item Variable Name</label>
                            <input
                                value={(config.itemVariable as string) || ''}
                                onChange={(e) => updateConfig('itemVariable', e.target.value)}
                                className="input-field"
                                placeholder="current_item"
                            />
                        </div>
                        <div>
                            <label className="input-label">Max Iterations</label>
                            <input
                                type="number"
                                value={(config.maxIterations as number) || 10}
                                onChange={(e) => updateConfig('maxIterations', parseInt(e.target.value))}
                                className="input-field"
                                min={1}
                                max={100}
                            />
                        </div>
                    </>
                )}

                {/* ======================== END ======================== */}
                {nodeType === 'END' && (
                    <div>
                        <label className="input-label">Farewell Message (optional)</label>
                        <textarea
                            value={(config.message as string) || ''}
                            onChange={(e) => updateConfig('message', e.target.value)}
                            className="input-field"
                            rows={3}
                            placeholder="Thank you! Goodbye."
                        />
                    </div>
                )}

                {/* ======================== GOTO_SUBFLOW ======================== */}
                {nodeType === 'GOTO_SUBFLOW' && (
                    <div>
                        <label className="input-label">Target Subflow</label>
                        <select
                            value={(config.targetFlowId as string) || ''}
                            onChange={(e) => updateConfig('targetFlowId', e.target.value)}
                            className="input-field"
                        >
                            <option value="">— Select a subflow —</option>
                            {subflows.map((sf) => (
                                <option key={sf._id} value={sf._id}>
                                    {sf.name}
                                </option>
                            ))}
                        </select>
                        {subflows.length === 0 && (
                            <p className="text-xs text-surface-500 mt-1 italic">No subflows available. Create a subflow first.</p>
                        )}
                    </div>
                )}

                {/* Node ID */}
                <div className="pt-2 border-t border-surface-200 dark:border-surface-700">
                    <p className="text-xs text-surface-400 font-mono truncate">ID: {node.id}</p>
                </div>
            </div>

            {/* Delete */}
            {nodeType !== 'START' && (
                <div className="p-4 border-t border-surface-200 dark:border-surface-700">
                    <button
                        onClick={() => onDelete(node.id)}
                        className="w-full btn-danger flex items-center justify-center gap-2 text-sm"
                    >
                        <Trash2 className="w-4 h-4" /> Delete Node
                    </button>
                </div>
            )}
        </div>
    );
}
