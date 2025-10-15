Overview
The Zoominfo APIs Model Context Protocol (MCP) server enables AI-powered code editors like Cursor and Windsurf, plus general-purpose tools like Claude Desktop, to interact directly with your Zoominfo APIs API and documentation.

What is MCP?
Model Context Protocol (MCP) is an open standard that allows AI applications to securely access external data sources and tools. The Zoominfo APIs MCP server provides AI agents with:

Direct API access to Zoominfo APIs functionality
Documentation search capabilities
Real-time data from your Zoominfo APIs account
Code generation assistance for Zoominfo APIs integrations
Zoominfo APIs MCP Server Setup
Zoominfo APIs hosts a remote MCP server at https://docs.zoominfo.com/mcp. Configure your AI development tools to connect to this server. If your APIs require authentication, you can pass in headers via query parameters or however headers are configured in your MCP client.

CursorWindsurfClaude Desktop
Add to ~/.cursor/mcp.json:

JSON

{
  "mcpServers": {
    "zoominfoenterprise": {
      "url": "https://docs.zoominfo.com/mcp"
    }
  }
}
Testing Your MCP Setup
Once configured, you can test your MCP server connection:

Open your AI editor (Cursor, Windsurf, etc.)
Start a new chat with the AI assistant
Ask about Zoominfo APIs - try questions like:
"How do I [common use case]?"
"Show me an example of [API functionality]"
"Create a [integration type] using Zoominfo APIs"
The AI should now have access to your Zoominfo APIs account data and documentation through the MCP server.

Use the ZoomInfo connector to integrate ZoomInfo’s comprehensive B2B database with your AI assistant. This connection allows you to bring high-quality company and contact data directly into AI-powered conversations for personalized business intelligence.

With the connector, you can ask natural-language questions like:

Sales: “Find all VP-level contacts at tech companies in San Francisco with 100–500 employees.”
Marketing: “Show me fast-growing SaaS companies in the Northeast that raised funding in the last 2 years.”
Recruiting: “Identify senior engineering managers at Fortune 500 companies with LinkedIn profiles.”
Business Development: “Give me ZoomInfo’s competitor profiles with revenue and employee growth trends.”
Requirements
Before setup, make sure you meet the following:

ZoomInfo subscription: Co-Pilot, or legacy plan with API add-on
AI assistant subscription: A paid account (e.g., Claude Pro/Max/Team/Enterprise) that supports MCP (Model Context Protocol).
Compatible AI assistants: Claude and other MCP-enabled tools.
Authentication: Users must connect the assistant to the MCP using their ZoomInfo credentials.
Limits: Data usage follows ZoomInfo API limits and your subscription terms.
Supported Data
Contact Information
Names, job titles, emails, phone numbers
Departments, seniority, management levels
Company details, industries, experience
Validation dates, accuracy scores
Social media profiles, professional networks
Company Information
Company names, industries, descriptions
Revenue, employee count, growth metrics
Headquarters, phone numbers, websites
Subsidiaries and parent company structures
Leadership teams and decision-makers
Market intelligence and competitive insights
Setup Instructions
Step 1: Configure Your AI Assistant
Open Settings > Connectors (or Integrations).
Add a new MCP server connection.
Enter ZoomInfo MCP server URL: https://mcp.zoominfo.com/mcp
Save the configuration.
Step 2: Authenticate with ZoomInfo
Select Connect to ZoomInfo in your AI assistant.
Log in with your ZoomInfo username/password.
Approve the requested permissions.
You’ll be redirected back once connected.
Using the Connector
Enable it in conversations: Turn on the ZoomInfo connector under Tools/Connectors in your AI assistant.
Ask natural questions like:
“Find marketing directors at SaaS companies in the Bay Area.”
“Get me detailed information about Zoom Video Communications.”
“Show technology companies in Austin with 50–200 employees growing quickly.”
Review results:
Contacts include accuracy scores.
Companies show financial and leadership details.
Use results to drive sales, recruiting, or research actions.
Best Practices
Be specific: Add job titles, locations, industries, and company sizes.
Use accuracy scores: Focus on higher-scoring contacts for better outreach.
Combine search + enrichment: Start broad, then request deep profiles.
Respect limits: Stay within your ZoomInfo API quota.
Verify data: Double-check critical info before big decisions.
Disconnecting the Connector
Go to Settings > Connectors in your AI assistant.
Select ZoomInfo.
Click Disconnect or Remove.
Confirm the action.
Data & Privacy
Encryption: All data uses HTTPS.
Authentication: OAuth2 with industry-standard security.
Permissions: The connector respects your ZoomInfo role-based access.
No permanent storage: AI assistants do not store ZoomInfo data.
Auditing: All usage is logged in ZoomInfo’s logging framework.
Troubleshooting
Can’t connect? Check credentials, server access, and permissions.

No results? Try broader queries. Verify subscription covers the data type. Check API usage limits.

Authentication issues? Re-authenticate. Clear cache/cookies. Ensure your ZoomInfo account is active.

Limited data? Verify subscription tier. Some datasets require higher plans.

Supported AI Assistants
The ZoomInfo connector works with any AI assistant that supports MCP, including:

Claude (Anthropic)
Coming soon: Other MCP-compatible AI tools including GPT