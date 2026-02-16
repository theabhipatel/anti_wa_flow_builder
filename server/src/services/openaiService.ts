import axios from 'axios';

interface IChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface IChatCompletionResponse {
    content: string;
    tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
    };
}

/**
 * Call OpenAI Chat Completion API
 */
export const chatCompletion = async (
    apiKey: string,
    model: string,
    messages: IChatMessage[],
    temperature: number = 0.7,
    maxTokens: number = 500
): Promise<IChatCompletionResponse> => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            }
        );

        const data = response.data;
        return {
            content: data.choices[0]?.message?.content || '',
            tokensUsed: {
                prompt: data.usage?.prompt_tokens || 0,
                completion: data.usage?.completion_tokens || 0,
                total: data.usage?.total_tokens || 0,
            },
        };
    } catch (error) {
        console.error('[OpenAI] Chat completion failed:', error);
        throw error;
    }
};

/**
 * Validate OpenAI API key by making a simple models list call
 */
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const response = await axios.get('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${apiKey}` },
            timeout: 10000,
        });
        return response.status === 200;
    } catch (error) {
        return false;
    }
};
