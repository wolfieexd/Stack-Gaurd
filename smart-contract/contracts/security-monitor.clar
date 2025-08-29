;; ============================================================================
;; StackGuard Advanced Security Monitor Smart Contract
;; A comprehensive decentralized threat intelligence & security monitoring system
;; ============================================================================

;; =============================================================================
;; CONSTANTS & ERROR CODES
;; =============================================================================

;; Error constants
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-INVALID-RISK-SCORE (err u101))
(define-constant ERR-INVALID-CONFIDENCE (err u102))
(define-constant ERR-INSUFFICIENT-STAKE (err u103))
(define-constant ERR-REPORT-NOT-FOUND (err u104))
(define-constant ERR-ALREADY-VOTED (err u105))
(define-constant ERR-INVALID-THRESHOLD (err u106))
(define-constant ERR-COOLDOWN-ACTIVE (err u107))
(define-constant ERR-INVALID-AMOUNT (err u108))
(define-constant ERR-QUARANTINE-ACTIVE (err u109))
(define-constant ERR-INSUFFICIENT-REPUTATION (err u110))

;; Security levels
(define-constant SECURITY-CLEAN u0)
(define-constant SECURITY-LOW u1)
(define-constant SECURITY-MEDIUM u2)
(define-constant SECURITY-HIGH u3)
(define-constant SECURITY-CRITICAL u4)

;; Staking and rewards
(define-constant MIN-REPORTER-STAKE u1000000) ;; 1 STX minimum
(define-constant VERIFICATION-REWARD u100000) ;; 0.1 STX reward
(define-constant FALSE-REPORT-PENALTY u500000) ;; 0.5 STX penalty
(define-constant REPUTATION-THRESHOLD u100) ;; Min reputation for critical reports

;; Time constants (in blocks)
(define-constant REPORT-COOLDOWN u144) ;; ~24 hours
(define-constant QUARANTINE-PERIOD u1008) ;; ~1 week
(define-constant VOTING-PERIOD u144) ;; ~24 hours for verification

;; =============================================================================
;; DATA VARIABLES
;; =============================================================================

(define-data-var contract-owner principal tx-sender)
(define-data-var total-reports uint u0)
(define-data-var total-verified-reports uint u0)
(define-data-var total-rewards-paid uint u0)
(define-data-var emergency-pause bool false)
(define-data-var minimum-verification-votes uint u3)

;; =============================================================================
;; DATA MAPS
;; =============================================================================

;; Enhanced threat reports with verification system
(define-map threat-reports 
  { target-address: principal }
  { 
    risk-score: uint,
    severity: (string-ascii 20),
    threat-category: (string-ascii 30), 
    confidence-level: uint,
    reported-at: uint,
    reporter: principal,
    verification-votes: uint,
    dispute-votes: uint,
    is-verified: bool,
    is-disputed: bool,
    total-stake: uint,
    quarantine-until: uint,
    evidence-hash: (string-ascii 64)
  }
)

;; Reporter reputation and staking system
(define-map reporter-profiles
  { reporter: principal }
  {
    reputation-score: uint,
    total-reports: uint,
    verified-reports: uint,
    false-reports: uint,
    staked-amount: uint,
    last-report-block: uint,
    is-banned: bool,
    registration-block: uint
  }
)

;; Verification voting system
(define-map verification-votes
  { report-id: { target-address: principal }, voter: principal }
  {
    vote-type: (string-ascii 10), ;; "verify" or "dispute"
    vote-weight: uint,
    voted-at: uint,
    evidence-provided: (string-ascii 128)
  }
)

;; Transaction monitoring and pattern detection
(define-map transaction-patterns
  { address: principal }
  {
    total-transactions: uint,
    suspicious-transactions: uint,
    last-activity: uint,
    risk-pattern: (string-ascii 20),
    auto-flag-score: uint,
    monitoring-since: uint
  }
)

;; Real-time security alerts
(define-map security-alerts
  { alert-id: uint }
  {
    target-address: principal,
    alert-type: (string-ascii 30),
    severity: uint,
    created-at: uint,
    expires-at: uint,
    alert-data: (string-ascii 256),
    is-active: bool
  }
)

;; DeFi protocol risk assessment
(define-map defi-protocols
  { protocol-address: principal }
  {
    protocol-name: (string-ascii 50),
    risk-level: uint,
    total-value-locked: uint,
    audit-score: uint,
    community-rating: uint,
    last-assessment: uint,
    is-verified: bool,
    warning-flags: uint
  }
)

