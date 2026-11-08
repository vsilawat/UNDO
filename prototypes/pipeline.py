"""
pipeline.py: the six stations a scam case goes through.
Owner: Vasu. Each station is one function: case file in, case file out.
"""
import re
import uuid
from datetime import datetime

CONFIDENCE_FLOOR = 0.6  # below this, the app says "I'm not sure"


def note(case, text):
    """Write one line in the case's timeline."""
    case["log"].append({"time": datetime.now().strftime("%H:%M:%S"), "text": text})


# STATION 1: Intake. Start a new case file.
def intake(message):
    case = {
        "id": str(uuid.uuid4())[:8],
        "raw_message": message,
        "scrubbed_message": "",
        "scam_type": "unknown",
        "confidence": 0.0,
        "is_scam": None,  # None means "I'm not sure"
        "red_flags": [],
        "next_steps": [],
        "assets": {
            "Bank account": "safe",
            "Debit/credit card": "safe",
            "Phone number / SIM": "safe",
            "Email account": "safe",
        },
        "transactions": [],
        "total_at_risk": 0,
        "recommendation": "monitor",
        "log": [],
    }
    note(case, "Case opened.")
    return case


# STATION 2: Scrub. Black out private details.
def scrub(case):
    text = case["raw_message"]
    text = re.sub(r"[\w.+-]+@[\w-]+\.[\w.]+", "[EMAIL]", text)
    text = re.sub(r"\+?\d[\d\s().-]{8,}\d", "[PHONE]", text)
    text = re.sub(r"\b\d{6,}\b", "[NUMBER]", text)
    case["scrubbed_message"] = text
    note(case, "Private details removed from the message.")
    return case


# STATION 3: Classify. Does it look like a scam, and how sure are we?
# TODO (Vasu): replace this simple word-checker with the T-Mobile baseline classifier.
SCAM_WORDS = ["urgent", "suspended", "verify", "gift card", "click", "prize",
              "account locked", "act now", "winner", "refund"]


def classify(case):
    text = case["scrubbed_message"].lower()
    hits = [w for w in SCAM_WORDS if w in text]
    confidence = min(0.5 + 0.15 * len(hits), 0.95) if hits else 0.7
    is_scam = len(hits) > 0

    case["scam_type"] = "phishing" if is_scam else "none"
    case["confidence"] = confidence
    case["red_flags"] = hits
    case["is_scam"] = None if confidence < CONFIDENCE_FLOOR else is_scam

    if case["is_scam"] is False:
        case["next_steps"] = ["This looks fine. If you're still unsure, call the company using the number on your bill."]
    else:
        case["next_steps"] = [
            "Don't click any links and don't reply.",
            "Forward the text to 7726 (that's SPAM on your keypad).",
            "Contact the company using the number on your bill or card, not the one in the message.",
        ]
    note(case, f"Checked message: {case['scam_type']} ({int(confidence * 100)}% sure).")
    return case


# STATION 4: Scope. What did the person do? That decides what's in danger.
SCOPE_RULES = {
    "clicked_link": {"Email account": "at risk", "Phone number / SIM": "at risk"},
    "shared_code": {"Phone number / SIM": "compromised", "Email account": "at risk"},
    "shared_password": {"Email account": "compromised", "Bank account": "at risk"},
    "sent_money": {"Bank account": "compromised", "Debit/credit card": "at risk"},
}


def apply_action(case, action):
    for asset, status in SCOPE_RULES[action].items():
        if case["assets"][asset] != "locked":
            case["assets"][asset] = status
    note(case, f"Person said: {action.replace('_', ' ')}. Checklist updated.")
    return case


# STATION 5: Money trace. Flag suspicious payments.
# TODO (Vasu): swap FAKE_TRANSACTIONS for real data from the Capital One Nessie practice API.
FAKE_TRANSACTIONS = [
    {"date": "Nov 6", "payee": "Grocery Store", "amount": 54.20},
    {"date": "Nov 6", "payee": "Coffee Shop", "amount": 6.75},
    {"date": "Nov 7", "payee": "Gift Card Express", "amount": 400.00},
    {"date": "Nov 7", "payee": "Crypto Wire Service", "amount": 250.00},
]


def trace_money(case, transactions=None):
    transactions = transactions or FAKE_TRANSACTIONS
    risky = re.compile(r"gift|wire|crypto|zelle|venmo", re.I)
    for t in transactions:
        t["flagged"] = t["amount"] >= 100 and bool(risky.search(t["payee"]))
    case["transactions"] = transactions
    case["total_at_risk"] = sum(t["amount"] for t in transactions if t["flagged"])
    case["recommendation"] = "dispute" if case["total_at_risk"] > 0 else "monitor"
    note(case, f"Money check done. ${case['total_at_risk']:.2f} looks suspicious.")
    return case


# STATION 6: Report. Write everything up so the person can hand it to a bank or police.
def build_report(case):
    lines = [
        f"INCIDENT REPORT {case['id']}",
        f"Scam type: {case['scam_type']} ({int(case['confidence'] * 100)}% sure)",
        "",
        "AFFECTED ITEMS",
    ]
    lines += [f"- {name}: {status}" for name, status in case["assets"].items()]
    lines += ["", f"SUSPICIOUS PAYMENTS (total ${case['total_at_risk']:.2f})"]
    lines += [f"- {t['date']}: ${t['amount']:.2f} to {t['payee']}"
              for t in case["transactions"] if t["flagged"]]
    lines += ["", "TIMELINE"]
    lines += [f"- {e['time']}: {e['text']}" for e in case["log"]]
    return "\n".join(lines)


def open_case(message):
    """Run stations 1 to 3 in one go."""
    return classify(scrub(intake(message)))
