---
sidebar_position: 2
---

# Agents

AI specialists that provide expert assistance for specific development tasks. Browse and install from **[aitmpl.com](https://aitmpl.com)**.

## 🤖 What are Agents?

Agents are specialized AI assistants that understand specific domains and provide expert-level guidance. Each agent is trained on best practices for their area of expertise.

## Installation

### 📦 Basic Installation

Install this component locally in your project. Works with your existing Claude Code setup.

```bash
npx claude-code-templates@latest --agent development/frontend-developer --yes
```

### 🌍 Global Agent (Claude Code SDK)

Create a global AI agent accessible from anywhere with zero configuration. Perfect for automation and CI/CD workflows.

```bash
npx claude-code-templates@latest --create-agent development/frontend-developer
```

After installation, use from anywhere:

```bash
frontend-developer "your prompt here"
```

✅ Works in scripts, CI/CD, npm tasks  
✅ Auto-detects project context  
✅ Powered by Claude Code SDK

### ☁️ Run in E2B Sandbox (Cloud Execution)

**NEW** Execute Claude Code with this component in an isolated cloud environment using E2B. Perfect for testing complex projects without affecting your local system.

#### 🔑 Setup API Keys

Add to your `.env` file:

```bash
ANTHROPIC_API_KEY=your_anthropic_key_here
# Required for Claude Code access
E2B_API_KEY=your_e2b_key_here
```

[Get Anthropic API Key](https://console.anthropic.com/) | [Get E2B API Key](https://e2b.dev/)

```bash
npx claude-code-templates@latest --sandbox e2b --agent development/frontend-developer --prompt "your development task"
```

☁️ Isolated cloud environment  
🔧 Full development tools  
📊 Real-time execution output

**Requirements:**
• Valid E2B API key  
• Internet connection  
• Claude Code v1.0.0+

## 📁 Agent Categories

Browse agents by specialty area to find the right expert for your needs:

### Development

Frontend, backend, and mobile development specialists. Examples: `frontend-developer` for React expertise, `backend-developer` for API development, `mobile-developer` for React Native and Flutter.

### Security

Security auditing, penetration testing, and compliance experts. Examples: `security-auditor` for vulnerability assessment, `penetration-tester` for security testing, `compliance-specialist` for regulatory requirements.

### Data & AI

Data science, machine learning, and AI specialists. Examples: `data-scientist` for data analysis, `ml-engineer` for model development, `nlp-engineer` for text processing.

### Performance Testing

Optimization and performance analysis experts. Examples: `performance-engineer` for system optimization, `react-performance-optimization` for React apps, `load-testing-specialist` for stress testing.

### Business

Strategy, analysis, and business development specialists. Examples: `product-strategist` for product planning, `business-analyst` for requirements analysis, `legal-advisor` for compliance guidance.

## 🎯 How to Choose an Agent

Select agents based on your current needs and project context:

### By Technology Stack

- **React projects**: Choose `frontend-developer` for component optimization and best practices
- **API development**: Use `backend-developer` for server architecture and database design
- **Mobile apps**: Select `mobile-developer` for React Native or Flutter guidance
- **Data projects**: Pick `data-scientist` for analysis and visualization

### By Project Phase

- **Starting new project**: Begin with `fullstack-developer` for overall architecture guidance
- **Development phase**: Add specific agents like `frontend-developer` or `backend-developer`
- **Pre-launch preparation**: Include `security-auditor` for vulnerability assessment
- **Production optimization**: Use `performance-engineer` for system tuning

### By Current Challenges

- **Performance issues**: Choose from `performance-testing/*` specialists
- **Security concerns**: Select appropriate `security/*` experts
- **Data analysis needs**: Pick from `data-ai/*` specialists
- **Feature development**: Use `development/*` agents for coding guidance

## 💡 Pro Tips

- **Start with one agent** for your main technology stack
- **Add security agents** before production
- **Use performance agents** when optimizing
- **Browse [aitmpl.com](https://aitmpl.com)** for the complete list

---

**Find more agents:** [Browse all agents on aitmpl.com](https://aitmpl.com) → Filter by "Agents"
