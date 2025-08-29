# StackGuard Smart Contract

Clarity smart contract for storing and retrieving threat intelligence on the Stacks blockchain.

## Contract Functions

### Public Functions

#### `store-threat-report`
Store a new threat report (AI service only).

**Parameters:**
- `target-address` (principal) - Address being reported
- `risk-score` (uint) - Risk score 0-10
- `severity` (string-ascii 20) - CRITICAL, HIGH, MEDIUM, LOW  
- `threat-category` (string-ascii 30) - Type of threat
- `confidence-level` (uint) - Confidence 0-100

#### `update-ai-service`
Update the authorized AI service address (admin only).

### Read-Only Functions

#### `get-threat-report`
Get threat report for a specific address.

#### `get-report-by-id`
Get report by sequential ID.

#### `get-total-reports`
Get total number of reports.

## Deployment

```bash
clarinet console
(contract-deploy 'security-monitor)
```

## Testing

```bash
clarinet test
```
