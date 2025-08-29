// Simple anomaly detection logic (demo-ready)

function compute_risk_score(amount, frequency, recipients) {
  let score = 0;

  // High-value transaction risk
  if (amount > 1000) score += 4;
  else if (amount > 100) score += 2;

  // High-frequency activity risk
  if (frequency > 10) score += 4;
  else if (frequency > 5) score += 2;

  // Multiple recipients risk
  if (recipients > 5) score += 3;
  else if (recipients > 2) score += 1;

  return Math.min(score, 10);
}

function determineSeverity(riskScore) {
  if (riskScore >= 8) return "CRITICAL";
  if (riskScore >= 6) return "HIGH";
  if (riskScore >= 4) return "MEDIUM";
  return "LOW";
}

function determineCategory({ amount, frequency, recipients }) {
  if (frequency > 10) return "RAPID-TRANSFERS";
  if (amount > 1000) return "HIGH-VALUE";
  if (recipients > 5) return "MULTI-RECIPIENT";
  return "REGULAR";
}

function calculateConfidence(riskScore) {
  if (riskScore >= 8) return 95;
  if (riskScore >= 6) return 85;
  if (riskScore >= 4) return 75;
  return 65;
}

const analyze = async (req, res) => {
  try {
    const { 
      amount = 0, 
      frequency = 0, 
      recipients = 1,
      memo = "",
      sender = ""
    } = req.body;

    const riskScore = compute_risk_score(amount, frequency, recipients);
    const response = {
      risk_score: riskScore,
      severity: determineSeverity(riskScore),
      threat_category: determineCategory({ amount, frequency, recipients }),
      confidence_level: calculateConfidence(riskScore),
      threat_detected: riskScore >= 7,
      recommendations: riskScore >= 8 
        ? "Immediate action required" 
        : riskScore >= 6 
        ? "Monitor closely" 
        : riskScore >= 4
        ? "Review transaction"
        : "No action needed",
      timestamp: new Date().toISOString(),
      analysis_details: {
        amount_risk: amount > 1000 ? "HIGH" : amount > 100 ? "MEDIUM" : "LOW",
        frequency_risk: frequency > 10 ? "HIGH" : frequency > 5 ? "MEDIUM" : "LOW",
        recipients_risk: recipients > 5 ? "HIGH" : recipients > 2 ? "MEDIUM" : "LOW"
      }
    };

    console.log(`Analysis for sender ${sender}: Risk Score ${riskScore}, Threat: ${response.threat_detected}`);
    res.status(200).json(response);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};

export default analyze;
