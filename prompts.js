import { ETHERSCAN_SAFE_CONTRACT_ANALYSIS_KNOWLEDGE_BASE, ETHERSCAN_SCAM_CONTRACT_ANALYSIS_KNOWLEDGE_BASE } from './knowledgeBase.js';

export const tradingAnalystPrompt = `
# Trading Analyst Prompt Development Guide

This guide outlines how to develop an effective prompt for a crypto trading analyst AI agent.

## Core Components

1. Role Definition
- Define the AI as an expert crypto trading analyst
- Specify key areas of expertise (technical analysis, market psychology, blockchain)
- Set clear mission/purpose

2. Analysis Framework
- Create a rating scale (e.g. 0-100)
- Define rating categories (Strong Sell to Strong Buy)
- Set clear thresholds for each category

3. Critical Rules
- Include market-specific rules (e.g. ATH considerations)
- Add modifiers for key scenarios (support zones, dips)
- Define risk management guidelines

4. Analysis Factors
- List key factors to evaluate
- Assign weights to each factor
- Include scoring criteria
- Cover both technical and fundamental aspects

5. Output Format
- Use consistent formatting with clear sections
- Include key metrics and ratings
- Provide actionable insights
- Add risk disclaimers

## Example Implementation

See the original prompt for a detailed implementation example. Key sections to include:
- System prompt definition
- Analysis framework
- Weighted factors
- Formatted output structure
`;

export const researchAgentPrompt = `
# Research Agent Prompt Development Guide

This guide demonstrates how to create an effective prompt for a crypto research AI agent.

## Core Components

1. Role Definition
- Position the AI as an expert researcher
- Define key knowledge areas
- Set research objectives

2. Research Framework
- Create comprehensive research categories
- Assign importance weights
- Define evaluation criteria

3. Analysis Categories
- Project overview
- Team analysis
- Technology assessment
- Tokenomics
- Market analysis
- Community metrics
- Regulatory aspects
- Risk evaluation

4. Output Structure
- Executive summary
- Detailed analysis sections
- Investment thesis
- Risk/reward assessment
- Final rating system

## Example Implementation

See the original prompt for a detailed implementation example showing how to structure:
- Project analysis framework
- Weighted evaluation criteria
- Formatted report template
`;

export const twitterAnalystPrompt = `
# Social Media Analyst Prompt Development Guide

This guide shows how to develop an AI prompt for social media sentiment analysis.

## Core Components

1. Role Specification
- Define expertise in social sentiment
- Set analysis objectives
- Specify data sources

2. Analysis Framework
- Sentiment classification
- Popularity metrics
- Price impact assessment
- Key observation criteria

3. Output Format
- Quantitative ratings
- Key observations
- Risk/opportunity analysis
- Summary insights

## Example Implementation

See the original prompt for a detailed example of:
- Sentiment analysis structure
- Rating systems
- Report formatting
`;

export const contractAnalystPrompt = `
# Smart Contract Analyst Prompt Development Guide

This guide demonstrates how to create an AI prompt for smart contract analysis.

## Core Components

1. Role Definition
- Specify expertise (Solidity, ERC standards)
- Define analysis purpose
- Set security focus

2. Knowledge Base Integration
- Reference security patterns
- Include scam indicators
- Define comparison methodology

3. Analysis Framework
- Safety rating system
- Contract assessment criteria
- Risk evaluation metrics
- Tokenomics analysis

4. Output Structure
- Safety ratings
- Technical analysis
- Risk assessment
- Actionable insights

5. Critical Elements
- Knowledge base application
- Pattern matching
- Risk identification
- Security recommendations

## Example Implementation

See the original prompt for a detailed example showing:
- Safety rating implementation
- Analysis framework
- Report structure
- Risk assessment methodology
`;