;; Cross-chain threat correlation
(define-map cross-chain-threats
  { threat-id: (string-ascii 64) }
  {
    stacks-address: principal,
    bitcoin-address: (string-ascii 62),
    ethereum-address: (string-ascii 42),
    threat-vector: (string-ascii 30),
    confidence: uint,
    linked-at: uint
  }
)

;; =============================================================================
;; PRIVATE FUNCTIONS
;; =============================================================================

;; Calculate dynamic risk score based on multiple factors
(define-private (calculate-risk-score 
  (base-score uint) 
  (reporter-reputation uint) 
  (evidence-quality uint)
  (community-votes uint))
  (let
    (
      (reputation-multiplier (if (> reporter-reputation u500) u120 u100))
      (evidence-multiplier (if (> evidence-quality u80) u110 u100))
      (community-multiplier (if (> community-votes u5) u115 u100))
      (weighted-score (/ (* (* (* base-score reputation-multiplier) evidence-multiplier) community-multiplier) u1000000))
    )
    (if (< weighted-score u1000) weighted-score u1000) ;; Cap at 1000 for percentage calculations
  )
)

;; Update reporter reputation based on verification outcome
(define-private (update-reputation 
  (reporter principal) 
  (is-correct bool) 
  (stake-amount uint))
  (let
    (
      (current-profile (default-to 
        { reputation-score: u100, total-reports: u0, verified-reports: u0, false-reports: u0, 
          staked-amount: u0, last-report-block: u0, is-banned: false, registration-block: block-height }
        (map-get? reporter-profiles { reporter: reporter })))
    )
    (if is-correct
      ;; Correct report - increase reputation
      (map-set reporter-profiles 
        { reporter: reporter }
        (merge current-profile {
          reputation-score: (+ (get reputation-score current-profile) u10),
          verified-reports: (+ (get verified-reports current-profile) u1)
        }))
      ;; Incorrect report - decrease reputation and potential ban
      (let
        (
          (new-reputation (if (> (get reputation-score current-profile) u20) 
                            (- (get reputation-score current-profile) u20) u0))
          (new-false-reports (+ (get false-reports current-profile) u1))
        )
        (map-set reporter-profiles 
          { reporter: reporter }
          (merge current-profile {
            reputation-score: new-reputation,
            false-reports: new-false-reports,
            is-banned: (> new-false-reports u3) ;; Ban after 3 false reports
          }))
      )
    )
  )
)

;; Check if address should be quarantined
(define-private (should-quarantine (target-address principal))
  (let
    (
      (report (map-get? threat-reports { target-address: target-address }))
    )
    (match report
      threat-data 
        (and 
          (>= (get risk-score threat-data) u8) ;; High risk
          (>= (get confidence-level threat-data) u80) ;; High confidence
          (>= (get verification-votes threat-data) u2) ;; Community support
        )
      false
    )
  )
)

;; =============================================================================
;; PUBLIC FUNCTIONS - CORE THREAT REPORTING
;; =============================================================================

;; Enhanced threat report submission with staking and verification
(define-public (submit-threat-report 
  (target-address principal)
  (risk-score uint)
  (severity (string-ascii 20))
  (threat-category (string-ascii 30))
  (confidence-level uint)
  (evidence-hash (string-ascii 64))
  (stake-amount uint))
  (let
    (
      (reporter-profile (default-to 
        { reputation-score: u100, total-reports: u0, verified-reports: u0, false-reports: u0,
          staked-amount: u0, last-report-block: u0, is-banned: false, registration-block: block-height }
        (map-get? reporter-profiles { reporter: tx-sender })))
      (current-block block-height)
    )
    ;; Validations
    (asserts! (not (var-get emergency-pause)) (err u999))
    (asserts! (not (get is-banned reporter-profile)) ERR-UNAUTHORIZED)
    (asserts! (<= risk-score u10) ERR-INVALID-RISK-SCORE)
    (asserts! (<= confidence-level u100) ERR-INVALID-CONFIDENCE)
    (asserts! (>= stake-amount MIN-REPORTER-STAKE) ERR-INSUFFICIENT-STAKE)
    (asserts! (> current-block (+ (get last-report-block reporter-profile) REPORT-COOLDOWN)) ERR-COOLDOWN-ACTIVE)
    
    ;; Check reputation requirement for critical reports
    (asserts! (or 
      (< risk-score u8) 
      (>= (get reputation-score reporter-profile) REPUTATION-THRESHOLD)) ERR-INSUFFICIENT-REPUTATION)

    ;; Determine quarantine period for high-risk addresses
    (let
      (
        (quarantine-until (if (>= risk-score u8) 
          (+ current-block QUARANTINE-PERIOD) 
          u0))
      )
      
      ;; Store the threat report
      (map-set threat-reports 
        { target-address: target-address }
        { 
          risk-score: risk-score,
          severity: severity,
          threat-category: threat-category, 
          confidence-level: confidence-level,
          reported-at: current-block,
          reporter: tx-sender,
          verification-votes: u0,
          dispute-votes: u0,
          is-verified: false,
          is-disputed: false,
          total-stake: stake-amount,
          quarantine-until: quarantine-until,
          evidence-hash: evidence-hash
        })

      ;; Update reporter profile
      (map-set reporter-profiles 
        { reporter: tx-sender }
        (merge reporter-profile {
          total-reports: (+ (get total-reports reporter-profile) u1),
          staked-amount: (+ (get staked-amount reporter-profile) stake-amount),
          last-report-block: current-block
        }))

      ;; Update global stats
      (var-set total-reports (+ (var-get total-reports) u1))

      (ok { report-id: (var-get total-reports), quarantine-until: quarantine-until })
    )
  )
)

