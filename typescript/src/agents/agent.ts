import { ConversationMessage } from "../types";
import { AccumulatorTransform } from "../utils/helpers";


export interface AgentProcessingResult {
  // The original input provided by the user
  userInput: string;

  // Unique identifier for the agent that processed the request
  agentId: string;

  // Human-readable name of the agent
  agentName: string;

  // Unique identifier for the user who initiated the request
  userId: string;

  // Unique identifier for the current session
  sessionId: string;

  // Additional parameters or metadata related to the processing result
  // Can store any key-value pairs of varying types
  additionalParams: Record<string, any>;
}

/**
 * Represents the response from an agent, including metadata and output.
 * @property metadata - Contains all properties of AgentProcessingResult except 'response'.
 * @property output - The actual content of the agent's response, either as a transform or a string.
 * @property streaming - Indicates whether the response is being streamed or not.
 */
export type AgentResponse = {
  metadata: Omit<AgentProcessingResult, 'response'>;
  output: AccumulatorTransform | string;
  streaming: boolean;
};

export interface AgentOptions {
  // The name of the agent
  name: string;

  // A description of the agent's purpose or capabilities
  description: string;

  // Optional: The ID of the model used by this agent
  // If not provided, a default model may be used
  modelId?: string;

  // Optional: The geographic region where the agent should be deployed or run
  region?: string;

  // Optional: Determines whether to save the chat, defaults to true
  saveChat?: boolean;

  // Optional: Logger instance
  // If provided, the agent will use this logger for logging instead of the default console
  logger?: any | Console;

  // Optional: Flag to enable/disable agent debug trace logging
  // If true, the agent will log additional debug information
  LOG_AGENT_DEBUG_TRACE?: boolean;
}

/**
 * Abstract base class for all agents in the Multi-Agent Orchestrator System.
 * This class defines the common structure and behavior for all agents.
 */
export abstract class Agent {
  /** The name of the agent. */
  name: string;

  /** The ID of the agent. */
  id: string;

  /** A description of the agent's capabilities and expertise. */
  description: string;

  /** Whether to save the chat or not. */
  saveChat: boolean;

  // Optional logger instance
  // If provided, the agent will use this logger for logging instead of the default console
  logger: any | Console = console

  // Flag to enable/disable agent debug trace logging
  // If true, the agent will log additional debug information
  LOG_AGENT_DEBUG_TRACE?: boolean;

  /**
   * Constructs a new Agent instance.
   * @param options - Configuration options for the agent.
   */
  constructor(options: AgentOptions) {
    this.name = options.name;
    this.id = this.generateKeyFromName(options.name);
    this.description = options.description;
    this.saveChat = options.saveChat ?? true;  // Default to true if not provided

    this.LOG_AGENT_DEBUG_TRACE = options.LOG_AGENT_DEBUG_TRACE ?? false;
    this.logger = options.logger ?? (this.LOG_AGENT_DEBUG_TRACE ? console : { info: () => {}, warn: () => {}, error: () => {}, debug: () => {}, log: () => {} });

  }

  /**
   * Generates a unique key from a given name string.
   *
   * The key is generated by performing the following operations:
   * 1. Removing all non-alphanumeric characters from the name.
   * 2. Replacing all whitespace characters (spaces, tabs, etc.) with a hyphen (-).
   * 3. Converting the resulting string to lowercase.
   *
   * @param name - The input name string.
   * @returns A unique key derived from the input name.
   */
  private generateKeyFromName(name: string): string {
    // Remove special characters and replace spaces with hyphens
    const key = name
      .replace(/[^a-zA-Z\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase();
    return key;
  }

/**
 * Abstract method to process a request.
 * This method must be implemented by all concrete agent classes.
 * 
 * @param inputText - The user input as a string.
 * @param chatHistory - An array of Message objects representing the conversation history.
 * @param additionalParams - Optional additional parameters as key-value pairs.
 * @returns A Promise that resolves to a Message object containing the agent's response.
 */
abstract processRequest(
  inputText: string,
  userId: string,
  sessionId: string,
  chatHistory: ConversationMessage[],
  additionalParams?: Record<string, string>
): Promise<ConversationMessage | AsyncIterable<any>>;

}
