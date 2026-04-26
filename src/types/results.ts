export type ResultContent = {
  type: 'text';
  text: string;
};

export type ToolResult =
  | { success: true; content: ResultContent[] }
  | { success: false; error: string };

export function successResult(text: string): ToolResult {
  return {
    success: true,
    content: [{ type: 'text', text }],
  };
}

export function errorResult(text: string): ToolResult {
  return {
    success: false,
    error: text,
  };
}
