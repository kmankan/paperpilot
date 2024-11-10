import { LLMService } from '../LLMService';
import { DEBUG } from '@/app/debug/debug';

export async function getIdeaTree(
  keyword: string, 
  paperContext: string
): Promise<{
  diagram: string;
  nodes: Array<{ id: string; label: string; }>;
}> {
  DEBUG.log('Generating idea tree for keyword:', { keyword });

  const prompt = `
    Create a simple Mermaid diagram showing key concepts related to "${keyword}".
    
    Use this exact format:
    graph LR
      A[${keyword}]
      B[Related Concept 1]
      C[Related Concept 2]
      D[Related Concept 3]
      
      A --> B
      A --> C
      A --> D

    Requirements:
    - Replace "Related Concept X" with actual concepts from the paper context
    - Keep the exact format but change only the text inside square brackets
    - Maintain the A, B, C, D node identifiers
    - Keep the exact arrow format with spaces: " --> "
    - Return only the diagram code, no additional text
  `;

  const llm = new LLMService();
  const response = await llm.generate(prompt, paperContext);
  
  DEBUG.log('Raw LLM Response:', response);

  // Validate and clean the response
  if (!response) {
    throw new Error('Empty response from LLM');
  }

  // Clean the response
  const cleanedResponse = response
    .replace(/```mermaid\n?/, '')
    .replace(/```/, '')
    .trim();

  DEBUG.log('Cleaned LLM Response:', cleanedResponse);

  // Comprehensive validation
  if (!cleanedResponse.includes('graph LR')) {
    throw new Error('Invalid diagram syntax: Missing "graph LR" declaration');
  }

  // Validate node definitions
  const nodeRegex = /([A-D])\[([^\]]+)\]/g;
  const nodes = [...cleanedResponse.matchAll(nodeRegex)].map(match => ({
    id: match[1],
    label: match[2]
  }));

  if (nodes.length === 0) {
    throw new Error('Invalid diagram syntax: No valid nodes found');
  }

  if (nodes.length < 2) {
    throw new Error('Invalid diagram structure: At least 2 nodes are required');
  }

  // Validate node IDs
  const expectedIds = ['A', 'B', 'C', 'D'];
  const missingIds = expectedIds.filter(id => 
    !nodes.some(node => node.id === id)
  );

  if (missingIds.length > 0) {
    throw new Error(`Invalid node IDs: Missing nodes ${missingIds.join(', ')}`);
  }

  // Validate relationships
  const relationshipRegex = /([A-D])\s+-->\s+([A-D])/g;
  const relationships = [...cleanedResponse.matchAll(relationshipRegex)];

  if (relationships.length === 0) {
    throw new Error('Invalid diagram syntax: No relationships found');
  }

  // Validate relationship format
  const invalidArrowFormat = /[A-D]-->[A-D]|[A-D]\s+-->[A-D]|[A-D]-->\s+[A-D]/g;
  if (cleanedResponse.match(invalidArrowFormat)) {
    throw new Error('Invalid relationship format: Arrows must have exactly one space before and after "-->"');
  }

  // Validate that all relationships reference existing nodes
  relationships.forEach(([_, source, target]) => {
    if (!nodes.some(node => node.id === source)) {
      throw new Error(`Invalid relationship: Source node "${source}" not found`);
    }
    if (!nodes.some(node => node.id === target)) {
      throw new Error(`Invalid relationship: Target node "${target}" not found`);
    }
  });

  // Validate root node (A) has the keyword
  const rootNode = nodes.find(node => node.id === 'A');
  if (!rootNode || !rootNode.label.includes(keyword)) {
    throw new Error('Invalid root node: Must contain the keyword');
  }

  DEBUG.log('Validation passed:', {
    nodeCount: nodes.length,
    relationshipCount: relationships.length
  });

  return {
    diagram: cleanedResponse,
    nodes
  };
}

//we need to refactor to inlcude the output from DictionaryDefinition