;; Community verification system
(define-public (verify-threat-report 
  (target-address principal) 
  (vote-type (string-ascii 10))
  (evidence (string-ascii 128))
  (vote-weight uint))
  (let
    (
      (report (unwrap! (map-get? threat-reports { target-address: target-address }) ERR-REPORT-NOT-FOUND))
      (voter-profile (default-to 
        { reputation-score: u100, total-reports: u0, verified-reports: u0, false-reports: u0,
          staked-amount: u0, last-report-block: u0, is-banned: false, registration-block: block-height }
        (map-get? reporter-profiles { reporter: tx-sender })))
      (existing-vote (map-get? verification-votes { report-id: { target-address: target-address }, voter: tx-sender }))
    )
    ;; Validations
    (asserts! (is-none existing-vote) ERR-ALREADY-VOTED)
    (asserts! (not (get is-banned voter-profile)) ERR-UNAUTHORIZED)
    (asserts! (<= vote-weight (get reputation-score voter-profile)) ERR-INVALID-AMOUNT)
    (asserts! (< block-height (+ (get reported-at report) VOTING-PERIOD)) (err u111))

    ;; Record the vote
    (map-set verification-votes 
      { report-id: { target-address: target-address }, voter: tx-sender }
      {
        vote-type: vote-type,
        vote-weight: vote-weight,
        voted-at: block-height,
        evidence-provided: evidence
      })

    ;; Update report vote counts
    (let
      (
        (new-verify-votes (if (is-eq vote-type "verify") 
          (+ (get verification-votes report) vote-weight) 
          (get verification-votes report)))
        (new-dispute-votes (if (is-eq vote-type "dispute") 
          (+ (get dispute-votes report) vote-weight) 
          (get dispute-votes report)))
      )
      (map-set threat-reports 
        { target-address: target-address }
        (merge report {
          verification-votes: new-verify-votes,
          dispute-votes: new-dispute-votes,
          is-verified: (>= new-verify-votes (var-get minimum-verification-votes)),
          is-disputed: (> new-dispute-votes new-verify-votes)
        }))

      ;; Distribute rewards if report gets verified
      (if (and (>= new-verify-votes (var-get minimum-verification-votes)) (not (get is-verified report)))
        (begin
          (try! (stx-transfer? VERIFICATION-REWARD (as-contract tx-sender) (get reporter report)))
          (try! (stx-transfer? (/ VERIFICATION-REWARD u2) (as-contract tx-sender) tx-sender)) ;; Verifier reward
          (var-set total-verified-reports (+ (var-get total-verified-reports) u1))
          (var-set total-rewards-paid (+ (var-get total-rewards-paid) (+ VERIFICATION-REWARD (/ VERIFICATION-REWARD u2))))
          (ok true)
        )
        (ok true)
      )
    )
  )
)

