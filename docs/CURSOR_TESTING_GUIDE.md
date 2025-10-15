# ZoomInfo MCP Testing Guide for Cursor Agent

**Purpose:** Test the ZoomInfo MCP connector, explore data structure, and document results for REST API integration.

## Setup (User Action Required)

Before testing, ensure:
1. ✅ Cursor MCP config is at `~/.cursor/mcp.json` with:
   ```json
   {
     "mcpServers": {
       "zoominfoenterprise": {
         "url": "https://mcp.zoominfo.com/mcp"
       }
     }
   }
   ```
2. ✅ Restart Cursor to load the MCP server
3. ✅ Authenticate with ZoomInfo when prompted:
   - Username: `dany.alcazar@hellolanding.com`
   - Password: `Landing621!`

## Testing Tasks for Cursor Agent

Dear Cursor Agent, please help test our ZoomInfo MCP integration. Complete the following tasks and document your findings in `docs/ZOOMINFO_TEST_RESULTS.md`.

### Task 1: Verify MCP Connection

**Test:** Confirm ZoomInfo MCP is connected and authenticated.

**Ask ZoomInfo:**
```
Are you connected? Can you access ZoomInfo data?
```

**Document:**
- Is the connection working?
- Any authentication issues?
- What capabilities does the MCP report?

---

### Task 2: Search for Greystar Executives

**Test:** Find executive-level contacts at Greystar (a large real estate company).

**Ask ZoomInfo:**
```
Find all VP-level and executive contacts at Greystar.
Include: names, titles, emails, phone numbers, location, and department.
Limit to 10 results.
```

**Document in results file:**
1. How many contacts were returned?
2. Full JSON structure of at least 2 sample contacts
3. What fields are available? (email, phone, title, etc.)
4. Data quality - are emails/phones direct or generic?
5. Any accuracy scores or validation data?

---

### Task 3: Test Different Search Filters

**Test:** Understand what search capabilities are available.

**Ask ZoomInfo:**
```
Search for contacts with these criteria:
- Company: Any real estate company in California
- Title: Director or above
- Department: Operations or Property Management
- Company size: 500-5000 employees
Limit to 5 results and show me the full data structure.
```

**Document:**
1. What filter options worked?
2. Can you filter by: industry, location, company size, department, seniority?
3. How precise are the filters?
4. Sample results with full JSON

---

### Task 4: Company Data Exploration

**Test:** Understand company-level data available.

**Ask ZoomInfo:**
```
Get detailed company information for Greystar:
- Revenue, employee count, growth metrics
- Headquarters location
- Industry classification
- Leadership team
- Key decision makers
```

**Document:**
1. What company fields are available?
2. Is financial data (revenue, funding) included?
3. Can you get org charts or reporting structures?
4. Full JSON structure of company data

---

### Task 5: Bulk Search Capability

**Test:** Can we fetch multiple contacts at once?

**Ask ZoomInfo:**
```
Find 25 contacts across real estate companies that match:
- Title contains: "Vice President", "VP", or "Director"
- Focus areas: Operations, Property Management, Asset Management
- Located in: Texas, California, or Florida
Show me how the results are structured.
```

**Document:**
1. Maximum results per query?
2. Are results paginated?
3. Performance - how fast?
4. Any rate limits mentioned?

---

### Task 6: Data Accuracy & Validation

**Test:** Understand data quality indicators.

**Ask ZoomInfo:**
```
For the contacts you find at Greystar, what accuracy or confidence scores are available?
How recently was the data verified?
```

**Document:**
1. What quality metrics exist? (accuracy scores, last verified date, etc.)
2. How should we prioritize high-quality leads?
3. Are there "premium" vs "basic" data tiers?

---

### Task 7: API Usage & Limits

**Test:** Understand usage constraints.

**Ask ZoomInfo:**
```
What are the rate limits or usage quotas for this ZoomInfo account?
How many API calls can we make per day/month?
```

**Document:**
1. Daily/monthly quotas
2. Rate limiting details
3. What happens when limits are hit?
4. Any cost per contact/search?

---

## Output Format

Please create a new file: `docs/ZOOMINFO_TEST_RESULTS.md` with the following structure:

```markdown
# ZoomInfo MCP Test Results

**Test Date:** [DATE]
**Tester:** Cursor Agent
**ZoomInfo Account:** dany.alcazar@hellolanding.com

## Connection Status
[Results from Task 1]

## Greystar Executive Search Results
[Results from Task 2 - include sample JSON]

## Search Filter Capabilities
[Results from Task 3]

## Company Data Structure
[Results from Task 4]

## Bulk Search Results
[Results from Task 5]

## Data Quality Metrics
[Results from Task 6]

## Usage Limits & Quotas
[Results from Task 7]

## Key Findings Summary

### Best Data Fields for Our Use Case
- Contact fields we should prioritize: [list]
- Company fields we should prioritize: [list]

### Search Strategy Recommendations
- Most effective filters: [list]
- Fields to always request: [list]
- Quality indicators to check: [list]

### Integration Considerations
- Rate limits to respect: [details]
- Pagination approach: [details]
- Error handling needed for: [list]

## Sample JSON Structures

### Contact Object
\`\`\`json
[Full example of a contact object]
\`\`\`

### Company Object
\`\`\`json
[Full example of a company object]
\`\`\`

### Search Response
\`\`\`json
[Full example of search response with metadata]
\`\`\`

## Recommendations for REST API Integration

Based on these results, when we implement the REST API client, we should:
1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]
```

## After Testing - Next Steps

Once testing is complete:

1. **Review Results** - Connor and I will review `ZOOMINFO_TEST_RESULTS.md`
2. **Update REST Client** - Modify `lib/zoominfoClient.ts` to match actual data structure
3. **Update API Endpoints** - Adjust `pages/api/zoominfo/fetchContacts.ts` based on findings
4. **Update Supabase Schema** - Add any missing fields to `leads_raw` table
5. **Create Phase I Test** - Build a real test with Greystar data

## Questions to Answer

As you test, try to answer:
- ✅ Does ZoomInfo MCP return better data than we expected?
- ✅ What fields are most valuable for sales prioritization?
- ✅ Should we filter by accuracy score? What's the threshold?
- ✅ Can we get enough contacts for daily batch jobs?
- ✅ What's the best search strategy for real estate supply contacts?

---

**Thank you, Cursor Agent!** Your findings will help us build a robust ZoomInfo integration.
