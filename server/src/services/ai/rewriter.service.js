/**
 * Rewrite a conversational question into a standalone
 * search query.
 *
 * Example:
 *
 * Conversation:
 * "What movies are in Phase 5?"
 * "The Marvels and Deadpool & Wolverine."
 *
 * Current:
 * "Which one was released first?"
 *
 * Result:
 * "Which Phase 5 Marvel movie was released first?"
 */

async function rewriteQuery(
  query,
  conversationHistory,
  groqClient
) {
  try {
    // No history means the question is already standalone
    if (
      !conversationHistory ||
      conversationHistory.length === 0
    ) {
      return query;
    }

    const historyText =
      conversationHistory
        .map(
          (message) =>
            `${message.role}: ${message.content}`
        )
        .join('\n');

    const systemPrompt = `
You are a search query rewriting assistant.

Your job is to convert the user's latest question
into a standalone search query that can be understood
without seeing the conversation history.

Use the conversation history to resolve references such as:

- it
- this
- that
- they
- them
- the first one
- the second one
- that movie
- that person

Rules:

1. Preserve the user's original intent.
2. Do not answer the question.
3. Do not add information that is not supported
   by the conversation.
4. Return ONLY the rewritten search query.
5. If the question is already standalone,
   return it unchanged.
`;

    const userPrompt = `
Conversation history:

${historyText}

Latest user question:

${query}

Standalone search query:
`;

    const response =
      await groqClient.chat.completions.create({
        model: 'openai/gpt-oss-120b',

        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],

        temperature: 0,

        max_tokens: 100,
      });

    const rewrittenQuery =
      response.choices?.[0]?.message?.content?.trim();

    return rewrittenQuery || query;
  } catch (error) {
    console.error(
      'Query rewriting failed:',
      error.message
    );

    // Important production behavior:
    // If rewriting fails, don't break RAG.
    // Fall back to the original question.
    return query;
  }
}

module.exports = {
  rewriteQuery,
};