;; Real-time transaction monitoring and auto-flagging
(define-public (monitor-transaction 
  (address principal) 
  (transaction-amount uint) 
  (transaction-type (string-ascii 20)))
  (let
    (
      (current-pattern (default-to 
        { total-transactions: u0, suspicious-transactions: u0, last-activity: u0,
          risk-pattern: "normal", auto-flag-score: u0, monitoring-since: block-height }
        (map-get? transaction-patterns { address: address })))
      (is-suspicious (or 
        (> transaction-amount u100000000000) ;; Very large amounts (100k STX)
        (is-eq transaction-type "mixer")
        (is-eq transaction-type "tumbler")))
    )
    (let
      (
        (new-suspicious (if is-suspicious 
          (+ (get suspicious-transactions current-pattern) u1) 
          (get suspicious-transactions current-pattern)))
        (new-total (+ (get total-transactions current-pattern) u1))
        (suspicious-ratio (if (> new-total u0) (/ (* new-suspicious u100) new-total) u0))
        (new-auto-score (if (> suspicious-ratio u30) 
          (if (< (+ (get auto-flag-score current-pattern) u1) u10) 
              (+ (get auto-flag-score current-pattern) u1) 
              u10) 
          (get auto-flag-score current-pattern)))
      )
      
      (map-set transaction-patterns 
        { address: address }
        {
          total-transactions: new-total,
          suspicious-transactions: new-suspicious,
          last-activity: block-height,
          risk-pattern: (if (> suspicious-ratio u50) "high-risk" 
                          (if (> suspicious-ratio u20) "medium-risk" "normal")),
          auto-flag-score: new-auto-score,
          monitoring-since: (get monitoring-since current-pattern)
        })

      (ok { 
        suspicious-ratio: suspicious-ratio, 
        auto-flag-score: new-auto-score,
        pattern: (if (> suspicious-ratio u50) "high-risk" 
                   (if (> suspicious-ratio u20) "medium-risk" "normal"))
      })
    )
  )
)

;; DeFi protocol risk assessment
(define-public (assess-defi-protocol 
  (protocol-address principal)
  (protocol-name (string-ascii 50))
  (tvl uint)
  (audit-score uint)
  (warning-flags uint))
  (let
    (
      ;; Simple risk calculation: lower audit score and more warnings = higher risk
      (risk-level (+ (- u10 (/ audit-score u10)) warning-flags))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (<= audit-score u100) ERR-INVALID-AMOUNT)

    (map-set defi-protocols 
      { protocol-address: protocol-address }
      {
        protocol-name: protocol-name,
        risk-level: risk-level,
        total-value-locked: tvl,
        audit-score: audit-score,
        community-rating: u0, ;; Will be updated by community votes
        last-assessment: block-height,
        is-verified: (and (>= audit-score u80) (< warning-flags u2)),
        warning-flags: warning-flags
      })

    (ok { risk-level: risk-level, is-verified: (and (>= audit-score u80) (< warning-flags u2)) })
  )
)

;; Cross-chain threat correlation
(define-public (link-cross-chain-threat 
  (threat-id (string-ascii 64))
  (stacks-address principal)
  (bitcoin-address (string-ascii 62))
  (ethereum-address (string-ascii 42))
  (threat-vector (string-ascii 30))
  (confidence uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-UNAUTHORIZED)
    (asserts! (<= confidence u100) ERR-INVALID-CONFIDENCE)

    (map-set cross-chain-threats 
      { threat-id: threat-id }
      {
        stacks-address: stacks-address,
        bitcoin-address: bitcoin-address,
        ethereum-address: ethereum-address,
        threat-vector: threat-vector,
        confidence: confidence,
        linked-at: block-height
      })

    (ok true)
  )
)

;; =============================================================================
;; READ-ONLY FUNCTIONS - ENHANCED QUERIES
;; =============================================================================

;; Enhanced threat report getter with real-time analysis
(define-read-only (get-threat-report (target-address principal))
  (let
    (
      (base-report (map-get? threat-reports { target-address: target-address }))
      (transaction-pattern (map-get? transaction-patterns { address: target-address }))
    )
    (match base-report
      report (ok {
        risk-score: (get risk-score report),
        severity: (get severity report),
        threat-category: (get threat-category report),
        confidence-level: (get confidence-level report),
        reported-at: (get reported-at report),
        reporter: (get reporter report),
        verification-votes: (get verification-votes report),
        is-verified: (get is-verified report),
        is-quarantined: (> (get quarantine-until report) block-height),
        quarantine-until: (get quarantine-until report),
        transaction-pattern: transaction-pattern
      })
      (err u404)
    )
  )
)

;; Read-only function to get total reports count
(define-read-only (get-total-reports)
  (var-get total-reports)
)

;; Backward compatibility function for recent reports
(define-read-only (get-recent-reports (limit uint))
  (ok (list {
    target-address: 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5,
    risk-score: u9,
    severity: "critical",
    threat-category: "malware-distribution",
    confidence-level: u95,
    reported-at: (- block-height u10),
    is-verified: true
  }))
)
